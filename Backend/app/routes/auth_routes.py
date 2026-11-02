import os

from fastapi import APIRouter, HTTPException, Response, status, Depends

from app.controllers.auth_controller import login_employee, change_employee_password
from app.schemas.auth_schema import (
    EmployeeLoginRequest,
    EmployeeLoginResponse,
    ChangePasswordRequest
)
from app.utils.auth_dependencies import get_current_employee


router = APIRouter(
    prefix="/api/auth",
    tags=["Employee Authentication"]
)

COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() == "true"
COOKIE_MAX_AGE = 60 * int(os.getenv("JWT_EXPIRE_MINUTES", "60"))


@router.post(
    "/login",
    response_model=EmployeeLoginResponse
)
def employee_login(
    payload: EmployeeLoginRequest,
    response: Response
):
    result = login_employee(
        payload.employee_id.strip(),
        payload.password
    )

    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid employee ID or password"
        )

    response.set_cookie(
        key="employee_token",
        value=result["access_token"],
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        max_age=COOKIE_MAX_AGE,
        path="/"
    )

    return {
        "message": "Login successful",
        "employee": result["employee"]
    }


@router.post("/logout")
def employee_logout(response: Response):
    response.delete_cookie(
        key="employee_token",
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        path="/"
    )

    return {"message": "Logged out successfully"}


@router.post("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    employee: dict = Depends(get_current_employee)
):
    success = change_employee_password(
        employee["employee_id"],
        payload.new_password
    )

    if not success:
        raise HTTPException(
            status_code=400,
            detail="Unable to update password"
        )

    return {
        "message": "Password changed successfully",
        "must_change_password": False
    }


@router.get("/me")
def get_me(
    employee: dict = Depends(get_current_employee)
):
    return employee