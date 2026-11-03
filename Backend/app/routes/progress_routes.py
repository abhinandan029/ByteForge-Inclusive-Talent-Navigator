from fastapi import APIRouter, Depends, HTTPException, status

from app.models.progress_model import (
    add_project, delete_project, get_employee_progress,
    save_career_goals, validate_skill,
)
from app.schemas.progress_schema import (
    CareerGoalsRequest, ManagerValidationRequest, ProjectCreateRequest,
)
from app.utils.auth_dependencies import get_current_employee, require_password_changed
from app.utils.hr_auth_dependencies import get_current_hr

router = APIRouter(prefix="/api/progress", tags=["Employee Progress"])


def _employee(employee=Depends(get_current_employee)):
    return require_password_changed(employee)


@router.get("")
def get_progress(employee=Depends(_employee)):
    return get_employee_progress(employee["employee_id"])


@router.put("/goals")
def update_goals(payload: CareerGoalsRequest, employee=Depends(_employee)):
    save_career_goals(employee["employee_id"], payload.target_role, payload.preferred_department)
    return get_employee_progress(employee["employee_id"])


@router.post("/projects", status_code=status.HTTP_201_CREATED)
def create_project(payload: ProjectCreateRequest, employee=Depends(_employee)):
    return add_project(employee["employee_id"], payload.model_dump())


@router.delete("/projects/{project_id}")
def remove_project(project_id: str, employee=Depends(_employee)):
    try:
        delete_project(employee["employee_id"], project_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return {"message": "Project removed."}


@router.patch("/hr/{employee_id}/skills/{skill_name}")
def manager_validate(
    employee_id: str,
    skill_name: str,
    payload: ManagerValidationRequest,
    hr=Depends(get_current_hr),
):
    try:
        validate_skill(employee_id, skill_name, payload.validated, payload.note)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return {"message": "Skill validation updated.", "validated": payload.validated}
