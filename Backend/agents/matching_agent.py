
from __future__ import annotations

import asyncio
import json
import re
from collections import defaultdict
from decimal import Decimal
from datetime import date, datetime
from pathlib import Path
import sys
from typing import Any

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

# ---------------------------------------------------------------------
# Generic helpers
# ---------------------------------------------------------------------

def _get(record: dict, *keys: str, default=None):
    """Read a field without depending on database column casing."""
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


def _normalize_skill(value: Any) -> str:
    """
    Normalize formatting only.

    Does not equate different technologies such as SQL and PostgreSQL
    or Python and FastAPI.
    """
    if value is None:
        return ""

    value = str(value).strip().casefold()
    value = re.sub(r"[^a-z0-9+#.]+", " ", value)

    return re.sub(r"\s+", " ", value).strip()


def _contains_exact_phrase(text: Any, phrase: str) -> bool:
    """Check whether evidence contains a complete skill phrase."""
    normalized_text = _normalize_skill(text)

    if not normalized_text or not phrase:
        return False

    return f" {phrase} " in f" {normalized_text} "


def _as_index(data: Any, id_fields: tuple[str, ...]) -> dict:
    """
    Accept either:
        {employee_id: [records]}
    or a flat list of records containing an ID field.
    """
    indexed = defaultdict(list)

    if isinstance(data, dict):
        for record_id, records in data.items():
            if isinstance(records, list):
                indexed[str(record_id)].extend(
                    item for item in records
                    if isinstance(item, dict)
                )
            elif isinstance(records, dict):
                indexed[str(record_id)].append(records)

        return dict(indexed)

    if isinstance(data, list):
        for record in data:
            if not isinstance(record, dict):
                continue

            record_id = _get(record, *id_fields)

            if record_id is not None:
                indexed[str(record_id)].append(record)

    return dict(indexed)


def _to_float(value: Any, default: float = 0.0) -> float:
    try:
        if value is None or value == "":
            return default

        return float(value)

    except (TypeError, ValueError):
        return default


def _to_bool(value: Any) -> bool:
    if isinstance(value, str):
        return value.strip().casefold() in {
            "1", "true", "yes", "y"
        }

    return bool(value)


def _json_default(value: Any):
    """Convert database scalar values before sending them to MCP."""
    if isinstance(value, Decimal):
        return float(value)

    if isinstance(value, (date, datetime)):
        return value.isoformat()

    raise TypeError(
        f"Object of type {type(value).__name__} is not JSON serializable"
    )


# ---------------------------------------------------------------------
# Skill matching
# ---------------------------------------------------------------------

def _employee_has_skill(
    requirement_name: str,
    confirmed_skills: list[dict],
) -> bool:
    """
    A requirement is matched when:
        1. Its normalized name exactly matches a confirmed skill name.
        2. Its complete name appears in the skill's evidence snippet.

    No broad technology equivalence is assumed.
    """
    normalized_requirement = _normalize_skill(requirement_name)

    if not normalized_requirement:
        return False

    for skill in confirmed_skills:
        confirmed_name = _normalize_skill(
            _get(
                skill,
                "NAME",
                "name",
                "SKILL_NAME",
                "skill_name",
            )
        )

        if confirmed_name == normalized_requirement:
            return True

        evidence = _get(
            skill,
            "EVIDENCE_SNIPPET",
            "evidence_snippet",
            default="",
        )

        if _contains_exact_phrase(
            evidence,
            normalized_requirement,
        ):
            return True

    return False


def _employee_skill_record(
    requirement_name: str,
    confirmed_skills: list[dict],
) -> dict | None:
    normalized_requirement = _normalize_skill(requirement_name)
    for skill in confirmed_skills:
        confirmed_name = _normalize_skill(
            _get(skill, "NAME", "name", "SKILL_NAME", "skill_name")
        )
        evidence = _get(
            skill, "EVIDENCE_SNIPPET", "evidence_snippet", default=""
        )
        if (
            confirmed_name == normalized_requirement
            or _contains_exact_phrase(evidence, normalized_requirement)
        ):
            return skill
    return None


def _proficiency_value(value: Any) -> float:
    values = {
        "beginner": 0.45,
        "basic": 0.45,
        "intermediate": 0.70,
        "advanced": 0.90,
        "expert": 1.00,
    }
    return values.get(str(value or "").strip().casefold(), 0.70)


def _required_proficiency_value(value: Any) -> float:
    return {
        "beginner": 0.45,
        "basic": 0.45,
        "intermediate": 0.70,
        "advanced": 0.90,
        "expert": 1.00,
    }.get(str(value or "").strip().casefold(), 0.70)


# ---------------------------------------------------------------------
# Experience information
# ---------------------------------------------------------------------

def _experience_warning(
    employee: dict,
    role: dict,
) -> str | None:

    years = _get(
        employee,
        "YEARS_EXPERIENCE",
        "years_experience",
    )

    minimum = _get(
        role,
        "EXPERIENCE_MIN",
        "experience_min",
    )

    maximum = _get(
        role,
        "EXPERIENCE_MAX",
        "experience_max",
    )

    if years is None:
        return None

    years = _to_float(years)

    if minimum is not None and years < _to_float(minimum):
        return (
            f"The employee has {years:g} years of experience, "
            f"while the role lists {_to_float(minimum):g} years "
            "as its minimum. Review demonstrated skills and "
            "potential as well."
        )

    if maximum is not None and years > _to_float(maximum):
        return (
            f"The employee has {years:g} years of experience, "
            f"above the role's listed maximum of "
            f"{_to_float(maximum):g} years. Review role suitability "
            "rather than treating this as an automatic exclusion."
        )

    return None


# ---------------------------------------------------------------------
# Core Opportunity Matching Agent
# ---------------------------------------------------------------------

def _run_inclusive_matching_core(
    employees: list[dict],
    job_roles: list[dict],
    job_requirements: Any,
    employee_skills: Any,
) -> list[dict]:
    """
    Generate employee-to-role matching results.

    This function contains the matching business logic only.
    It does not access the database or write audit records.

    Expected job requirement fields:
        REQUIREMENT_ID
        JOB_ROLE_ID
        SKILL_NAME
        TAXONOMY_CATEGORY
        REQUIRED_PROFICIENCY
        IS_MANDATORY
        WEIGHT

    Expected confirmed skill fields:
        EMPLOYEE_ID
        NAME
        TAXONOMY_CATEGORY
        EVIDENCE_SNIPPET
    """

    requirements_by_role = _as_index(
        job_requirements,
        ("JOB_ROLE_ID", "job_role_id"),
    )

    skills_by_employee = _as_index(
        employee_skills,
        ("EMPLOYEE_ID", "employee_id"),
    )

    results = []

    for employee in employees:
        employee_id = _get(
            employee,
            "EMPLOYEE_ID",
            "employee_id",
        )

        if not employee_id:
            continue

        confirmed_skills = skills_by_employee.get(
            str(employee_id),
            [],
        )

        for role in job_roles:
            job_role_id = _get(
                role,
                "JOB_ROLE_ID",
                "job_role_id",
            )

            if not job_role_id:
                continue

            requirements = requirements_by_role.get(
                str(job_role_id),
                [],
            )

            matched_skills = []
            missing_skills = []
            missing_mandatory_skills = []

            total_weight = 0.0
            matched_weight = 0.0
            evidence_score_total = 0.0

            valid_requirement_count = 0

            for requirement in requirements:
                skill_name = _get(
                    requirement,
                    "SKILL_NAME",
                    "skill_name",
                    default="",
                )

                if not skill_name:
                    continue

                valid_requirement_count += 1

                weight = _to_float(
                    _get(requirement, "WEIGHT", "weight"),
                    default=1.0,
                )

                if weight <= 0:
                    weight = 1.0

                is_mandatory = _to_bool(
                    _get(
                        requirement,
                        "IS_MANDATORY",
                        "is_mandatory",
                        default=True,
                    )
                )

                taxonomy_category = _get(
                    requirement,
                    "TAXONOMY_CATEGORY",
                    "taxonomy_category",
                )

                required_proficiency = _get(
                    requirement,
                    "REQUIRED_PROFICIENCY",
                    "required_proficiency",
                )

                total_weight += weight

                skill_record = _employee_skill_record(
                    skill_name, confirmed_skills
                )

                if skill_record:
                    proficiency = _proficiency_value(
                        _get(
                            skill_record,
                            "INFERRED_PROFICIENCY",
                            "inferred_proficiency",
                        )
                    )
                    required_level = _required_proficiency_value(
                        required_proficiency
                    )
                    proficiency_fit = min(
                        proficiency / required_level, 1.0
                    )
                    confidence = min(
                        max(
                            _to_float(
                                _get(
                                    skill_record,
                                    "EVIDENCE_CONFIDENCE",
                                    "evidence_confidence",
                                    default=0.5,
                                ),
                                0.5,
                            ),
                            0.0,
                        ),
                        1.0,
                    )
                    project_count = _to_float(
                        _get(
                            skill_record,
                            "PROJECT_EVIDENCE_COUNT",
                            "project_evidence_count",
                            default=0,
                        )
                    )
                    project_factor = min(project_count / 3.0, 1.0)
                    matched_weight += weight * proficiency_fit
                    evidence_score_total += weight * (
                        (confidence * 0.7) + (project_factor * 0.3)
                    )

                    matched_skills.append({
                        "skill_name": skill_name,
                        "taxonomy_category": taxonomy_category,
                        "weight": weight,
                        "inferred_proficiency": _get(
                            skill_record,
                            "INFERRED_PROFICIENCY",
                            "inferred_proficiency",
                            default="Intermediate",
                        ),
                        "proficiency_fit": round(
                            proficiency_fit * 100, 2
                        ),
                        "evidence_confidence": round(
                            confidence * 100, 2
                        ),
                        "project_evidence_count": int(project_count),
                        "manager_validated": _to_bool(
                            _get(
                                skill_record,
                                "MANAGER_VALIDATED",
                                "manager_validated",
                                default=False,
                            )
                        ),
                    })

                else:
                    missing_skills.append({
                        "skill_name": skill_name,
                        "taxonomy_category": taxonomy_category,
                        "required_proficiency": required_proficiency,
                        "is_mandatory": is_mandatory,
                        "weight": weight,
                    })

                    if is_mandatory:
                        missing_mandatory_skills.append(skill_name)

            warning = _experience_warning(
                employee,
                role,
            )
            evidence_score = round(
                (evidence_score_total / total_weight) * 100,
                2,
            ) if total_weight else 0.0
            skill_score = round(
                (matched_weight / total_weight) * 100,
                2,
            ) if total_weight else 0.0
            experience_score = 100.0 if not warning else 60.0
            match_score = round(
                (skill_score * (55 / 90))
                + (evidence_score * (20 / 90))
                + (experience_score * (15 / 90)),
                2,
            ) if total_weight else 0.0

            role_title = _get(
                role,
                "TITLE",
                "title",
                default="Untitled role",
            )

            employee_name = _get(
                employee,
                "FULL_NAME",
                "full_name",
                default="Employee",
            )

            explanation_parts = [
                (
                    f"{employee_name} matched "
                    f"{len(matched_skills)} of "
                    f"{valid_requirement_count} listed skill "
                    f"requirements for {role_title}. "
                    f"The weighted skill match is "
                    f"{match_score:.2f}%."
                )
            ]

            if missing_mandatory_skills:
                explanation_parts.append(
                    "Missing mandatory skills: "
                    + ", ".join(missing_mandatory_skills)
                    + "."
                )

            elif valid_requirement_count:
                explanation_parts.append(
                    "All listed mandatory skill requirements are met."
                )

            if warning:
                explanation_parts.append(warning)

            results.append({
                "employee_id": str(employee_id),
                "employee_name": employee_name,

                "current_role": _get(
                    employee,
                    "CURRENT_ROLE",
                    "current_role",
                ),

                "years_experience": _get(
                    employee,
                    "YEARS_EXPERIENCE",
                    "years_experience",
                ),

                "job_role_id": str(job_role_id),
                "job_title": role_title,

                "department": _get(
                    role,
                    "DEPARTMENT",
                    "department",
                ),

                "match_score": match_score,
                "match_status": "completed",

                "matched_skills": matched_skills,
                "missing_skills": missing_skills,

                "missing_mandatory_skills": (
                    missing_mandatory_skills
                ),

                "experience_warning": warning,
                "score_breakdown": {
                    "skill_coverage": skill_score,
                    "evidence_strength": evidence_score,
                    "experience_fit": experience_score,
                },

                "match_explanation": " ".join(
                    explanation_parts
                ),
            })

    results.sort(
        key=lambda item: (
            item["employee_id"],
            -item["match_score"],
            item["job_role_id"],
        )
    )

    return results


async def _run_matching_mcp(
    employees: list[dict],
    job_roles: list[dict],
    job_requirements: Any,
    employee_skills: Any,
) -> list[dict]:
    server_script = (
        Path(__file__).resolve().parents[1]
        / "mcp_server"
        / "matching_mcp_server.py"
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
                "run_matching",
                arguments={
                    "employees_json": json.dumps(
                        employees,
                        default=_json_default,
                    ),
                    "job_roles_json": json.dumps(
                        job_roles,
                        default=_json_default,
                    ),
                    "job_requirements_json": json.dumps(
                        job_requirements,
                        default=_json_default,
                    ),
                    "employee_skills_json": json.dumps(
                        employee_skills,
                        default=_json_default,
                    ),
                },
            )

            if response.isError or not response.content:
                raise RuntimeError("MCP matching tool execution failed.")

            payload = json.loads(response.content[0].text)
            results = payload.get("results")
            if not isinstance(results, list):
                raise ValueError("MCP matching returned an invalid result list.")

            return results


def run_inclusive_matching(
    employees: list[dict],
    job_roles: list[dict],
    job_requirements: Any,
    employee_skills: Any,
) -> list[dict]:
    """Run Opportunity Matching through the Matching MCP server."""
    return asyncio.run(
        _run_matching_mcp(
            employees,
            job_roles,
            job_requirements,
            employee_skills,
        )
    )
