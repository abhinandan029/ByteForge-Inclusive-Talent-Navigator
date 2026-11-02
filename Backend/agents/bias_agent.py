
import asyncio
import json
from pathlib import Path
import re
import sys
from typing import Any

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


# ---------------------------------------------------------------------
# Bias detection rules
# ---------------------------------------------------------------------

BIAS_RULES = [
    {
        "keywords": [
            "uninterrupted",
            "continuous recent",
            "continuous tenure",
            "continuous employment",
            "uninterrupted work history",
            "no employment gaps",
        ],
        "category": "Career Break / Continuity Penalty",
        "severity": "high",
        "explanation": (
            "Requiring uninterrupted or continuous employment can "
            "disadvantage caregivers and career returners without "
            "measuring their actual technical competencies."
        ),
        "inclusive_rewrite": (
            "Assess cumulative relevant experience and demonstrated "
            "proficiency, regardless of career breaks."
        ),
    },
    {
        "keywords": [
            "no career gaps",
            "no employment gaps",
            "currently employed",
            "must be currently employed",
        ],
        "category": "Employment Status Exclusion",
        "severity": "high",
        "explanation": (
            "Using current employment status or the absence of career "
            "gaps as an eligibility condition may exclude qualified "
            "candidates returning to work."
        ),
        "inclusive_rewrite": (
            "Evaluate relevant skills, experience and demonstrated "
            "capability regardless of current employment status."
        ),
    },
    {
        "keywords": [
            "recent grad",
            "recent graduate",
            "graduated within",
            "graduated in the last",
        ],
        "category": "Age / Graduation Recency Proxy",
        "severity": "medium",
        "explanation": (
            "Restricting eligibility by graduation date may act as an "
            "age or career-stage proxy when recent graduation is not "
            "essential to the role."
        ),
        "inclusive_rewrite": (
            "Accept equivalent foundational experience, relevant "
            "certifications and demonstrated skills regardless of "
            "graduation year."
        ),
    },
]


# ---------------------------------------------------------------------
# Generic helpers
# ---------------------------------------------------------------------

def _get(record: dict, *keys: str, default=None):
    """Read dictionary values without depending on key casing."""
    if not isinstance(record, dict):
        return default

    for key in keys:
        if key in record:
            return record[key]

        if key.upper() in record:
            return record[key.upper()]

        if key.lower() in record:
            return record[key.lower()]

    return default


def _normalize_text(value: Any) -> str:
    if value is None:
        return ""

    return re.sub(
        r"\s+",
        " ",
        str(value).strip(),
    )


def _to_float(value: Any, default=0.0) -> float:
    try:
        if value is None or value == "":
            return default

        return float(value)

    except (TypeError, ValueError):
        return default


def _get_role_criteria(role: dict) -> list[str]:
    """
    Read criteria from database-provided role data.

    Supports raw_criteria for compatibility with older data,
    and DESCRIPTION from the JOB_ROLES table.
    """
    criteria = []

    raw_criteria = _get(
        role,
        "raw_criteria",
        "RAW_CRITERIA",
        default=[],
    )

    if isinstance(raw_criteria, list):
        criteria.extend(
            _normalize_text(item)
            for item in raw_criteria
            if _normalize_text(item)
        )

    description = _normalize_text(
        _get(role, "DESCRIPTION", "description")
    )

    if description:
        # Split a description into individual sentences so the
        # flagged criterion is understandable to HR.
        sentences = re.split(
            r"(?<=[.!?;])\s+",
            description,
        )

        criteria.extend(
            sentence.strip()
            for sentence in sentences
            if sentence.strip()
        )

    # Remove duplicate criteria while preserving their order.
    unique_criteria = []
    seen = set()

    for criterion in criteria:
        normalized = criterion.casefold()

        if normalized not in seen:
            seen.add(normalized)
            unique_criteria.append(criterion)

    return unique_criteria


def _find_matching_rule(criterion: str) -> dict | None:
    """Find the first applicable exclusionary-criteria rule."""
    criterion_lower = criterion.casefold()

    for rule in BIAS_RULES:
        for keyword in rule["keywords"]:
            if keyword.casefold() in criterion_lower:
                return rule

    return None


# ---------------------------------------------------------------------
# Role criteria evaluation
# ---------------------------------------------------------------------

def evaluate_role_criteria(job_roles: list[dict]) -> list[dict]:
    """
    Detect potentially exclusionary wording in job-role criteria.

    This generates review flags, not definitive findings of bias.
    """
    flags = []

    for role in job_roles:
        role_id = _get(
            role,
            "JOB_ROLE_ID",
            "job_role_id",
            "role_id",
        )

        if not role_id:
            continue

        role_title = _get(
            role,
            "TITLE",
            "title",
            "job_title",
            default="Internal Role",
        )

        criteria = _get_role_criteria(role)

        for criterion in criteria:
            rule = _find_matching_rule(criterion)

            if not rule:
                continue

            description = (
                f"Potentially exclusionary criterion identified in "
                f"'{role_title}': \"{criterion}\". "
                f"{rule['explanation']}"
            )

            flags.append({
                "job_role_id": str(role_id),
                "match_id": None,
                "flag_type": rule["category"],
                "severity": rule["severity"],
                "description": description,
                "recommendation": rule["inclusive_rewrite"],
                "flagged_criterion": criterion,
                "role_title": role_title,
            })

    return flags


# ---------------------------------------------------------------------
# Matching-result review
# ---------------------------------------------------------------------

def evaluate_matching_result(result: dict) -> list[dict]:
    """
    Identify matching outcomes that may need HR review.

    These are review indicators, not automatic findings of bias.
    """
    flags = []

    match_id = _get(result, "MATCH_ID", "match_id")
    job_role_id = _get(
        result,
        "JOB_ROLE_ID",
        "job_role_id",
    )

    if not match_id or not job_role_id:
        return flags

    role_title = _get(
        result,
        "TITLE",
        "job_title",
        default="the selected role",
    )

    # 1. Missing mandatory skills.
    missing_mandatory = _get(
        result,
        "missing_mandatory_skills",
        "MISSING_MANDATORY_SKILLS",
        default=[],
    ) or []

    # Compatibility: reconstruct from missing_skills if needed.
    if not missing_mandatory:
        missing_skills = _get(
            result,
            "missing_skills",
            "MISSING_SKILLS",
            default=[],
        ) or []

        missing_mandatory = [
            skill.get("skill_name")
            or skill.get("SKILL_NAME")
            for skill in missing_skills
            if isinstance(skill, dict)
            and (
                skill.get("is_mandatory")
                or skill.get("IS_MANDATORY")
            )
        ]

    if missing_mandatory:
        flags.append({
            "job_role_id": str(job_role_id),
            "match_id": str(match_id),
            "flag_type": "Mandatory Skill Gap Review",
            "severity": "medium",
            "description": (
                f"The employee is missing these mandatory skills "
                f"for '{role_title}': "
                f"{', '.join(map(str, missing_mandatory))}. "
                "This is a role-fit review indicator, not evidence "
                "of discriminatory treatment."
            ),
            "recommendation": (
                "Review the evidence for each mandatory requirement "
                "and verify that the requirements are genuinely "
                "necessary for the role."
            ),
        })

    # 2. Experience-related concerns.
    experience_warning = _normalize_text(
        _get(
            result,
            "experience_warning",
            "EXPERIENCE_WARNING",
        )
    )

    if experience_warning:
        flags.append({
            "job_role_id": str(job_role_id),
            "match_id": str(match_id),
            "flag_type": "Experience Requirement Review",
            "severity": "low",
            "description": (
                f"The matching result contains an experience-related "
                f"warning for '{role_title}': "
                f"{experience_warning} "
                "Experience differences should not automatically "
                "exclude candidates or penalize career breaks."
            ),
            "recommendation": (
                "Review demonstrated competencies, relevant "
                "experience and potential. Treat the experience "
                "range as guidance unless it is demonstrably "
                "essential to the role."
            ),
        })

    # 3. Low match-score review.
    match_score = _to_float(
        _get(result, "MATCH_SCORE", "match_score")
    )

    if match_score < 50:
        flags.append({
            "job_role_id": str(job_role_id),
            "match_id": str(match_id),
            "flag_type": "Low Match Score Review",
            "severity": "low",
            "description": (
                f"The employee has a weighted skills match score "
                f"of {match_score:.2f}% for '{role_title}'. "
                "A low score is a role-fit indicator and does not "
                "by itself establish bias or unfair treatment."
            ),
            "recommendation": (
                "Review the role requirements, confirmed skills "
                "and supporting evidence before making an HR decision."
            ),
        })

    return flags


# ---------------------------------------------------------------------
# Main Bias Review Agent
# ---------------------------------------------------------------------

def _run_bias_audit_core(
    matching_results: list[dict],
    job_roles: list[dict],
) -> dict:
    """
    Execute the Bias Review workflow.

    Inputs are fetched by the model layer.
    Outputs are persisted by the model layer.

    This function does not:
        - Read roles.json.
        - Access the database.
        - Write local audit files.
        - Make HR decisions.
    """

    matching_results = matching_results or []
    job_roles = job_roles or []

    # Role-level criteria audit.
    flags = evaluate_role_criteria(job_roles)

    # Match-level review.
    for result in matching_results:
        flags.extend(
            evaluate_matching_result(result)
        )

    high_count = sum(
        1 for flag in flags
        if flag["severity"] == "high"
    )

    medium_count = sum(
        1 for flag in flags
        if flag["severity"] == "medium"
    )

    low_count = sum(
        1 for flag in flags
        if flag["severity"] == "low"
    )

    summary = (
        f"Bias Review Agent examined {len(job_roles)} job roles "
        f"and {len(matching_results)} matching results. "
        f"It generated {len(flags)} potential review flags: "
        f"{high_count} high, {medium_count} medium and "
        f"{low_count} low severity. "
        "These flags require HR assessment and are not "
        "automated findings of discrimination."
    )

    return {
        "audit_status": (
            "BIAS_FLAGS_DETECTED_FOR_HR_REVIEW"
            if flags
            else "NO_REVIEW_FLAGS_DETECTED"
        ),
        "total_roles_audited": len(job_roles),
        "total_matches_audited": len(matching_results),
        "total_flags_raised": len(flags),
        "high_severity_count": high_count,
        "medium_severity_count": medium_count,
        "low_severity_count": low_count,
        "flags": flags,
        "hr_summary_recommendation": summary,
    }


async def _run_bias_mcp(
    matching_results: list[dict],
    job_roles: list[dict],
) -> dict:
    server_script = (
        Path(__file__).resolve().parents[1]
        / "mcp_server"
        / "bias_mcp_server.py"
    )
    server_params = StdioServerParameters(
        command=sys.executable,
        args=[str(server_script)],
        env=None,
    )

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            response = await session.call_tool(
                "run_bias_audit",
                arguments={
                    "matching_results_json": json.dumps(matching_results),
                    "job_roles_json": json.dumps(job_roles),
                },
            )

            if response.isError or not response.content:
                raise RuntimeError("MCP bias review tool execution failed.")

            payload = json.loads(response.content[0].text)
            if not isinstance(payload, dict) or not isinstance(
                payload.get("flags"), list
            ):
                raise ValueError("MCP bias review returned an invalid response.")

            return payload


def run_bias_audit(
    matching_results: list[dict],
    job_roles: list[dict],
) -> dict:
    """Run Bias Review through the Bias Review MCP server."""
    return asyncio.run(
        _run_bias_mcp(
            matching_results,
            job_roles,
        )
    )
