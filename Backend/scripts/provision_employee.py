
from getpass import getpass

from app.models.auth_model import set_employee_password
from utils.security import hash_password


def main():
    print("\n=== Employee Account Provisioning ===\n")

    employee_id = input("Employee ID: ").strip()

    if not employee_id:
        print("Employee ID is required.")
        return

    password = getpass("Temporary password: ")
    confirm_password = getpass("Confirm temporary password: ")

    if password != confirm_password:
        print("Passwords do not match.")
        return

    if len(password) < 10:
        print("Temporary password must be at least 10 characters.")
        return

    try:
        password_hash = hash_password(password)

        success = set_employee_password(
            employee_id=employee_id,
            password_hash=password_hash,
            must_change_password=True
        )

        if success:
            print(f"\nAccount provisioned for {employee_id}.")
            print("The employee must change their password at first login.")
        else:
            print("\nEmployee not found. No account was provisioned.")

    except Exception as error:
        print(f"\nProvisioning failed: {error}")


if __name__ == "__main__":
    main()
