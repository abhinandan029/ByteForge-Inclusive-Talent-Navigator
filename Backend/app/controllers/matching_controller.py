
from decimal import Decimal, InvalidOperation

from app.models.matching_model import (
    get_matching_employees,
    get_matching_job_roles,
    get_job_required_skills,
    get_confirmed_employee_skills,
    save_matching_results,
    get_all_matching_results,
    get_matching_result_by_id
)


# ==========================================
# HELPER FUNCTIONS
# ==========================================

def normalize_skill_name(skill_name):
    """
    Normalize skill names for case-insensitive comparison.
    """

    if not skill_name:
        return ""

    return str(skill_name).strip().casefold()


def convert_to_float(value, default=0.0):
    """
    Safely convert database numeric values to float.
    """

    if value is None:
        return default

    try:
        return float(value)
    except (ValueError, TypeError, InvalidOperation):
        return default


def convert_to_bool(value):
    """
    Convert database TINYINT values to boolean.
    """

    return bool(value)


# ==========================================
# EXPERIENCE VALIDATION
# ==========================================

def get_experience_warning(employee, job_role):
    """
    Experience is a recommendation criterion,
    not an automatic exclusion criterion.
    """

    years = employee.get("years_experience")

    minimum = job_role.get("experience_min")
    maximum = job_role.get("experience_max")

    if years is None:
        return "Employee experience information is unavailable."

    years = convert_to_float(years)

    minimum = (
        convert_to_float(minimum)
        if minimum is not None else None
    )

    maximum = (
        convert_to_float(maximum)
        if maximum is not None else None
    )

    if minimum is not None and years < minimum:
        return (
            f"Employee has {years:g} years of experience, "
            f"below the preferred minimum of {minimum:g} years."
        )

    if maximum is not None and years > maximum:
        return (
            f"Employee has {years:g} years of experience, "
            f"above the preferred maximum of {maximum:g} years."
        )

    return None


# ==========================================
# MATCHING SCORE CALCULATION
# ==========================================

def calculate_skill_match(
    employee_skills,
    required_skills
):
    """
    Compare confirmed employee skills with
    job role requirements.

    Score formula:

        Matched requirement weights
        ---------------------------  x 100
        Total requirement weights

    Employee proficiency is not assumed because
    the confirmed skills table does not store it.
    """

    employee_skill_lookup = {}

    for skill in employee_skills:

        normalized_name = normalize_skill_name(
            skill.get("name")
        )

        if normalized_name:
            employee_skill_lookup[normalized_name] = skill

    matched_skills = []
    missing_skills = []

    total_weight = 0.0
    matched_weight = 0.0

    for requirement in required_skills:

        skill_name = requirement.get("skill_name", "")

        normalized_name = normalize_skill_name(
            skill_name
        )

        weight = convert_to_float(
            requirement.get("weight"),
            1.0
        )

        # Invalid or negative weights are not allowed.
        if weight < 0:
            raise ValueError(
                f"Invalid weight for skill '{skill_name}'. "
                "Skill weights cannot be negative."
            )

        total_weight += weight

        employee_skill = employee_skill_lookup.get(
            normalized_name
        )

        if employee_skill:

            matched_weight += weight

            matched_skills.append({
                "skill_name": skill_name,
                "taxonomy_category": (
                    employee_skill.get("taxonomy_category")
                    or requirement.get("taxonomy_category")
                ),
                "weight": weight
            })

        else:

            missing_skills.append({
                "skill_name": skill_name,
                "taxonomy_category": (
                    requirement.get("taxonomy_category")
                ),
                "required_proficiency": (
                    requirement.get("required_proficiency")
                ),
                "is_mandatory": convert_to_bool(
                    requirement.get("is_mandatory", 1)
                ),
                "weight": weight
            })

    if total_weight > 0:
        match_score = (
            matched_weight / total_weight
        ) * 100
    else:
        match_score = 0.0

    match_score = round(match_score, 2)

    missing_mandatory_skills = [
        skill["skill_name"]
        for skill in missing_skills
        if skill["is_mandatory"]
    ]

    return {
        "match_score": match_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "missing_mandatory_skills": (
            missing_mandatory_skills
        ),
        "total_required_skills": len(required_skills),
        "total_matched_skills": len(matched_skills)
    }


# ==========================================
# MATCH EXPLANATION
# ==========================================

def generate_match_explanation(
    employee,
    job_role,
    match_data,
    experience_warning
):
    """
    Generate a readable explanation of the result.
    """

    score = match_data["match_score"]

    matched = match_data["matched_skills"]
    missing = match_data["missing_skills"]

    missing_mandatory = (
        match_data["missing_mandatory_skills"]
    )

    if not match_data["total_required_skills"]:
        explanation = (
            "No skill requirements have been configured "
            "for this job role. A meaningful skill match "
            "score cannot be calculated."
        )

    else:
        explanation = (
            f"Employee matches {len(matched)} out of "
            f"{len(matched) + len(missing)} required skills "
            f"for the {job_role['title']} role. "
            f"The weighted skill match score is {score:.2f}%."
        )

    if missing_mandatory:
        explanation += (
            " Missing mandatory skills: "
            + ", ".join(missing_mandatory)
            + "."
        )
    else:
        explanation += (
            " All mandatory skills are matched."
        )

    if experience_warning:
        explanation += (
            " Experience warning: "
            + experience_warning
        )

    return explanation


# ==========================================
# RUN INTERNAL TALENT MATCHING
# ==========================================

def run_internal_matching(
    employee_ids=None,
    job_role_ids=None
):
    """
    Run matching for eligible employees
    against active job roles.

    Only confirmed employee skills are used.

    Results are saved in MATCHING_RESULTS.
    """

    # --------------------------------------
    # 1. Fetch eligible employees
    # --------------------------------------

    employees = get_matching_employees(
        employee_ids
    )

    if not employees:
        return {
            "message": (
                "No employees are currently ready "
                "for matching."
            ),
            "total_employees_processed": 0,
            "total_job_roles_processed": 0,
            "total_matches_generated": 0,
            "results": []
        }

    # --------------------------------------
    # 2. Fetch active job roles
    # --------------------------------------

    job_roles = get_matching_job_roles(
        job_role_ids
    )

    if not job_roles:
        return {
            "message": (
                "No active job roles were found "
                "for matching."
            ),
            "total_employees_processed": len(employees),
            "total_job_roles_processed": 0,
            "total_matches_generated": 0,
            "results": []
        }

    # --------------------------------------
    # 3. Fetch job requirements
    # --------------------------------------

    role_ids = [
        role["job_role_id"]
        for role in job_roles
    ]

    job_requirements = get_job_required_skills(
        role_ids
    )

    # --------------------------------------
    # 4. Fetch confirmed employee skills
    # --------------------------------------

    employee_id_list = [
        employee["employee_id"]
        for employee in employees
    ]

    employee_skills = get_confirmed_employee_skills(
        employee_id_list
    )

    # --------------------------------------
    # 5. Calculate employee-role matches
    # --------------------------------------

    results = []

    for employee in employees:

        employee_id = employee["employee_id"]

        confirmed_skills = employee_skills.get(
            employee_id,
            []
        )

        for job_role in job_roles:

            job_role_id = job_role["job_role_id"]

            required_skills = job_requirements.get(
                job_role_id,
                []
            )

            match_data = calculate_skill_match(
                confirmed_skills,
                required_skills
            )

            experience_warning = get_experience_warning(
                employee,
                job_role
            )

            explanation = generate_match_explanation(
                employee,
                job_role,
                match_data,
                experience_warning
            )

            result = {
                "employee_id": employee_id,
                "employee_name": employee.get("full_name"),
                "current_role": employee.get("current_role"),
                "years_experience": employee.get(
                    "years_experience"
                ),

                "job_role_id": job_role_id,
                "job_title": job_role["title"],
                "department": job_role.get("department"),

                "match_score": match_data["match_score"],
                "match_status": "completed",

                "matched_skills": match_data["matched_skills"],
                "missing_skills": match_data["missing_skills"],

                "missing_mandatory_skills": (
                    match_data["missing_mandatory_skills"]
                ),

                "experience_warning": experience_warning,
                "match_explanation": explanation
            }

            results.append(result)

    # --------------------------------------
    # 6. Save matching results
    # --------------------------------------

    save_matching_results(results)

    # --------------------------------------
    # 7. Return results
    # --------------------------------------

    results.sort(
        key=lambda item: item["match_score"],
        reverse=True
    )

    return {
        "message": "Internal talent matching completed successfully",
        "total_employees_processed": len(employees),
        "total_job_roles_processed": len(job_roles),
        "total_matches_generated": len(results),
        "results": results
    }


# ==========================================
# GET MATCHING RESULTS
# ==========================================

def get_matching_results(
    employee_id=None,
    job_role_id=None
):
    """
    Retrieve matching results with optional filters.
    """

    results = get_all_matching_results(
        employee_id,
        job_role_id
    )

    return {
        "message": "Matching results retrieved successfully",
        "total_results": len(results),
        "results": results
    }


# ==========================================
# GET MATCH BY ID
# ==========================================

def get_matching_details(match_id):
    """
    Retrieve one matching result.
    """

    return get_matching_result_by_id(
        match_id
    )
