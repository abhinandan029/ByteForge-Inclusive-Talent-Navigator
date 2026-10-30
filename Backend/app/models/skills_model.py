
from utils.database import get_connection, release_connection

# ==================================================
# DATABASE HELPERS
# ==================================================

def _fetch_all(cursor):
    """Convert cursor rows into dictionaries using column names."""
    columns = [column[0].lower() for column in cursor.description]
    rows = cursor.fetchall()

    return [
        dict(zip(columns, row))
        for row in rows
    ]


def _fetch_one(cursor):
    """Fetch one row as a dictionary."""
    row = cursor.fetchone()

    if row is None:
        return None

    columns = [column[0].lower() for column in cursor.description]

    return dict(zip(columns, row))


def _close_resources(cursor=None, conn=None):
    if cursor:
        try:
            cursor.close()
        except Exception:
            pass

    if conn:
        release_connection(conn)


def _to_bool(value):
    """
    Convert SAP HANA TINYINT / BOOLEAN values
    into Python Boolean values.
    """
    if isinstance(value, str):
        return value.strip().lower() in ("1", "true", "yes")

    return bool(value)


def _add_audit_log(
    cursor,
    employee_id,
    actor,
    action,
    tool,
    details
):
    cursor.execute(
        """
        INSERT INTO AUDIT_LOGS
        (
            EMPLOYEE_ID,
            ACTOR,
            ACTION,
            TOOL,
            DETAILS
        )
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            employee_id,
            actor,
            action,
            tool,
            details
        )
    )


# ==================================================
# SAVE EXTRACTED SKILLS
# ==================================================

def save_extracted_skills(employee_id, extracted_skills):
    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Verify employee exists
        cursor.execute(
            """
            SELECT EMPLOYEE_ID
            FROM EMPLOYEES
            WHERE EMPLOYEE_ID = ?
            """,
            (employee_id,)
        )

        if not cursor.fetchone():
            raise ValueError("Employee not found")

        # Remove previous draft skills
        cursor.execute(
            """
            DELETE FROM EXTRACTED_SKILLS_DRAFT
            WHERE EMPLOYEE_ID = ?
            """,
            (employee_id,)
        )

        # Save latest extracted skills
        for skill in extracted_skills:
            cursor.execute(
                """
                INSERT INTO EXTRACTED_SKILLS_DRAFT
                (
                    EMPLOYEE_ID,
                    SKILL_ID,
                    NAME,
                    TAXONOMY_CATEGORY,
                    EVIDENCE_SNIPPET
                )
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    employee_id,
                    skill["skill_id"],
                    skill["name"],
                    skill.get("taxonomy_category", "General"),
                    skill.get("evidence_snippet", "")
                )
            )

        # Reset confirmation and matching status.
        # These columns are TINYINT in SAP HANA.
        cursor.execute(
            """
            UPDATE EMPLOYEES
            SET
                IS_CONFIRMED = 0,
                READY_FOR_MATCHING = 0,
                UPDATED_AT = CURRENT_TIMESTAMP
            WHERE EMPLOYEE_ID = ?
            """,
            (employee_id,)
        )

        _add_audit_log(
            cursor,
            employee_id,
            "AI_AGENT",
            "SKILLS_EXTRACTED",
            "SKILLS_DISCOVERY",
            f"{len(extracted_skills)} skills extracted"
        )

        conn.commit()

        return True

    except Exception:
        if conn:
            conn.rollback()
        raise

    finally:
        _close_resources(cursor, conn)


# ==================================================
# SAVE CONFIRMED SKILLS
# ==================================================

def save_confirmed_skills(employee_id, confirmed_skills):
    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Verify employee exists
        cursor.execute(
            """
            SELECT EMPLOYEE_ID
            FROM EMPLOYEES
            WHERE EMPLOYEE_ID = ?
            """,
            (employee_id,)
        )

        if not cursor.fetchone():
            raise ValueError("Employee not found")

        # Replace previously confirmed skills
        cursor.execute(
            """
            DELETE FROM CONFIRMED_SKILLS_FINAL
            WHERE EMPLOYEE_ID = ?
            """,
            (employee_id,)
        )

        # Insert employee-confirmed skills
        for skill in confirmed_skills:
            cursor.execute(
                """
                INSERT INTO CONFIRMED_SKILLS_FINAL
                (
                    EMPLOYEE_ID,
                    NAME,
                    TAXONOMY_CATEGORY,
                    EVIDENCE_SNIPPET
                )
                VALUES (?, ?, ?, ?)
                """,
                (
                    employee_id,
                    skill["name"],
                    skill.get("taxonomy_category", "General"),
                    skill.get("evidence_snippet", "")
                )
            )

        # Mark employee as confirmed and ready for matching.
        # These columns are TINYINT in SAP HANA.
        cursor.execute(
            """
            UPDATE EMPLOYEES
            SET
                IS_CONFIRMED = 1,
                READY_FOR_MATCHING = 1,
                UPDATED_AT = CURRENT_TIMESTAMP
            WHERE EMPLOYEE_ID = ?
            """,
            (employee_id,)
        )

        _add_audit_log(
            cursor,
            employee_id,
            "EMPLOYEE",
            "SKILLS_CONFIRMED",
            "SKILLS_DISCOVERY",
            f"{len(confirmed_skills)} skills confirmed"
        )

        conn.commit()

        return True

    except Exception:
        if conn:
            conn.rollback()
        raise

    finally:
        _close_resources(cursor, conn)


# ==================================================
# GET EMPLOYEE + SKILLS STATE
# ==================================================

def get_employee_skills(employee_id):
    conn = None
    cursor = None

    try:
        # 1. Database connection
        conn = get_connection()
        cursor = conn.cursor()

        # 2. Employee profile
        cursor.execute(
            """
            SELECT
                EMPLOYEE_ID,
                FULL_NAME,
                CURRENT_ROLE,
                GRADE,
                YEARS_EXPERIENCE,
                HAS_CAREER_BREAK,
                IS_CONFIRMED,
                READY_FOR_MATCHING
            FROM EMPLOYEES
            WHERE EMPLOYEE_ID = ?
            """,
            (employee_id,)
        )

        employee = _fetch_one(cursor)

        if not employee:
            raise ValueError("Employee not found")

        employee["has_career_break"] = _to_bool(
            employee["has_career_break"]
        )
        employee["is_confirmed"] = _to_bool(
            employee["is_confirmed"]
        )
        employee["ready_for_matching"] = _to_bool(
            employee["ready_for_matching"]
        )

        # 3. Extracted draft skills
        cursor.execute(
            """
            SELECT
                SKILL_ID,
                NAME,
                TAXONOMY_CATEGORY,
                EVIDENCE_SNIPPET
            FROM EXTRACTED_SKILLS_DRAFT
            WHERE EMPLOYEE_ID = ?
            ORDER BY NAME
            """,
            (employee_id,)
        )

        draft_skills = _fetch_all(cursor)


        # 4. Confirmed skills
        cursor.execute(
            """
            SELECT
                NAME,
                TAXONOMY_CATEGORY,
                EVIDENCE_SNIPPET
            FROM CONFIRMED_SKILLS_FINAL
            WHERE EMPLOYEE_ID = ?
            ORDER BY NAME
            """,
            (employee_id,)
        )

        confirmed_skills = _fetch_all(cursor)

        return {
            "employee": employee,
            "employee_id": employee_id,
            "is_confirmed": employee["is_confirmed"],
            "extracted_skills_draft": draft_skills,
            "confirmed_skills_final": confirmed_skills
        }

    finally:
        _close_resources(cursor, conn)


# ==================================================
# GET AUDIT LOGS
# ==================================================

def get_audit_logs(employee_id=None):
    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        if employee_id:
            cursor.execute(
                """
                SELECT
                    LOG_ID,
                    TIMESTAMP,
                    EMPLOYEE_ID,
                    ACTOR,
                    ACTION,
                    TOOL,
                    DETAILS
                FROM AUDIT_LOGS
                WHERE EMPLOYEE_ID = ?
                ORDER BY TIMESTAMP DESC
                """,
                (employee_id,)
            )
        else:
            cursor.execute(
                """
                SELECT
                    LOG_ID,
                    TIMESTAMP,
                    EMPLOYEE_ID,
                    ACTOR,
                    ACTION,
                    TOOL,
                    DETAILS
                FROM AUDIT_LOGS
                ORDER BY TIMESTAMP DESC
                """
            )

        return _fetch_all(cursor)

    finally:
        _close_resources(cursor, conn)
