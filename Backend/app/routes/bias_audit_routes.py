
import logging

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from app.utils.hr_auth_dependencies import get_current_hr

from app.controllers.bias_audit_controller import (
    run_bias_review,
    list_bias_audit_flags,
    get_bias_audit_flag,
    review_bias_flag,
    record_hr_matching_decision,
    list_hr_matching_decisions,
)

from app.schemas.bias_audit_schema import (
    BiasAuditRunResponse,
    RunBiasAuditRequest,
    BiasAuditFlagsResponse,
    BiasAuditFlagDetailResponse,
    ReviewBiasFlagRequest,
    ReviewBiasFlagResponse,
    HRMatchDecisionRequest,
    HRMatchDecisionsResponse,
)


logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/hr/bias",
    tags=["HR Bias Audit & Review"],
)


# ---------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------

def _get_hr_id(current_hr):
    if isinstance(current_hr, dict):
        return (
            current_hr.get("hr_id")
            or current_hr.get("HR_ID")
        )

    return (
        getattr(current_hr, "hr_id", None)
        or getattr(current_hr, "HR_ID", None)
    )


def _get_authenticated_hr(current_hr):
    hr_id = _get_hr_id(current_hr)

    if not hr_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid HR authentication.",
        )

    return hr_id


# ---------------------------------------------------------------------
# RUN BIAS REVIEW AGENT
# ---------------------------------------------------------------------

@router.post(
    "/run",
    response_model=BiasAuditRunResponse,
    status_code=status.HTTP_200_OK,
)
def run_bias_audit_endpoint(
    request: RunBiasAuditRequest,
    current_hr: dict = Depends(get_current_hr),
):
    try:
        hr_id = _get_authenticated_hr(current_hr)

        return run_bias_review(
            employee_id=request.employee_id,
            match_ids=request.match_ids,
            job_role_ids=request.job_role_ids,
            actor=hr_id,
        )

    except HTTPException:
        raise

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    except Exception:
        logger.exception("Bias review execution failed.")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to execute Bias Review Agent.",
        )


# ---------------------------------------------------------------------
# LIST BIAS FLAGS
# ---------------------------------------------------------------------

@router.get(
    "/flags",
    response_model=BiasAuditFlagsResponse,
)
def get_bias_flags(
    review_status: str = None,
    flag_type: str = None,
    job_role_id: str = None,
    current_hr: dict = Depends(get_current_hr),
):
    try:
        return list_bias_audit_flags(
            review_status=review_status,
            flag_type=flag_type,
            job_role_id=job_role_id,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    except Exception:
        logger.exception("Failed to retrieve bias audit flags.")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve bias audit flags.",
        )


# ---------------------------------------------------------------------
# GET SINGLE BIAS FLAG
# ---------------------------------------------------------------------

@router.get(
    "/flags/{flag_id}",
    response_model=BiasAuditFlagDetailResponse,
)
def get_bias_flag_details(
    flag_id: str,
    current_hr: dict = Depends(get_current_hr),
):
    try:
        result = get_bias_audit_flag(flag_id)

        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bias audit flag not found.",
            )

        return result

    except HTTPException:
        raise

    except Exception:
        logger.exception(
            "Failed to retrieve bias audit flag %s.",
            flag_id,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve bias audit flag.",
        )


# ---------------------------------------------------------------------
# REVIEW BIAS FLAG
# ---------------------------------------------------------------------

@router.patch(
    "/flags/{flag_id}/review",
    response_model=ReviewBiasFlagResponse,
)
def review_flag(
    flag_id: str,
    request: ReviewBiasFlagRequest,
    current_hr: dict = Depends(get_current_hr),
):
    try:
        hr_id = _get_authenticated_hr(current_hr)

        result = review_bias_flag(
            flag_id=flag_id,
            hr_id=hr_id,
            review_status=request.review_status,
            review_comments=request.review_comments,
        )

        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bias audit flag not found.",
            )

        return result

    except HTTPException:
        raise

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    except Exception:
        logger.exception(
            "Failed to review bias audit flag %s.",
            flag_id,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to review bias audit flag.",
        )


# ---------------------------------------------------------------------
# GET HR DECISIONS FOR A MATCH
# ---------------------------------------------------------------------

@router.get(
    "/decisions/{match_id}",
    response_model=HRMatchDecisionsResponse,
)
def get_match_decisions(
    match_id: str,
    current_hr: dict = Depends(get_current_hr),
):
    try:
        return list_hr_matching_decisions(match_id)

    except Exception:
        logger.exception(
            "Failed to retrieve HR decisions for match %s.",
            match_id,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve HR matching decisions.",
        )


# ---------------------------------------------------------------------
# RECORD HR MATCH DECISION
# ---------------------------------------------------------------------

@router.post(
    "/decisions/{match_id}",
    status_code=status.HTTP_201_CREATED,
)
def create_match_decision(
    match_id: str,
    request: HRMatchDecisionRequest,
    current_hr: dict = Depends(get_current_hr),
):
    try:
        hr_id = _get_authenticated_hr(current_hr)

        result = record_hr_matching_decision(
            match_id=match_id,
            hr_id=hr_id,
            decision=request.decision,
            comments=request.comments,
            override_reason=request.override_reason,
        )

        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Matching result not found.",
            )

        return result

    except HTTPException:
        raise

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    except Exception:
        logger.exception(
            "Failed to record HR decision for match %s.",
            match_id,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to record HR matching decision.",
        )
