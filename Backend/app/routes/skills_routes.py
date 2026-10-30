from fastapi import APIRouter
from app.models.skills_model import (
    ProfileExtractRequest,
    ProfileExtractResponse,
    SkillConfirmRequest,
    SkillConfirmResponse,
    EmployeeSkillsStateResponse
)
from app.controllers import skills_controller

router = APIRouter(prefix="/api/v1/skills", tags=["Skills Discovery & Confirmation"])

@router.post("/extract", response_model=ProfileExtractResponse)
async def extract_skills(payload: ProfileExtractRequest):
    """FR-1 & FR-2: Extract structured skills with evidence snippets from profile text."""
    return await skills_controller.extract_skills_controller(payload)

@router.post("/confirm", response_model=SkillConfirmResponse)
async def confirm_skills(payload: SkillConfirmRequest):
    """FR-3 & R1: Employee accepts, removes, or adds skills before matching."""
    return await skills_controller.confirm_skills_controller(payload)

@router.get("/audit/logs")
async def get_skills_audit_logs():
    """FR-9 & S4: View audit log events for skills extraction and human confirmation."""
    return await skills_controller.get_skills_audit_controller()

@router.get("/{employee_id}", response_model=EmployeeSkillsStateResponse)
async def get_employee_skills(employee_id: str = "emp-ananya"):
    """Inspect draft extracted skills vs. human-confirmed skills for an employee."""
    return await skills_controller.get_skills_state_controller(employee_id)