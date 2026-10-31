from fastapi import Request, HTTPException, status
from jwt import InvalidTokenError

from utils.security import decode_access_token
from app.models.hr_model import get_hr_by_id


def get_current_hr(request: Request):

    token = request.cookies.get("hr_token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="HR authentication required"
        )

    try:
        payload = decode_access_token(token)

        if payload.get("type") != "hr_access":
            raise InvalidTokenError("Invalid token type")

        hr_id = payload.get("sub")

        if not hr_id:
            raise InvalidTokenError("Missing HR ID")

    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token"
        )

    hr = get_hr_by_id(hr_id)

    if not hr or not hr.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="HR account is unavailable"
        )

    return {
        "hr_id": hr["hr_id"],
        "full_name": hr["full_name"],
        "email": hr["email"],
        "department": hr.get("department")
    }