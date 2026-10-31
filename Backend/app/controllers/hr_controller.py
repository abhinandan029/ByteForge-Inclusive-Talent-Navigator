from utils.security import (
    verify_password,
    create_hr_access_token
)
from app.models.hr_model import (
    get_hr_auth_record,
    get_hr_dashboard_counts
)


def login_hr(email: str, password: str):
    hr = get_hr_auth_record(email)

    # Generic error: don't reveal whether the email exists.
    if not hr or not hr.get("password_hash"):
        return None

    if not hr.get("is_active"):
        return None

    if not verify_password(password, hr["password_hash"]):
        return None

    token = create_hr_access_token(hr["hr_id"])

    return {
        "access_token": token,
        "hr": {
            "hr_id": hr["hr_id"],
            "full_name": hr["full_name"],
            "email": hr["email"],
            "department": hr.get("department")
        }
    }

def get_hr_dashboard():
    counts = get_hr_dashboard_counts()

    return {
        "message": "HR dashboard data retrieved successfully",
        "stats": counts
    }