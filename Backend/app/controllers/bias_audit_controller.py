
from app.models.bias_audit_model import (
    create_bias_audit_flags,
    get_bias_audit_flags,
    get_bias_audit_flag_by_id,
    review_bias_audit_flag,
    create_hr_match_decision,
    get_hr_match_decisions
)


# --------------------------------------------------
# CONSTANTS
# --------------------------------------------------

VALID_REVIEW_STATUSES = {
    "concerning",
    "not_concerning"
}

VALID_MATCH_DECISIONS = {
    "shortlist",
    "reject",
    "hold",
    "needs_further_review"
}

LOW_MATCH_SCORE_THRESHOLD = 50.0


# --------------------------------------------------
# HELPER FUNCTIONS
# --------------------------------------------------

def get_value(data, key, default=None):
    """
    Supports both dictionary results and Pydantic objects.
    """
    if isinstance(data, dict):
        return data.get(key, default)

    return getattr(data, key, default)


def normalize_skill_list(skills):
    if not skills:
        return []

    return [
        str(skill).strip()
        for skill in skills
        if skill and str(skill).strip()
    ]


# --------------------------------------------------
# AUTOMATIC BIAS AUDIT RULES
# --------------------------------------------------

def evaluate_matching_result(result):
    """
    Evaluate one matching result and return
    potential review flags.

    These flags are advisory indicators only.
    They do not establish discrimination or
    automatically affect hiring decisions.
    """

    flags = []

    match_id = get_value(result, "match_id")
    job_role_id = get_value(result, "job_role_id")

    if not match_id or not job_role_id:
        return flags

    # ----------------------------------------------
    # RULE 1: MISSING MANDATORY SKILLS
    # ----------------------------------------------

    missing_mandatory = normalize_skill_list(
        get_value(result, "missing_mandatory_skills", [])
    )

    if missing_mandatory:

        skill_names = ", ".join(missing_mandatory)

        flags.append({
            "match_id": match_id,
            "job_role_id": job_role_id,
            "flag_type": "missing_mandatory_skills",
            "severity": "medium",
            "description": (
                "The employee is missing the following "
                f"mandatory skills: {skill_names}. "
                "This requires HR review to verify that "
                "the requirements are genuinely necessary "
                "and that the employee's experience has "
                "been represented accurately."
            ),
            "recommendation": (
                "Review the mandatory skill requirements, "
                "the employee's confirmed skills, and "
                "whether equivalent experience or "
                "transferable skills should be considered."
            )
        })

    # ----------------------------------------------
    # RULE 2: EXPERIENCE OUTSIDE JOB RANGE
    # ----------------------------------------------

    experience_warning = get_value(
        result,
        "experience_warning"
    )

    if experience_warning:

        flags.append({
            "match_id": match_id,
            "job_role_id": job_role_id,
            "flag_type": "experience_out_of_range",
            "severity": "medium",
            "description": (
                "The employee's experience is outside "
                "the stated experience range for this role. "
                f"Details: {experience_warning}"
            ),
            "recommendation": (
                "Review whether the experience range is "
                "a necessary requirement and whether "
                "equivalent skills or relevant experience "
                "justify further consideration."
            )
        })

    # ----------------------------------------------
    # RULE 3: LOW MATCH SCORE
    # ----------------------------------------------

    match_score = get_value(result, "match_score")

    try:
        match_score = float(match_score)
    except (TypeError, ValueError):
        match_score = None

    if (
        match_score is not None
        and match_score < LOW_MATCH_SCORE_THRESHOLD
    ):

        flags.append({
            "match_id": match_id,
            "job_role_id": job_role_id,
            "flag_type": "low_match_score",
            "severity": "medium",
            "description": (
                f"The employee received a match score "
                f"of {match_score:.2f}%, which is below "
                f"the review threshold of "
                f"{LOW_MATCH_SCORE_THRESHOLD:.0f}%."
            ),
            "recommendation": (
                "Review the matching explanation, "
                "required skill weights, and role criteria "
                "to ensure that the scoring criteria "
                "are appropriate and consistently applied."
            )
        })

    return flags


# --------------------------------------------------
# GENERATE FLAGS FOR MATCHING RESULTS
# --------------------------------------------------

def generate_bias_flags_for_matching_results(results):
    """
    Called automatically after matching completes.

    Evaluates every generated matching result,
    then stores all detected flags.
    """

    all_flags = []

    for result in results:

        detected_flags = evaluate_matching_result(result)

        all_flags.extend(detected_flags)

    created_count = create_bias_audit_flags(all_flags)

    return {
        "total_matches_evaluated": len(results),
        "total_flags_detected": len(all_flags),
        "total_new_flags_created": created_count
    }


# --------------------------------------------------
# LIST BIAS AUDIT FLAGS
# --------------------------------------------------

def list_bias_audit_flags(
    review_status=None,
    flag_type=None,
    job_role_id=None
):
    if review_status:
        review_status = review_status.strip().lower()

        allowed_statuses = {
            "pending",
            "concerning",
            "not_concerning"
        }

        if review_status not in allowed_statuses:
            raise ValueError("Invalid review status.")

    if flag_type:
        flag_type = flag_type.strip()

    results = get_bias_audit_flags(
        review_status=review_status,
        flag_type=flag_type,
        job_role_id=job_role_id
    )

    return {
        "message": "Bias audit flags retrieved successfully.",
        "total_flags": len(results),
        "flags": results
    }


# --------------------------------------------------
# GET SINGLE BIAS AUDIT FLAG
# --------------------------------------------------

def get_bias_audit_flag(flag_id):
    flag = get_bias_audit_flag_by_id(flag_id)

    if not flag:
        return None

    return {
        "message": "Bias audit flag retrieved successfully.",
        "flag": flag
    }


# --------------------------------------------------
# HR REVIEWS A BIAS FLAG
# --------------------------------------------------

def review_bias_flag(
    flag_id,
    hr_id,
    review_status,
    review_comments=None
):
    if not review_status:
        raise ValueError("Review status is required.")

    review_status = review_status.strip().lower()

    if review_status not in VALID_REVIEW_STATUSES:
        raise ValueError(
            "Review status must be 'concerning' "
            "or 'not_concerning'."
        )

    if review_comments is not None:
        review_comments = review_comments.strip()

        if not review_comments:
            review_comments = None

    result = review_bias_audit_flag(
        flag_id=flag_id,
        hr_id=hr_id,
        review_status=review_status,
        review_comments=review_comments
    )

    if not result:
        return None

    return {
        "message": "Bias audit flag reviewed successfully.",
        "flag": result
    }


# --------------------------------------------------
# RECORD HR MATCHING DECISION
# --------------------------------------------------

def record_hr_matching_decision(
    match_id,
    hr_id,
    decision,
    comments=None,
    override_reason=None
):
    if not decision:
        raise ValueError("HR decision is required.")

    decision = decision.strip().lower()

    if decision not in VALID_MATCH_DECISIONS:
        raise ValueError(
            "Decision must be one of: "
            "shortlist, reject, hold, needs_further_review."
        )

    if comments is not None:
        comments = comments.strip() or None

    if override_reason is not None:
        override_reason = override_reason.strip() or None

    if decision == "reject" and not override_reason:
        raise ValueError(
            "An override reason is required when rejecting "
            "a matching result."
        )

    result = create_hr_match_decision(
        match_id=match_id,
        hr_id=hr_id,
        decision=decision,
        comments=comments,
        override_reason=override_reason
    )

    if not result:
        return None

    return {
        "message": "HR matching decision recorded successfully.",
        "decision": result
    }


# --------------------------------------------------
# GET HR DECISIONS FOR A MATCH
# --------------------------------------------------

def list_hr_matching_decisions(match_id):
    decisions = get_hr_match_decisions(match_id)

    return {
        "message": "HR matching decisions retrieved successfully.",
        "total_decisions": len(decisions),
        "decisions": decisions
    }
