
from utils.database import get_connection, release_connection


def get_employee_auth_record(employee_id: str):
    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT
                EMPLOYEE_ID,
                FULL_NAME,
                PASSWORD_HASH,
                MUST_CHANGE_PASSWORD
            FROM EMPLOYEES
            WHERE EMPLOYEE_ID = ?
            """,
            (employee_id,)
        )

        row = cursor.fetchone()

        if not row:
            return None

        columns = [column[0].lower() for column in cursor.description]

        return dict(zip(columns, row))

    finally:
        if cursor:
            cursor.close()

        if conn:
            release_connection(conn)


def set_employee_password(
    employee_id: str,
    password_hash: str,
    must_change_password: bool = True
):
    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT EMPLOYEE_ID
            FROM EMPLOYEES
            WHERE EMPLOYEE_ID = ?
            """,
            (employee_id,)
        )

        if not cursor.fetchone():
            return False

        cursor.execute(
            """
            UPDATE EMPLOYEES
            SET
                PASSWORD_HASH = ?,
                MUST_CHANGE_PASSWORD = ?
            WHERE EMPLOYEE_ID = ?
            """,
            (
                password_hash,
                1 if must_change_password else 0,
                employee_id
            )
        )

        conn.commit()
        return True

    except Exception:
        if conn:
            conn.rollback()
        raise

    finally:
        if cursor:
            cursor.close()

        if conn:
            release_connection(conn)