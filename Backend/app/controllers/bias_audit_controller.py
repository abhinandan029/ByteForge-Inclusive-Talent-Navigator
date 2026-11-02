
from agents.bias_agent import run_bias_audit

from app.models.bias_audit_model import (
    get_bias_audit_inputs,
    create_bias_audit_flags,
    get_bias_audit_flags as fetch_bias_audit_flags,
    get_bias_audit_flag_by_id as fetch_bias_audit_flag_by_id,
    review_bias_audit_flag as save_bias_audit_review,
    create_hr_match_decision as save_hr_match_decision,
    get_hr_match_decisions as fetch_hr_match_decisions,
)


# ---------------------------------------------------------------------
# Validation constants
# ---------------------------------------------------------------------

VALID_REVIEW_STATUSES = {
    "concerning",
    "not_concerning",
}

VALID_MATCH_DECISIONS = {
    "shortlist",
    "reject",
    "hold",
    "needs_further_review",
}


# ---------------------------------------------------------------------
# Database result normalization
# ---------------------------------------------------------------------

def _normalize_flag(row):
    """Convert database column names into API field names."""

    if not row:
        return None

    return {
        "flag_id": row.get("FLAG_ID") or row.get("flag_id"),
        "job_role_id": row.get("JOB_ROLE_ID") or row.get("job_role_id"),
        "match_id": row.get("MATCH_ID") or row.get("match_id"),
        "flag_type": row.get("FLAG_TYPE") or row.get("flag_type"),
        "severity": row.get("SEVERITY") or row.get("severity"),
        "description": row.get("DESCRIPTION") or row.get("description"),
        "recommendation": (
            row.get("RECOMMENDATION")
            if "RECOMMENDATION" in row
            else row.get("recommendation")
        ),
        "review_status": (
            row.get("REVIEW_STATUS") or row.get("review_status")
        ),
        "reviewed_by_hr": (
            row.get("REVIEWED_BY_HR")
            or row.get("reviewed_by_hr")
        ),
        "reviewed_at": (
            row.get("REVIEWED_AT") or row.get("reviewed_at")
        ),
        "review_comments": (
            row.get("REVIEW_COMMENTS")
            if "REVIEW_COMMENTS" in row
            else row.get("review_comments")
        ),
        "created_at": (
            row.get("CREATED_AT") or row.get("created_at")
        ),
        "employee_id": (
            row.get("EMPLOYEE_ID") or row.get("employee_id")
        ),
        "employee_name": (
            row.get("EMPLOYEE_NAME") or row.get("employee_name")
        ),
        "job_title": (
            row.get("JOB_TITLE") or row.get("job_title")
        ),
        "match_score": (
            float(
                row.get("MATCH_SCORE")
                if row.get("MATCH_SCORE") is not None
                else row.get("match_score")
            )
            if (
                row.get("MATCH_SCORE") is not None
                or row.get("match_score") is not None
            )
            else None
        ),
    }


def _normalize_decision(row):
    """Normalize HR decision records returned by the model."""

    if not row:
        return None

    return {
        "decision_id": (
            row.get("DECISION_ID")
            or row.get("decision_id")
        ),
        "match_id": (
            row.get("MATCH_ID")
            or row.get("match_id")
        ),
        "hr_id": (
            row.get("HR_ID")
            or row.get("hr_id")
        ),
        "decision": (
            row.get("DECISION")
            or row.get("decision")
        ),
        "comments": (
            row.get("COMMENTS")
            if "COMMENTS" in row
            else row.get("comments")
        ),
        "override_reason": (
            row.get("OVERRIDE_REASON")
            if "OVERRIDE_REASON" in row
            else row.get("override_reason")
        ),
        "created_at": (
            row.get("CREATED_AT")
            or row.get("created_at")
        ),
    }


# ---------------------------------------------------------------------
# Run Bias Review Agent
# ---------------------------------------------------------------------

def run_bias_review(
    employee_id=None,
    match_ids=None,
    job_role_ids=None,
    actor="HR",
):
    """
    Orchestrates the Bias Review workflow.

    Responsibilities:
        1. Fetch matching results and job-role criteria.
        2. Invoke the Bias Review Agent.
        3. Persist generated flags and audit events.
        4. Return the audit summary.

    All bias-detection logic belongs to the agent.
    All database operations belong to the model.
    """

    # 1. Fetch inputs through the model.
    matching_results, job_roles = get_bias_audit_inputs(
        employee_id=employee_id,
        match_ids=match_ids,
        job_role_ids=job_role_ids,
    )

    if not matching_results and not job_roles:
        raise ValueError(
            "No matching results or job roles were found "
            "for the requested bias review."
        )

    # 2. Execute the Bias Review Agent.
    audit_result = run_bias_audit(
        matching_results=matching_results,
        job_roles=job_roles,
    )

    # 3. Persist flags and audit events.
    # IMPORTANT: The model parameter is summary_text, not summary.
    persistence_result = create_bias_audit_flags(
        flags=audit_result["flags"],
        actor=actor,
        summary_text=audit_result["hr_summary_recommendation"],
    )

    # 4. Prepare the API response.
    return {
        "message": "Bias review completed successfully.",

        "audit_status": audit_result["audit_status"],

        "total_roles_audited": audit_result[
            "total_roles_audited"
        ],

        "total_matches_audited": audit_result[
            "total_matches_audited"
        ],

        "total_flags_raised": audit_result[
            "total_flags_raised"
        ],

        "high_severity_count": audit_result[
            "high_severity_count"
        ],

        "medium_severity_count": audit_result[
            "medium_severity_count"
        ],

        "low_severity_count": audit_result[
            "low_severity_count"
        ],

        "total_flags_inserted": persistence_result[
            "total_flags_inserted"
        ],

        "total_existing_flags_skipped": persistence_result[
            "total_existing_flags_skipped"
        ],

        "flags": audit_result["flags"],

        "hr_summary_recommendation": audit_result[
            "hr_summary_recommendation"
        ],
    }


# ---------------------------------------------------------------------
# Backward compatibility for existing callers
# ---------------------------------------------------------------------

def generate_bias_flags_for_matching_results(
    results,
    actor="HR",
):
    """
    Compatibility wrapper for older matching-related callers.

    New implementations should call run_bias_review().
    """

    results = results or []

    match_ids = [
        result.get("match_id") or result.get("MATCH_ID")
        for result in results
        if result.get("match_id") or result.get("MATCH_ID")
    ]

    if not match_ids:
        raise ValueError(
            "No valid match IDs were supplied for bias review."
        )

    return run_bias_review(
        match_ids=match_ids,
        actor=actor,
    )


# ---------------------------------------------------------------------
# List Bias Audit Flags
# ---------------------------------------------------------------------

def get_bias_audit_flags(
    review_status=None,
    flag_type=None,
    employee_id=None,
    job_role_id=None,
):
    if review_status and review_status not in {
        "pending",
        "concerning",
        "not_concerning",
    }:
        raise ValueError("Invalid bias review status.")

    rows = fetch_bias_audit_flags(
        review_status=review_status,
        employee_id=employee_id,
        job_role_id=job_role_id,
        flag_type=flag_type,
    )

    flags = [
        _normalize_flag(row)
        for row in rows
    ]

    return {
        "message": "Bias audit flags retrieved successfully.",
        "total_flags": len(flags),
        "flags": flags,
    }


# Compatibility with existing routes.
def list_bias_audit_flags(
    review_status=None,
    flag_type=None,
    job_role_id=None,
):
    return get_bias_audit_flags(
        review_status=review_status,
        flag_type=flag_type,
        job_role_id=job_role_id,
    )


# ---------------------------------------------------------------------
# Get Individual Bias Flag
# ---------------------------------------------------------------------

def get_bias_audit_flag_by_id(flag_id):
    if not flag_id:
        raise ValueError("A flag ID is required.")

    row = fetch_bias_audit_flag_by_id(flag_id)

    if not row:
        return None

    return {
        "message": "Bias audit flag retrieved successfully.",
        "flag": _normalize_flag(row),
    }


def get_bias_audit_flag(flag_id):
    return get_bias_audit_flag_by_id(flag_id)


# ---------------------------------------------------------------------
# Review Bias Flag
# ---------------------------------------------------------------------

def review_bias_audit_flag(
    flag_id,
    hr_id,
    review_status,
    review_comments=None,
):
    if not flag_id:
        raise ValueError("A flag ID is required.")

    if not hr_id:
        raise ValueError("An HR ID is required.")

    if review_status not in VALID_REVIEW_STATUSES:
        raise ValueError(
            "Review status must be 'concerning' or "
            "'not_concerning'."
        )

    row = save_bias_audit_review(
        flag_id=flag_id,
        hr_id=hr_id,
        review_status=review_status,
        review_comments=review_comments,
    )

    if not row:
        return None

    return {
        "message": "Bias audit flag reviewed successfully.",
        "flag": _normalize_flag(row),
    }


def review_bias_flag(
    flag_id,
    hr_id,
    review_status,
    review_comments=None,
):
    return review_bias_audit_flag(
        flag_id=flag_id,
        hr_id=hr_id,
        review_status=review_status,
        review_comments=review_comments,
    )


# ---------------------------------------------------------------------
# Record HR Matching Decision
# ---------------------------------------------------------------------

def create_hr_match_decision(
    match_id,
    hr_id,
    decision,
    comments=None,
    override_reason=None,
):
    if not match_id:
        raise ValueError("A match ID is required.")

    if not hr_id:
        raise ValueError("An HR ID is required.")

    if decision not in VALID_MATCH_DECISIONS:
        raise ValueError(
            "Invalid HR decision. Choose one of: "
            + ", ".join(sorted(VALID_MATCH_DECISIONS))
        )

    if decision == "reject" and not (
        (comments and comments.strip())
        or (override_reason and override_reason.strip())
    ):
        raise ValueError(
            "Please provide comments or an override reason "
            "when rejecting a match."
        )

    row = save_hr_match_decision(
        match_id=match_id,
        hr_id=hr_id,
        decision=decision,
        comments=comments,
        override_reason=override_reason,
    )

    return _normalize_decision(row)


def record_hr_matching_decision(
    match_id,
    hr_id,
    decision,
    comments=None,
    override_reason=None,
):
    return create_hr_match_decision(
        match_id=match_id,
        hr_id=hr_id,
        decision=decision,
        comments=comments,
        override_reason=override_reason,
    )


# ---------------------------------------------------------------------
# List HR Matching Decisions
# ---------------------------------------------------------------------

def get_hr_match_decisions(match_id=None):
    rows = fetch_hr_match_decisions(
        match_id=match_id,
    )

    decisions = [
        _normalize_decision(row)
        for row in rows
    ]

    return {
        "message": "HR matching decisions retrieved successfully.",
        "total_decisions": len(decisions),
        "decisions": decisions,
    }


def list_hr_matching_decisions(match_id):
    return get_hr_match_decisions(
        match_id=match_id,
    )
