
import logging

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from app.utils.hr_auth_dependencies import get_current_hr

from app.controllers.matching_controller import (
    run_internal_matching,
    get_matching_results,
    get_matching_details,
)

from app.schemas.matching_schema import (
    RunMatchingRequest,
    RunMatchingResponse,
    MatchingResultsResponse,
    MatchingDetailResponse,
)


logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/hr/matching",
    tags=["HR Internal Talent Discovery"],
)


# ---------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------

def _get_hr_actor(hr):
    """Extract the HR identifier for the audit record."""
    if isinstance(hr, dict):
        return (
            hr.get("HR_ID")
            or hr.get("hr_id")
            or "HR"
        )

    return (
        getattr(hr, "HR_ID", None)
        or getattr(hr, "hr_id", None)
        or "HR"
    )


# ---------------------------------------------------------------------
# Run Opportunity Matching
# ---------------------------------------------------------------------

@router.post(
    "/run",
    response_model=RunMatchingResponse,
    status_code=status.HTTP_200_OK,
)
def run_matching(
    payload: RunMatchingRequest,
    hr=Depends(get_current_hr),
):
    try:
        result = run_internal_matching(
            employee_ids=payload.employee_ids,
            job_role_ids=payload.job_role_ids,
            actor=_get_hr_actor(hr),
        )

        return result

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )

    except Exception:
        logger.exception(
            "Opportunity matching failed."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Opportunity matching failed. Please try again.",
        )


# ---------------------------------------------------------------------
# Get matching results
# ---------------------------------------------------------------------

@router.get(
    "/results",
    response_model=MatchingResultsResponse,
)
def get_all_matching_results(
    employee_id: str | None = None,
    job_role_id: str | None = None,
    hr=Depends(get_current_hr),
):
    try:
        return get_matching_results(
            employee_id=employee_id,
            job_role_id=job_role_id,
        )

    except Exception:
        logger.exception(
            "Failed to retrieve matching results."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not retrieve matching results.",
        )


# ---------------------------------------------------------------------
# Get one matching result
# ---------------------------------------------------------------------

@router.get(
    "/results/{match_id}",
    response_model=MatchingDetailResponse,
)
def get_one_matching_result(
    match_id: str,
    hr=Depends(get_current_hr),
):
    try:
        result = get_matching_details(match_id)

        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Matching result not found.",
            )

        return {
            "message": "Matching result retrieved successfully.",
            "result": result,
        }

    except HTTPException:
        raise

    except Exception:
        logger.exception(
            "Failed to retrieve matching result %s.",
            match_id,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not retrieve the matching result.",
        )
