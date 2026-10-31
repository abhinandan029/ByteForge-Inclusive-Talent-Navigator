
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from app.utils.hr_auth_dependencies import get_current_hr

from app.controllers.matching_controller import (
    run_internal_matching,
    get_matching_results,
    get_matching_details
)

from app.schemas.matching_schema import RunMatchingRequest


router = APIRouter(
    prefix="/api/hr/matching",
    tags=["HR Internal Talent Discovery"]
)


# ==========================================
# RUN INTERNAL MATCHING
# ==========================================

@router.post("/run")
def run_matching(
    payload: RunMatchingRequest,
    hr: dict = Depends(get_current_hr)
):
    """
    Run matching between eligible employees
    and active job roles.

    Optional filters:
    - employee_ids
    - job_role_ids
    """

    try:
        result = run_internal_matching(
            employee_ids=payload.employee_ids,
            job_role_ids=payload.job_role_ids
        )

        return result

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )

    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while running internal matching."
        )


# ==========================================
# GET ALL MATCHING RESULTS
# ==========================================

@router.get("/results")
def get_all_matching_results(
    employee_id: str | None = None,
    job_role_id: str | None = None,
    hr: dict = Depends(get_current_hr)
):
    """
    Retrieve matching results.

    Optional query parameters:
    - employee_id
    - job_role_id
    """

    try:
        return get_matching_results(
            employee_id=employee_id,
            job_role_id=job_role_id
        )

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to retrieve matching results."
        )


# ==========================================
# GET ONE MATCHING RESULT
# ==========================================

@router.get("/results/{match_id}")
def get_one_matching_result(
    match_id: str,
    hr: dict = Depends(get_current_hr)
):
    """
    Retrieve one matching result using MATCH_ID.
    """

    try:
        result = get_matching_details(match_id)

        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Matching result not found."
            )

        return {
            "message": "Matching result retrieved successfully",
            "result": result
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to retrieve matching result."
        )
