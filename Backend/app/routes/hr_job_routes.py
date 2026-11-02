from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from app.utils.hr_auth_dependencies import get_current_hr

from app.controllers.hr_job_controller import (
    list_job_roles,
    get_job_role,
    create_hr_job_role,
    edit_job_role,
    change_job_role_status,
    add_skills_to_job_role,
    remove_skill_from_job_role,
    get_hr_activity
)

from app.schemas.hr_job_schema import (
    CreateJobRoleRequest,
    UpdateJobRoleRequest,
    AddJobSkillsRequest,
    UpdateJobRoleStatusRequest
)


router = APIRouter(
    prefix="/api/hr/jobs",
    tags=["HR Job Role Management"]
)


@router.get("/")
def get_all_roles(
    hr: dict = Depends(get_current_hr)
):
    return {
        "job_roles": list_job_roles()
    }


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_role(
    payload: CreateJobRoleRequest,
    hr: dict = Depends(get_current_hr)
):
    try:
        role = create_hr_job_role(
            hr["hr_id"],
            payload.model_dump()
        )

        return {
            "message": "Job role created successfully",
            "job_role": role
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


@router.get("/{job_role_id}")
def get_role(
    job_role_id: str,
    hr: dict = Depends(get_current_hr)
):
    role = get_job_role(job_role_id)

    if not role:
        raise HTTPException(
            status_code=404,
            detail="Job role not found"
        )

    return {
        "job_role": role
    }


@router.put("/{job_role_id}")
def update_role(
    job_role_id: str,
    payload: UpdateJobRoleRequest,
    hr: dict = Depends(get_current_hr)
):
    try:
        result = edit_job_role(
            job_role_id,
            payload.model_dump(),
            hr["hr_id"]
        )

        if result is None:
            raise HTTPException(
                status_code=404,
                detail="Job role not found"
            )

        if result == "predefined":
            raise HTTPException(
                status_code=403,
                detail="Predefined job roles cannot be edited"
            )

        return {
            "message": "Job role updated successfully",
            "job_role": result
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


@router.patch("/{job_role_id}/status")
def change_role_status(
    job_role_id: str,
    payload: UpdateJobRoleStatusRequest,
    hr: dict = Depends(get_current_hr)
):
    result = change_job_role_status(
        job_role_id,
        payload.status,
        hr["hr_id"]
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Job role not found"
        )

    if result == "predefined":
        raise HTTPException(
            status_code=403,
            detail="Predefined job roles cannot be deactivated"
        )

    return {
        "message": f"Job role {payload.status} successfully",
        "job_role_id": job_role_id,
        "status": payload.status
    }


@router.post("/{job_role_id}/skills")
def add_role_skills(
    job_role_id: str,
    payload: AddJobSkillsRequest,
    hr: dict = Depends(get_current_hr)
):
    try:
        role = add_skills_to_job_role(
            job_role_id,
            [skill.model_dump() for skill in payload.skills],
            hr["hr_id"]
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    if not role:
        raise HTTPException(
            status_code=404,
            detail="Job role not found"
        )

    return {
        "message": "Required skills added successfully",
        "job_role": role
    }


@router.delete("/{job_role_id}/skills/{requirement_id}")
def remove_role_skill(
    job_role_id: str,
    requirement_id: str,
    hr: dict = Depends(get_current_hr)
):
    role = remove_skill_from_job_role(
        job_role_id,
        requirement_id,
        hr["hr_id"]
    )

    if not role:
        raise HTTPException(
            status_code=404,
            detail="Required skill not found for this job role"
        )

    return {
        "message": "Required skill removed successfully",
        "job_role": role
    }


@router.get("/audit/logs")
def get_my_hr_audit_logs(
    hr: dict = Depends(get_current_hr)
):
    return {
        "audit_logs": get_hr_activity(hr["hr_id"])
    }