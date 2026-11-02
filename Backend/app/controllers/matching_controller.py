
from agents.matching_agent import run_inclusive_matching

from app.models.matching_model import (
    get_matching_employees,
    get_matching_job_roles,
    get_job_required_skills,
    get_confirmed_employee_skills,
    save_matching_results,
    get_all_matching_results,
    get_matching_result_by_id,
)


# ---------------------------------------------------------------------
# Run Opportunity Matching
# ---------------------------------------------------------------------

def run_internal_matching(
    employee_ids=None,
    job_role_ids=None,
    actor="HR",
):
    """
    Orchestrates the Opportunity Matching workflow.

    Controller responsibilities:
        1. Fetch eligible employees.
        2. Fetch active job roles.
        3. Fetch job requirements and confirmed employee skills.
        4. Invoke the matching agent.
        5. Save generated results and audit events.
        6. Retrieve persisted results for the response.

    All matching business logic lives in matching_agent.py.
    """

    # 1. Fetch eligible employees.
    employees = get_matching_employees(employee_ids)

    if not employees:
        raise ValueError(
            "No eligible employees found. Employees must have "
            "confirmed skills and be ready for matching."
        )

    # 2. Fetch active job roles.
    job_roles = get_matching_job_roles(job_role_ids)

    if not job_roles:
        raise ValueError(
            "No active job roles found for matching."
        )

    # 3. Extract IDs required for the remaining database queries.
    eligible_employee_ids = [
        employee["EMPLOYEE_ID"]
        for employee in employees
    ]

    active_job_role_ids = [
        role["JOB_ROLE_ID"]
        for role in job_roles
    ]

    # 4. Fetch the data required by the agent.
    job_requirements = get_job_required_skills(
        active_job_role_ids
    )

    employee_skills = get_confirmed_employee_skills(
        eligible_employee_ids
    )

    # 5. Invoke the Opportunity Matching Agent.
    matching_results = run_inclusive_matching(
        employees=employees,
        job_roles=job_roles,
        job_requirements=job_requirements,
        employee_skills=employee_skills,
    )

    # 6. Save results and central audit events.
    saved_count = save_matching_results(
        matching_results,
        actor=actor,
    )

    # 7. Retrieve persisted results for the selected employees/roles.
    employee_filter = set(
        str(employee_id)
        for employee_id in eligible_employee_ids
    )

    role_filter = set(
        str(role_id)
        for role_id in active_job_role_ids
    )

    stored_results = get_all_matching_results(
        employee_ids=eligible_employee_ids,
        job_role_ids=active_job_role_ids,
    )

    # Restrict the response to the employee-role combinations
    # processed in this run.
    processed_pairs = {
        (
            str(result["employee_id"]),
            str(result["job_role_id"]),
        )
        for result in matching_results
    }

    response_results = [
        result
        for result in stored_results
        if (
            str(result["employee_id"]),
            str(result["job_role_id"]),
        ) in processed_pairs
    ]

    response_results.sort(
        key=lambda result: (
            str(result["employee_id"]),
            -float(result["match_score"]),
            str(result["job_role_id"]),
        )
    )

    return {
        "message": "Opportunity matching completed successfully.",

        "total_employees_processed": len(employees),

        "total_job_roles_processed": len(job_roles),

        "total_matches_generated": len(matching_results),

        "total_matches_saved": saved_count,

        "results": response_results,
    }


# ---------------------------------------------------------------------
# Get all matching results
# ---------------------------------------------------------------------

def get_matching_results(
    employee_id=None,
    job_role_id=None,
):
    results = get_all_matching_results(
        employee_id=employee_id,
        job_role_id=job_role_id,
    )

    return {
        "message": "Matching results retrieved successfully.",
        "total_results": len(results),
        "results": results,
    }


# ---------------------------------------------------------------------
# Get one matching result
# ---------------------------------------------------------------------

def get_matching_details(match_id):
    return get_matching_result_by_id(match_id)
