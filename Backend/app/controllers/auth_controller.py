
from app.models.auth_model import get_employee_auth_record, set_employee_password
from utils.security import verify_password, create_access_token, hash_password


def login_employee(employee_id: str, password: str):
    employee = get_employee_auth_record(employee_id)

    # Use a generic error so we don't reveal whether an ID exists.
    if not employee or not employee.get("password_hash"):
        return None

    if not verify_password(password, employee["password_hash"]):
        return None

    token = create_access_token(employee_id)

    return {
        "access_token": token,
        "employee": {
            "employee_id": employee["employee_id"],
            "full_name": employee["full_name"],
            "must_change_password": bool(
                employee["must_change_password"]
            )
        }
    }


def change_employee_password(
    employee_id: str,
    new_password: str
):
    password_hash = hash_password(new_password)

    success = set_employee_password(
        employee_id=employee_id,
        password_hash=password_hash,
        must_change_password=False
    )

    return success