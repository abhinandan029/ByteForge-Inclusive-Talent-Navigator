from fastapi import HTTPException
from datetime import datetime, timezone
from typing import List, Dict, Any
from app.models.skills_model import (
    ProfileExtractRequest,
    ProfileExtractResponse,
    SkillItem,
    SkillConfirmRequest,
    SkillConfirmResponse,
    EmployeeSkillsStateResponse
)

# In-memory store for prototype testing before SQLite/JSONL is wired
MOCK_DB: Dict[str, Any] = {
    "extracted_skills": {},
    "confirmed_skills": {},
    "audit_log": []
}

def record_audit_event(actor: str, action: str, tool: str, details: str):
    """Records time, actor, action, and MCP tool for every event (FR-9, S4)."""
    MOCK_DB["audit_log"].append({
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "actor": actor,
        "action": action,
        "tool": tool,
        "details": details
    })

async def _call_skills_mcp_stub(profile_text: str) -> List[SkillItem]:
    """
    TEAMMATE HOOK: Replace this stub with the MCP client call to `skills-server`
    tools: `extract_skills(text)` and `normalize_skills(list)`.
    """
    return [
        SkillItem(
            skill_id="sk-101",
            name="Python",
            taxonomy_category="Backend Development",
            evidence_snippet="built microservices in Python and FastAPI"
        ),
        SkillItem(
            skill_id="sk-102",
            name="FastAPI",
            taxonomy_category="Backend Frameworks",
            evidence_snippet="built microservices in Python and FastAPI"
        ),
        SkillItem(
            skill_id="sk-103",
            name="Docker",
            taxonomy_category="DevOps & Containers",
            evidence_snippet="deployed containerized apps on Docker"
        ),
        SkillItem(
            skill_id="sk-104",
            name="PostgreSQL",
            taxonomy_category="Databases",
            evidence_snippet="optimized PostgreSQL queries"
        ),
        SkillItem(
            skill_id="sk-105",
            name="SAP BTP",
            taxonomy_category="Cloud Platform",
            evidence_snippet="completed a cloud course on SAP BTP"
        )
    ]

async def extract_skills_controller(payload: ProfileExtractRequest) -> ProfileExtractResponse:
    if not payload.profile_text.strip():
        raise HTTPException(status_code=400, detail="Profile text cannot be empty.")

    extracted = await _call_skills_mcp_stub(payload.profile_text)
    MOCK_DB["extracted_skills"][payload.employee_id] = extracted

    record_audit_event(
        actor="Skills Discovery Agent",
        action=f"Extracted {len(extracted)} skills from profile for {payload.employee_id}",
        tool="skills-server:extract_skills, normalize_skills",
        details="Draft skills generated; awaiting employee confirmation"
    )

    return ProfileExtractResponse(
        employee_id=payload.employee_id,
        status="pending_employee_confirmation",
        extracted_skills=extracted
    )

async def confirm_skills_controller(payload: SkillConfirmRequest) -> SkillConfirmResponse:
    if not payload.confirmed_skills:
        raise HTTPException(status_code=400, detail="At least one skill must be confirmed.")

    MOCK_DB["confirmed_skills"][payload.employee_id] = payload.confirmed_skills

    skill_names = ", ".join([s.name for s in payload.confirmed_skills])
    record_audit_event(
        actor=f"Employee ({payload.employee_id})",
        action=f"Confirmed {len(payload.confirmed_skills)} skills: [{skill_names}]",
        tool="audit-server:log_event",
        details="Human-in-the-loop confirmation completed prior to role matching"
    )

    return SkillConfirmResponse(
        employee_id=payload.employee_id,
        status="confirmed",
        confirmed_count=len(payload.confirmed_skills),
        ready_for_matching=True,
        confirmed_skills=payload.confirmed_skills
    )

async def get_skills_state_controller(employee_id: str) -> EmployeeSkillsStateResponse:
    extracted = MOCK_DB["extracted_skills"].get(employee_id, [])
    confirmed = MOCK_DB["confirmed_skills"].get(employee_id, [])

    return EmployeeSkillsStateResponse(
        employee_id=employee_id,
        is_confirmed=len(confirmed) > 0,
        extracted_skills_draft=extracted,
        confirmed_skills_final=confirmed
    )

async def get_skills_audit_controller() -> Dict[str, Any]:
    return {
        "total_events": len(MOCK_DB["audit_log"]),
        "events": MOCK_DB["audit_log"]
    }