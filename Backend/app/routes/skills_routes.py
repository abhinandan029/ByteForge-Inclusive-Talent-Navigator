
from fastapi import APIRouter, Query

from app.schemas.skills_schema import (
    ProfileExtractRequest,
    ProfileExtractResponse,
    SkillConfirmRequest,
    SkillConfirmResponse,
    EmployeeSkillsStateResponse
)

from app.controllers import skills_controller


router = APIRouter(
    prefix="/api/skills",
    tags=["Skills Discovery & Confirmation"]
)


# =====================================================
# EXTRACT SKILLS
# =====================================================

@router.post(
    "/extract",
    response_model=ProfileExtractResponse
)
async def extract_skills(payload: ProfileExtractRequest):

    return await skills_controller.extract_skills_controller(
        payload
    )


# =====================================================
# CONFIRM SKILLS
# =====================================================

@router.post(
    "/confirm",
    response_model=SkillConfirmResponse
)
async def confirm_skills(payload: SkillConfirmRequest):

    return await skills_controller.confirm_skills_controller(
        payload
    )


# =====================================================
# GET AUDIT LOGS
# =====================================================

@router.get("/audit/logs")
async def get_skills_audit_logs(
    employee_id: str | None = Query(default=None)
):

    return await skills_controller.get_skills_audit_controller(
        employee_id
    )


# =====================================================
# GET EMPLOYEE SKILLS AND PROFILE
# =====================================================

@router.get(
    "/{employee_id}",
    response_model=EmployeeSkillsStateResponse
)
async def get_employee_skills(employee_id: str):

    return await skills_controller.get_skills_state_controller(
        employee_id
    )
