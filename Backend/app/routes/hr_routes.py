import os

from fastapi import (
    APIRouter,
    HTTPException,
    Response,
    status,
    Depends
)

from app.controllers.hr_controller import (
    login_hr,
    get_hr_dashboard
)

from app.schemas.hr_schema import (
    HRLoginRequest,
    HRLoginResponse,
    HRProfileResponse,
    HRDashboardResponse
)

from app.utils.hr_auth_dependencies import get_current_hr


router = APIRouter(
    prefix="/api/hr",
    tags=["HR Authentication"]
)


COOKIE_SECURE = (
    os.getenv("COOKIE_SECURE", "false").lower() == "true"
)

COOKIE_MAX_AGE = 60 * int(
    os.getenv("JWT_EXPIRE_MINUTES", "60")
)


@router.post(
    "/login",
    response_model=HRLoginResponse
)
def hr_login(
    payload: HRLoginRequest,
    response: Response
):

    result = login_hr(
        payload.hr_id.strip(),
        payload.password
    )

    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid HR ID or password"
        )

    response.set_cookie(
        key="hr_token",
        value=result["access_token"],
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        max_age=COOKIE_MAX_AGE,
        path="/"
    )

    return {
        "message": "HR login successful",
        "hr": result["hr"]
    }


@router.post("/logout")
def hr_logout(response: Response):

    response.delete_cookie(
        key="hr_token",
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        path="/"
    )

    return {
        "message": "HR logged out successfully"
    }


@router.get(
    "/me",
    response_model=HRProfileResponse
)
def get_hr_profile(
    hr: dict = Depends(get_current_hr)
):
    return hr


@router.get(
    "/dashboard",
    response_model=HRDashboardResponse
)
def hr_dashboard(
    hr: dict = Depends(get_current_hr)
):
    return get_hr_dashboard()