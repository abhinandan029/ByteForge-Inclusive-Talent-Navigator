
import json
import uuid

from app.database.connection import (
    get_connection,
    release_connection
)


# --------------------------------------------------
# HELPERS
# --------------------------------------------------

def generate_id(prefix):
    return f"{prefix}-{uuid.uuid4().hex}"


def rows_to_dict(cursor, rows):
    if not rows:
        return []

    columns = [column[0].lower() for column in cursor.description]

    return [
        dict(zip(columns, row))
        for row in rows
    ]


def record_hr_audit(
    cursor,
    hr_id,
    action,
    entity_type=None,
    entity_id=None,
    details=None
):
    cursor.execute(
        """
        INSERT INTO hr_audit_logs (
            HR_ID,
            ACTION,
            ENTITY_TYPE,
            ENTITY_ID,
            DETAILS
        )
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            hr_id,
            action,
            entity_type,
            entity_id,
            details
        )
    )


# --------------------------------------------------
# AUTOMATIC BIAS FLAG GENERATION
# --------------------------------------------------

def create_bias_audit_flags(flags):
    """
    Create flags for matching results.

    A flag is considered duplicate if the same MATCH_ID
    and FLAG_TYPE already exists.

    Existing HR reviews are preserved.
    """

    if not flags:
        return 0

    connection = None
    created_count = 0

    try:
        connection = get_connection()
        cursor = connection.cursor()

        for flag in flags:

            match_id = flag.get("match_id")
            job_role_id = flag.get("job_role_id")
            flag_type = flag.get("flag_type")

            if not match_id or not job_role_id or not flag_type:
                continue

            cursor.execute(
                """
                SELECT FLAG_ID
                FROM bias_audit_flags
                WHERE MATCH_ID = ?
                  AND FLAG_TYPE = ?
                """,
                (
                    match_id,
                    flag_type
                )
            )

            existing = cursor.fetchone()

            if existing:
                continue

            cursor.execute(
                """
                INSERT INTO bias_audit_flags (
                    FLAG_ID,
                    JOB_ROLE_ID,
                    MATCH_ID,
                    FLAG_TYPE,
                    SEVERITY,
                    DESCRIPTION,
                    RECOMMENDATION,
                    REVIEW_STATUS
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    generate_id("FLAG"),
                    job_role_id,
                    match_id,
                    flag_type,
                    flag.get("severity", "medium"),
                    flag.get("description", ""),
                    flag.get("recommendation"),
                    "pending"
                )
            )

            created_count += 1

        connection.commit()

        return created_count

    except Exception:
        if connection:
            connection.rollback()
        raise

    finally:
        if connection:
            release_connection(connection)


# --------------------------------------------------
# LIST BIAS FLAGS
# --------------------------------------------------

def get_bias_audit_flags(
    review_status=None,
    flag_type=None,
    job_role_id=None
):
    connection = None

    try:
        connection = get_connection()
        cursor = connection.cursor()

        query = """
            SELECT
                B.FLAG_ID,
                B.JOB_ROLE_ID,
                B.MATCH_ID,
                B.FLAG_TYPE,
                B.SEVERITY,
                B.DESCRIPTION,
                B.RECOMMENDATION,
                B.REVIEW_STATUS,
                B.REVIEWED_BY_HR,
                B.REVIEWED_AT,
                B.REVIEW_COMMENTS,
                B.CREATED_AT,
                M.EMPLOYEE_ID,
                E.FULL_NAME AS EMPLOYEE_NAME,
                J.TITLE AS JOB_TITLE,
                M.MATCH_SCORE
            FROM bias_audit_flags B
            LEFT JOIN matching_results M
                ON B.MATCH_ID = M.MATCH_ID
            LEFT JOIN employees E
                ON M.EMPLOYEE_ID = E.EMPLOYEE_ID
            LEFT JOIN job_roles J
                ON B.JOB_ROLE_ID = J.JOB_ROLE_ID
            WHERE 1 = 1
        """

        params = []

        if review_status:
            query += " AND B.REVIEW_STATUS = ?"
            params.append(review_status)

        if flag_type:
            query += " AND B.FLAG_TYPE = ?"
            params.append(flag_type)

        if job_role_id:
            query += " AND B.JOB_ROLE_ID = ?"
            params.append(job_role_id)

        query += " ORDER BY B.CREATED_AT DESC"

        cursor.execute(query, tuple(params))

        rows = cursor.fetchall()

        return rows_to_dict(cursor, rows)

    finally:
        if connection:
            release_connection(connection)


# --------------------------------------------------
# GET SINGLE BIAS FLAG
# --------------------------------------------------

def get_bias_audit_flag_by_id(flag_id):
    connection = None

    try:
        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                B.FLAG_ID,
                B.JOB_ROLE_ID,
                B.MATCH_ID,
                B.FLAG_TYPE,
                B.SEVERITY,
                B.DESCRIPTION,
                B.RECOMMENDATION,
                B.REVIEW_STATUS,
                B.REVIEWED_BY_HR,
                B.REVIEWED_AT,
                B.REVIEW_COMMENTS,
                B.CREATED_AT,
                M.EMPLOYEE_ID,
                E.FULL_NAME AS EMPLOYEE_NAME,
                J.TITLE AS JOB_TITLE,
                M.MATCH_SCORE
            FROM bias_audit_flags B
            LEFT JOIN matching_results M
                ON B.MATCH_ID = M.MATCH_ID
            LEFT JOIN employees E
                ON M.EMPLOYEE_ID = E.EMPLOYEE_ID
            LEFT JOIN job_roles J
                ON B.JOB_ROLE_ID = J.JOB_ROLE_ID
            WHERE B.FLAG_ID = ?
            """,
            (flag_id,)
        )

        row = cursor.fetchone()

        if not row:
            return None

        return rows_to_dict(cursor, [row])[0]

    finally:
        if connection:
            release_connection(connection)


# --------------------------------------------------
# HR REVIEWS A BIAS FLAG
# --------------------------------------------------

def review_bias_audit_flag(
    flag_id,
    hr_id,
    review_status,
    review_comments=None
):
    connection = None

    try:
        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT FLAG_ID, REVIEW_STATUS
            FROM bias_audit_flags
            WHERE FLAG_ID = ?
            """,
            (flag_id,)
        )

        existing = cursor.fetchone()

        if not existing:
            return None

        cursor.execute(
            """
            UPDATE bias_audit_flags
            SET
                REVIEW_STATUS = ?,
                REVIEWED_BY_HR = ?,
                REVIEWED_AT = CURRENT_TIMESTAMP,
                REVIEW_COMMENTS = ?
            WHERE FLAG_ID = ?
            """,
            (
                review_status,
                hr_id,
                review_comments,
                flag_id
            )
        )

        record_hr_audit(
            cursor,
            hr_id,
            "Reviewed bias audit flag",
            "BIAS_AUDIT_FLAG",
            flag_id,
            json.dumps({
                "review_status": review_status,
                "review_comments": review_comments
            })
        )

        connection.commit()

        return get_bias_audit_flag_by_id(flag_id)

    except Exception:
        if connection:
            connection.rollback()
        raise

    finally:
        if connection:
            release_connection(connection)


# --------------------------------------------------
# SAVE HR MATCH DECISION
# --------------------------------------------------

def create_hr_match_decision(
    match_id,
    hr_id,
    decision,
    comments=None,
    override_reason=None
):
    connection = None

    try:
        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT MATCH_ID
            FROM matching_results
            WHERE MATCH_ID = ?
            """,
            (match_id,)
        )

        if not cursor.fetchone():
            return None

        decision_id = generate_id("DEC")

        cursor.execute(
            """
            INSERT INTO hr_review_decisions (
                DECISION_ID,
                MATCH_ID,
                HR_ID,
                DECISION,
                COMMENTS,
                OVERRIDE_REASON
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                decision_id,
                match_id,
                hr_id,
                decision,
                comments,
                override_reason
            )
        )

        record_hr_audit(
            cursor,
            hr_id,
            "Recorded HR matching decision",
            "MATCHING_RESULT",
            match_id,
            json.dumps({
                "decision": decision,
                "comments": comments,
                "override_reason": override_reason
            })
        )

        connection.commit()

        return {
            "decision_id": decision_id,
            "match_id": match_id,
            "hr_id": hr_id,
            "decision": decision,
            "comments": comments,
            "override_reason": override_reason
        }

    except Exception:
        if connection:
            connection.rollback()
        raise

    finally:
        if connection:
            release_connection(connection)


# --------------------------------------------------
# GET HR DECISIONS FOR A MATCH
# --------------------------------------------------

def get_hr_match_decisions(match_id):
    connection = None

    try:
        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                DECISION_ID,
                MATCH_ID,
                HR_ID,
                DECISION,
                COMMENTS,
                OVERRIDE_REASON,
                CREATED_AT
            FROM hr_review_decisions
            WHERE MATCH_ID = ?
            ORDER BY CREATED_AT DESC
            """,
            (match_id,)
        )

        rows = cursor.fetchall()

        return rows_to_dict(cursor, rows)

    finally:
        if connection:
            release_connection(connection)
