
import json
import uuid

from app.database.connection import (
    get_connection,
    release_connection
)


# ==========================================
# HELPERS
# ==========================================

def generate_match_id():
    return f"MATCH-{uuid.uuid4().hex}"


def rows_to_dict(cursor, rows):
    columns = [
        column[0].lower()
        for column in cursor.description
    ]

    return [
        dict(zip(columns, row))
        for row in rows
    ]


def build_in_clause(values):
    """
    Creates a parameterized IN clause.

    Example:
        ["EMP001", "EMP002"] -> (?, ?)
    """
    return ", ".join(["?"] * len(values))


# ==========================================
# FETCH ELIGIBLE EMPLOYEES
# ==========================================

def get_matching_employees(employee_ids=None):
    """
    Fetch only employees who are ready for matching.

    Draft or unconfirmed employees are excluded.
    """

    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        query = """
            SELECT
                EMPLOYEE_ID,
                FULL_NAME,
                CURRENT_ROLE,
                GRADE,
                YEARS_EXPERIENCE,
                HAS_CAREER_BREAK,
                READY_FOR_MATCHING
            FROM EMPLOYEES
            WHERE READY_FOR_MATCHING = 1
        """

        params = []

        if employee_ids is not None:
            if not employee_ids:
                return []

            query += (
                f" AND EMPLOYEE_ID IN "
                f"({build_in_clause(employee_ids)})"
            )

            params.extend(employee_ids)

        query += " ORDER BY FULL_NAME"

        cursor.execute(query, tuple(params))

        return rows_to_dict(
            cursor,
            cursor.fetchall()
        )

    finally:
        if cursor:
            cursor.close()

        if conn:
            release_connection(conn)


# ==========================================
# FETCH ACTIVE JOB ROLES
# ==========================================

def get_matching_job_roles(job_role_ids=None):
    """
    Fetch active job roles.

    Optionally filters by selected job role IDs.
    """

    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        query = """
            SELECT
                JOB_ROLE_ID,
                TITLE,
                DEPARTMENT,
                DESCRIPTION,
                EXPERIENCE_MIN,
                EXPERIENCE_MAX,
                STATUS
            FROM JOB_ROLES
            WHERE STATUS = 'active'
        """

        params = []

        if job_role_ids is not None:
            if not job_role_ids:
                return []

            query += (
                f" AND JOB_ROLE_ID IN "
                f"({build_in_clause(job_role_ids)})"
            )

            params.extend(job_role_ids)

        query += " ORDER BY TITLE"

        cursor.execute(query, tuple(params))

        return rows_to_dict(
            cursor,
            cursor.fetchall()
        )

    finally:
        if cursor:
            cursor.close()

        if conn:
            release_connection(conn)


# ==========================================
# FETCH JOB REQUIRED SKILLS
# ==========================================

def get_job_required_skills(job_role_ids):
    """
    Fetch skill requirements for selected job roles.
    """

    if not job_role_ids:
        return {}

    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        query = f"""
            SELECT
                REQUIREMENT_ID,
                JOB_ROLE_ID,
                SKILL_NAME,
                TAXONOMY_CATEGORY,
                REQUIRED_PROFICIENCY,
                IS_MANDATORY,
                WEIGHT
            FROM JOB_REQUIRED_SKILLS
            WHERE JOB_ROLE_ID IN (
                {build_in_clause(job_role_ids)}
            )
            ORDER BY SKILL_NAME
        """

        cursor.execute(query, tuple(job_role_ids))

        rows = rows_to_dict(
            cursor,
            cursor.fetchall()
        )

        requirements = {}

        for row in rows:
            role_id = row["job_role_id"]

            requirements.setdefault(
                role_id,
                []
            ).append(row)

        return requirements

    finally:
        if cursor:
            cursor.close()

        if conn:
            release_connection(conn)


# ==========================================
# FETCH CONFIRMED EMPLOYEE SKILLS
# ==========================================

def get_confirmed_employee_skills(employee_ids):
    """
    Fetch employee skills ONLY from
    CONFIRMED_SKILLS_FINAL.

    EXTRACTED_SKILLS_DRAFT is never accessed here.
    """

    if not employee_ids:
        return {}

    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        query = f"""
            SELECT
                EMPLOYEE_ID,
                NAME,
                TAXONOMY_CATEGORY,
                EVIDENCE_SNIPPET,
                CONFIRMED_AT
            FROM CONFIRMED_SKILLS_FINAL
            WHERE EMPLOYEE_ID IN (
                {build_in_clause(employee_ids)}
            )
            ORDER BY NAME
        """

        cursor.execute(query, tuple(employee_ids))

        rows = rows_to_dict(
            cursor,
            cursor.fetchall()
        )

        employee_skills = {}

        for row in rows:
            employee_id = row["employee_id"]

            employee_skills.setdefault(
                employee_id,
                []
            ).append(row)

        return employee_skills

    finally:
        if cursor:
            cursor.close()

        if conn:
            release_connection(conn)


# ==========================================
# SAVE MATCHING RESULTS
# ==========================================

def save_matching_results(results):
    """
    Insert or update matching results.

    One result is maintained for each
    employee and job role combination.

    All changes are committed together.
    """

    if not results:
        return 0

    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        saved_count = 0

        for result in results:

            employee_id = result["employee_id"]
            job_role_id = result["job_role_id"]

            matched_skills_json = json.dumps(
                result["matched_skills"],
                ensure_ascii=False
            )

            missing_skills_json = json.dumps(
                result["missing_skills"],
                ensure_ascii=False
            )

            explanation = result.get(
                "match_explanation",
                ""
            )

            # Check whether this employee-role pair
            # already has a matching result.

            cursor.execute(
                """
                SELECT MATCH_ID
                FROM MATCHING_RESULTS
                WHERE EMPLOYEE_ID = ?
                  AND JOB_ROLE_ID = ?
                """,
                (
                    employee_id,
                    job_role_id
                )
            )

            existing = cursor.fetchone()

            if existing:

                match_id = existing[0]

                cursor.execute(
                    """
                    UPDATE MATCHING_RESULTS
                    SET
                        MATCH_SCORE = ?,
                        MATCH_STATUS = ?,
                        MATCH_EXPLANATION = ?,
                        MATCHED_SKILLS = ?,
                        MISSING_SKILLS = ?
                    WHERE MATCH_ID = ?
                    """,
                    (
                        result["match_score"],
                        "completed",
                        explanation,
                        matched_skills_json,
                        missing_skills_json,
                        match_id
                    )
                )

            else:

                match_id = generate_match_id()

                cursor.execute(
                    """
                    INSERT INTO MATCHING_RESULTS (
                        MATCH_ID,
                        EMPLOYEE_ID,
                        JOB_ROLE_ID,
                        MATCH_SCORE,
                        MATCH_STATUS,
                        MATCH_EXPLANATION,
                        MATCHED_SKILLS,
                        MISSING_SKILLS
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        match_id,
                        employee_id,
                        job_role_id,
                        result["match_score"],
                        "completed",
                        explanation,
                        matched_skills_json,
                        missing_skills_json
                    )
                )

            result["match_id"] = match_id
            saved_count += 1

        conn.commit()

        return saved_count

    except Exception:
        if conn:
            conn.rollback()

        raise

    finally:
        if cursor:
            cursor.close()

        if conn:
            release_connection(conn)


# ==========================================
# FETCH ALL MATCHING RESULTS
# ==========================================

def get_all_matching_results(
    employee_id=None,
    job_role_id=None
):
    """
    Retrieve matching results with employee
    and job role information.

    Optional filters:
    - employee_id
    - job_role_id
    """

    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        query = """
            SELECT
                M.MATCH_ID,
                M.EMPLOYEE_ID,
                E.FULL_NAME,
                E.CURRENT_ROLE,
                E.YEARS_EXPERIENCE,

                M.JOB_ROLE_ID,
                J.TITLE,
                J.DEPARTMENT,

                M.MATCH_SCORE,
                M.MATCH_STATUS,
                M.MATCH_EXPLANATION,
                M.MATCHED_SKILLS,
                M.MISSING_SKILLS,
                M.CREATED_AT,
                M.UPDATED_AT

            FROM MATCHING_RESULTS M

            INNER JOIN EMPLOYEES E
                ON M.EMPLOYEE_ID = E.EMPLOYEE_ID

            INNER JOIN JOB_ROLES J
                ON M.JOB_ROLE_ID = J.JOB_ROLE_ID

            WHERE 1 = 1
        """

        params = []

        if employee_id:
            query += " AND M.EMPLOYEE_ID = ?"
            params.append(employee_id)

        if job_role_id:
            query += " AND M.JOB_ROLE_ID = ?"
            params.append(job_role_id)

        query += """
            ORDER BY
                M.MATCH_SCORE DESC,
                M.CREATED_AT DESC
        """

        cursor.execute(query, tuple(params))

        rows = rows_to_dict(
            cursor,
            cursor.fetchall()
        )

        for row in rows:

            try:
                row["matched_skills"] = json.loads(
                    row["matched_skills"] or "[]"
                )
            except (TypeError, ValueError):
                row["matched_skills"] = []

            try:
                row["missing_skills"] = json.loads(
                    row["missing_skills"] or "[]"
                )
            except (TypeError, ValueError):
                row["missing_skills"] = []

        return rows

    finally:
        if cursor:
            cursor.close()

        if conn:
            release_connection(conn)


# ==========================================
# FETCH ONE MATCHING RESULT
# ==========================================

def get_matching_result_by_id(match_id: str):
    """
    Retrieve one matching result by MATCH_ID.
    """

    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT
                M.MATCH_ID,
                M.EMPLOYEE_ID,
                E.FULL_NAME,
                E.CURRENT_ROLE,
                E.YEARS_EXPERIENCE,

                M.JOB_ROLE_ID,
                J.TITLE,
                J.DEPARTMENT,

                M.MATCH_SCORE,
                M.MATCH_STATUS,
                M.MATCH_EXPLANATION,
                M.MATCHED_SKILLS,
                M.MISSING_SKILLS,
                M.CREATED_AT,
                M.UPDATED_AT

            FROM MATCHING_RESULTS M

            INNER JOIN EMPLOYEES E
                ON M.EMPLOYEE_ID = E.EMPLOYEE_ID

            INNER JOIN JOB_ROLES J
                ON M.JOB_ROLE_ID = J.JOB_ROLE_ID

            WHERE M.MATCH_ID = ?
            """,
            (match_id,)
        )

        row = cursor.fetchone()

        if not row:
            return None

        result = rows_to_dict(
            cursor,
            [row]
        )[0]

        try:
            result["matched_skills"] = json.loads(
                result["matched_skills"] or "[]"
            )
        except (TypeError, ValueError):
            result["matched_skills"] = []

        try:
            result["missing_skills"] = json.loads(
                result["missing_skills"] or "[]"
            )
        except (TypeError, ValueError):
            result["missing_skills"] = []

        return result

    finally:
        if cursor:
            cursor.close()

        if conn:
            release_connection(conn)
