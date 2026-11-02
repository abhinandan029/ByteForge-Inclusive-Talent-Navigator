from app.database.connection import (
    get_connection,
    release_connection
)


def get_hr_auth_record(email: str):
    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT
                HR_ID,
                FULL_NAME,
                EMAIL,
                PASSWORD_HASH,
                DEPARTMENT,
                IS_ACTIVE
            FROM HR_USERS
            WHERE EMAIL = ?
            """,
            (email,)
        )

        row = cursor.fetchone()

        if not row:
            return None

        columns = [
            column[0].lower()
            for column in cursor.description
        ]

        return dict(zip(columns, row))

    finally:
        if cursor:
            cursor.close()

        if conn:
            release_connection(conn)


def get_hr_by_id(hr_id: str):
    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT
                HR_ID,
                FULL_NAME,
                EMAIL,
                DEPARTMENT,
                IS_ACTIVE
            FROM HR_USERS
            WHERE HR_ID = ?
            """,
            (hr_id,)
        )

        row = cursor.fetchone()

        if not row:
            return None

        columns = [
            column[0].lower()
            for column in cursor.description
        ]

        return dict(zip(columns, row))

    finally:
        if cursor:
            cursor.close()

        if conn:
            release_connection(conn)


def get_hr_dashboard_counts():
    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        queries = {
            "total_employees": """
                SELECT COUNT(*)
                FROM employees
            """,
            "employees_ready_for_matching": """
                SELECT COUNT(*)
                FROM employees
                WHERE READY_FOR_MATCHING = 1
            """,
            "active_job_roles": """
                SELECT COUNT(*)
                FROM job_roles
                WHERE STATUS = 'active'
            """,
            "total_matches": """
                SELECT COUNT(*)
                FROM matching_results mr
                INNER JOIN job_roles jr
                    ON jr.JOB_ROLE_ID = mr.JOB_ROLE_ID
                   AND jr.STATUS = 'active'
            """,
            "pending_bias_reviews": """
                SELECT COUNT(*)
                FROM bias_audit_flags
                WHERE REVIEW_STATUS = 'pending'
            """
        }

        counts = {}

        for key, query in queries.items():
            cursor.execute(query)
            row = cursor.fetchone()
            counts[key] = row[0] if row else 0

        return counts

    finally:
        if cursor:
            cursor.close()

        if conn:
            release_connection(conn)