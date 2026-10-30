
from fastapi import APIRouter, Depends, HTTPException, status

from app.controllers.skills_controller import (
    extract_skills_controller,
    confirm_skills_controller,
    get_skills_state_controller,
    get_skills_audit_controller
)

from app.schemas.skills_schema import (
    ProfileExtractRequest,
    SkillConfirmRequest
)

from app.utils.auth_dependencies import (
    get_current_employee,
    require_password_changed
)


router = APIRouter(
    prefix="/api/skills",
    tags=["Employee Skills"]
)


# ==================================================
# AUTHENTICATION DEPENDENCY
# ==================================================

def get_active_employee(
    employee: dict = Depends(get_current_employee)
):
    """
    Ensures the employee is authenticated and has
    changed their temporary password.
    """
    return require_password_changed(employee)


# ==================================================
# 1. EXTRACT SKILLS
# ==================================================

@router.post("/extract")
async def extract_employee_skills(
    payload: ProfileExtractRequest,
    employee: dict = Depends(get_active_employee)
):
    # Always use the authenticated employee ID.
    payload.employee_id = employee["employee_id"]

    return await extract_skills_controller(payload)


# ==================================================
# 2. CONFIRM SKILLS
# ==================================================

@router.post("/confirm")
async def confirm_employee_skills(
    payload: SkillConfirmRequest,
    employee: dict = Depends(get_active_employee)
):
    # Prevent employees from confirming skills
    # under another employee's ID.
    payload.employee_id = employee["employee_id"]

    return await confirm_skills_controller(payload)


# ==================================================
# 3. GET AUDIT LOGS
# ==================================================

@router.get("/audit/logs")
async def employee_audit_logs(
    employee: dict = Depends(get_active_employee)
):
    # Employees can only see their own audit logs.
    return await get_skills_audit_controller(
        employee["employee_id"]
    )


# ==================================================
# 4. GET EMPLOYEE SKILLS STATE
# ==================================================

@router.get("/{employee_id}")
async def employee_skills_state(
    employee_id: str,
    employee: dict = Depends(get_active_employee)
):
    # Prevent access to another employee's skills.
    if employee_id != employee["employee_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access this employee's skills"
        )

    return await get_skills_state_controller(
        employee["employee_id"]
    )
