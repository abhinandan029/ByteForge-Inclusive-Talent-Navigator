
from fastapi import Request, HTTPException, status
from jwt import InvalidTokenError

from utils.security import decode_access_token
from app.models.auth_model import get_employee_auth_record


def get_current_employee(request: Request):
    token = request.cookies.get("employee_token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    try:
        payload = decode_access_token(token)

        if payload.get("type") != "employee_access":
            raise InvalidTokenError("Invalid token type")

        employee_id = payload.get("sub")

        if not employee_id:
            raise InvalidTokenError("Missing employee ID")

    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token"
        )

    employee = get_employee_auth_record(employee_id)

    if not employee or not employee.get("password_hash"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Employee account is unavailable"
        )

    return {
        "employee_id": employee["employee_id"],
        "full_name": employee["full_name"],
        "must_change_password": bool(
            employee["must_change_password"]
        ),
        "profile_text": employee.get("profile_text") or ""
    }


def require_password_changed(employee: dict):
    if employee["must_change_password"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please change your temporary password first"
        )

    return employee
