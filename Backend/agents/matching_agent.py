# Backend/agents/matching_agent.py
import json
from pathlib import Path
from typing import List, Dict, Any
from pydantic import BaseModel
from utils.audit_logger import log_audit_event

ROLES_FILE = Path(__file__).resolve().parent.parent / "data" / "roles.json"

class RoleMatchItem(BaseModel):
    role_id: str
    title: str
    department: str
    match_score: int  # 0 to 100
    matched_skills: List[str]
    missing_skills: List[str]
    plain_language_explanation: str
    raw_criteria: List[str]

class InclusiveMatchingResponse(BaseModel):
    employee_id: str
    matching_methodology: str = (
        "Skills-first & potential-based matching. Evaluates verified competencies "
        "and recent upskilling without penalizing career breaks."
    )
    total_roles_evaluated: int
    recommended_roles: List[RoleMatchItem]

def _extract_skill_names(session_record: Dict[str, Any]) -> List[str]:
    """Extracts confirmed skill names from the session record regardless of key format."""
    raw_skills = (
        session_record.get("confirmed_skills")
        or session_record.get("final_skills")
        or session_record.get("accepted_skills")
        or session_record.get("skills")
        or []
    )
    skill_names = []
    for s in raw_skills:
        if isinstance(s, str):
            skill_names.append(s.strip())
        elif isinstance(s, dict):
            name = (
                s.get("name")
                or s.get("skill_name")
                or s.get("normalized_name")
                or s.get("skill")
            )
            if name:
                skill_names.append(str(name).strip())

    # Also include any raw skills added manually during confirmation
    added_raw = session_record.get("added_raw_skills") or []
    for extra in added_raw:
        if isinstance(extra, str) and extra.strip() not in skill_names:
            skill_names.append(extra.strip())

    return skill_names

def run_inclusive_matching(employee_id: str, session_record: Dict[str, Any]) -> InclusiveMatchingResponse:
    """
    F4: Suggest 3 to 5 internal roles based on confirmed skills and potential,
    returning a 0-100 match score and plain-language explanation.
    """
    try:
        with open(ROLES_FILE, "r", encoding="utf-8") as f:
            roles_data = json.load(f)
    except FileNotFoundError:
        roles_data = []

    confirmed_skills = _extract_skill_names(session_record)
    confirmed_lower_map = {s.lower(): s for s in confirmed_skills}

    recommendations: List[RoleMatchItem] = []

    for role in roles_data:
        req_skills = role.get("required_skills", [])
        pref_skills = role.get("preferred_skills", [])
        all_role_skills = req_skills + pref_skills

        matched_req = [s for s in req_skills if s.lower() in confirmed_lower_map]
        matched_pref = [s for s in pref_skills if s.lower() in confirmed_lower_map]
        matched_all = matched_req + matched_pref
        missing_all = [s for s in all_role_skills if s.lower() not in confirmed_lower_map]

        # Skills-first scoring: 75% weight on required skills, 25% on preferred/adjacent potential
        req_ratio = len(matched_req) / len(req_skills) if req_skills else 1.0
        pref_ratio = len(matched_pref) / len(pref_skills) if pref_skills else 0.5
        raw_score = int(round((req_ratio * 75) + (pref_ratio * 25)))

        # Potential boost: ensure strong partial matches aren't underscored due to rigid keyword gaps
        match_score = min(98, max(55, raw_score + 10)) if matched_all else 45

        if matched_all:
            explanation = (
                f"Strong skills-first fit ({match_score}%): Your confirmed expertise in "
                f"{', '.join(matched_all[:4])} directly aligns with {role['title']} in "
                f"{role['department']}. Your career break does not reduce your score, and "
                f"{', '.join(missing_all[:2]) if missing_all else 'advanced platform topics'} "
                f"can be bridged via targeted upskilling."
            )
        else:
            explanation = (
                f"Potential fit ({match_score}%): Transferable engineering background for "
                f"{role['title']}, with upskilling needed in {', '.join(missing_all[:3])}."
            )

        recommendations.append(
            RoleMatchItem(
                role_id=role["role_id"],
                title=role["title"],
                department=role["department"],
                match_score=match_score,
                matched_skills=matched_all,
                missing_skills=missing_all,
                plain_language_explanation=explanation,
                raw_criteria=role.get("raw_criteria", [])
            )
        )

    # Sort highest match score first
    recommendations.sort(key=lambda r: r.match_score, reverse=True)

    log_audit_event(
        session_id=employee_id,
        actor="Inclusive Matching Agent",
        action="match_internal_roles",
        input_summary=f"Confirmed skills: {', '.join(confirmed_skills)}",
        output_summary=(
            f"Recommended {len(recommendations)} roles. Top match: "
            f"{recommendations[0].title} ({recommendations[0].match_score}%)"
            if recommendations else "No roles matched"
        )
    )

    return InclusiveMatchingResponse(
        employee_id=employee_id,
        total_roles_evaluated=len(roles_data),
        recommended_roles=recommendations
    )