
import json
import uuid

from collections import defaultdict

from app.database.connection import get_connection


# ---------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------

def _new_match_id():
    return f"MATCH_{uuid.uuid4().hex[:20].upper()}"


def _rows_as_dicts(cursor):
    """Convert database rows into dictionaries."""
    rows = cursor.fetchall()

    if not rows:
        return []

    if isinstance(rows[0], dict):
        return rows

    columns = [
        column[0]
        for column in cursor.description
    ]

    return [
        dict(zip(columns, row))
        for row in rows
    ]


def _decode_json(value, default):
    if value is None:
        return default

    if isinstance(value, (list, dict)):
        return value

    try:
        return json.loads(value)

    except (TypeError, ValueError):
        return default


def _close(cursor, connection):
    try:
        if cursor:
            cursor.close()

    finally:
        if connection:
            connection.close()


def _build_in_clause(values):
    values = list(values)

    if not values:
        return None, []

    return ", ".join(["?"] * len(values)), values


# ---------------------------------------------------------------------
# Fetch eligible employees
# ---------------------------------------------------------------------

def get_matching_employees(employee_ids=None):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        query = """
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
            WHERE READY_FOR_MATCHING = 1
              AND IS_CONFIRMED = 1
        """

        params = []

        if employee_ids is not None:
            if not employee_ids:
                return []

            placeholders, params = _build_in_clause(
                employee_ids
            )

            query += (
                f" AND EMPLOYEE_ID IN ({placeholders})"
            )

        cursor.execute(query, params)

        return _rows_as_dicts(cursor)

    finally:
        _close(cursor, connection)


# ---------------------------------------------------------------------
# Fetch active job roles
# ---------------------------------------------------------------------

def get_matching_job_roles(job_role_ids=None):
    connection = get_connection()
    cursor = connection.cursor()

    try:
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

            placeholders, params = _build_in_clause(
                job_role_ids
            )

            query += (
                f" AND JOB_ROLE_ID IN ({placeholders})"
            )

        query += " ORDER BY TITLE"

        cursor.execute(query, params)

        return _rows_as_dicts(cursor)

    finally:
        _close(cursor, connection)


# ---------------------------------------------------------------------
# Fetch job requirements
# ---------------------------------------------------------------------

def get_job_required_skills(job_role_ids):
    if not job_role_ids:
        return {}

    connection = get_connection()
    cursor = connection.cursor()

    try:
        placeholders, params = _build_in_clause(
            job_role_ids
        )

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
            WHERE JOB_ROLE_ID IN ({placeholders})
            ORDER BY JOB_ROLE_ID, SKILL_NAME
        """

        cursor.execute(query, params)

        rows = _rows_as_dicts(cursor)

        grouped = defaultdict(list)

        for row in rows:
            grouped[str(row["JOB_ROLE_ID"])].append(row)

        return dict(grouped)

    finally:
        _close(cursor, connection)


# ---------------------------------------------------------------------
# Fetch confirmed employee skills
# ---------------------------------------------------------------------

def get_confirmed_employee_skills(employee_ids):
    if not employee_ids:
        return {}

    connection = get_connection()
    cursor = connection.cursor()

    try:
        placeholders, params = _build_in_clause(
            employee_ids
        )

        query = f"""
            SELECT
                EMPLOYEE_ID,
                NAME,
                TAXONOMY_CATEGORY,
                EVIDENCE_SNIPPET,
                CONFIRMED_AT
            FROM CONFIRMED_SKILLS_FINAL
            WHERE EMPLOYEE_ID IN ({placeholders})
            ORDER BY EMPLOYEE_ID, NAME
        """

        cursor.execute(query, params)

        rows = _rows_as_dicts(cursor)

        grouped = defaultdict(list)

        for row in rows:
            grouped[str(row["EMPLOYEE_ID"])].append(row)

        return dict(grouped)

    finally:
        _close(cursor, connection)


# ---------------------------------------------------------------------
# Serialization
# ---------------------------------------------------------------------

def _serialize_result(result):
    matched = result.get("matched_skills") or []
    missing = result.get("missing_skills") or []

    explanation_payload = {
        "explanation": result.get("match_explanation"),
        "experience_warning": result.get(
            "experience_warning"
        ),
        "missing_mandatory_skills": result.get(
            "missing_mandatory_skills"
        ) or [],
    }

    return (
        json.dumps(matched, ensure_ascii=False),
        json.dumps(missing, ensure_ascii=False),
        json.dumps(
            explanation_payload,
            ensure_ascii=False,
        ),
    )


def _restore_result(row):
    row["matched_skills"] = _decode_json(
        row.get("MATCHED_SKILLS"),
        [],
    )

    row["missing_skills"] = _decode_json(
        row.get("MISSING_SKILLS"),
        [],
    )

    explanation = _decode_json(
        row.get("MATCH_EXPLANATION"),
        None,
    )

    if isinstance(explanation, dict):
        row["match_explanation"] = explanation.get(
            "explanation"
        )

        row["experience_warning"] = explanation.get(
            "experience_warning"
        )

        row["missing_mandatory_skills"] = (
            explanation.get(
                "missing_mandatory_skills",
                [],
            )
        )

    else:
        # Backward compatibility with older plain-text rows.
        row["match_explanation"] = (
            explanation
            if isinstance(explanation, str)
            else row.get("MATCH_EXPLANATION")
        )

        row["experience_warning"] = None

        row["missing_mandatory_skills"] = [
            skill.get("skill_name")
            for skill in row["missing_skills"]
            if skill.get("is_mandatory")
        ]

    row["match_id"] = row.get("MATCH_ID")
    row["employee_id"] = row.get("EMPLOYEE_ID")
    row["employee_name"] = row.get("FULL_NAME")
    row["current_role"] = row.get("CURRENT_ROLE")
    row["years_experience"] = row.get("YEARS_EXPERIENCE")
    row["job_role_id"] = row.get("JOB_ROLE_ID")
    row["job_title"] = row.get("TITLE")
    row["department"] = row.get("DEPARTMENT")

    row["match_score"] = float(
        row.get("MATCH_SCORE") or 0
    )

    row["match_status"] = row.get("MATCH_STATUS")

    return row


# ---------------------------------------------------------------------
# Save matching results and audit events
# ---------------------------------------------------------------------

def save_matching_results(results, actor="HR"):
    """
    Save or update matching results.

    Uses standard SELECT, INSERT and UPDATE statements rather
    than database-specific upsert syntax.

    Matching result writes and audit writes share one transaction.
    """

    if not results:
        return 0

    connection = get_connection()
    cursor = connection.cursor()

    try:
        employee_summaries = defaultdict(
            lambda: {
                "matches": 0,
                "roles": [],
            }
        )

        for result in results:
            employee_id = str(result["employee_id"])
            job_role_id = str(result["job_role_id"])

            matched_json, missing_json, explanation_json = (
                _serialize_result(result)
            )

            # Check for an existing employee-role result.
            cursor.execute(
                """
                SELECT MATCH_ID
                FROM MATCHING_RESULTS
                WHERE EMPLOYEE_ID = ?
                  AND JOB_ROLE_ID = ?
                """,
                (
                    employee_id,
                    job_role_id,
                ),
            )

            existing_rows = cursor.fetchall()

            if len(existing_rows) > 1:
                raise RuntimeError(
                    "Duplicate matching results found for "
                    f"employee {employee_id} and role {job_role_id}."
                )

            if existing_rows:
                existing = existing_rows[0]

                if isinstance(existing, dict):
                    match_id = existing["MATCH_ID"]
                else:
                    match_id = existing[0]

                cursor.execute(
                    """
                    UPDATE MATCHING_RESULTS
                    SET
                        MATCH_SCORE = ?,
                        MATCH_STATUS = ?,
                        MATCH_EXPLANATION = ?,
                        MATCHED_SKILLS = ?,
                        MISSING_SKILLS = ?,
                        UPDATED_AT = CURRENT_TIMESTAMP
                    WHERE MATCH_ID = ?
                    """,
                    (
                        result["match_score"],
                        result.get(
                            "match_status",
                            "completed",
                        ),
                        explanation_json,
                        matched_json,
                        missing_json,
                        match_id,
                    ),
                )

            else:
                match_id = _new_match_id()

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
                        result.get(
                            "match_status",
                            "completed",
                        ),
                        explanation_json,
                        matched_json,
                        missing_json,
                    ),
                )

            employee_summaries[employee_id]["matches"] += 1

            employee_summaries[employee_id]["roles"].append(
                job_role_id
            )

        # Write central audit records.
        for employee_id, summary in employee_summaries.items():
            details = {
                "matches_generated": summary["matches"],
                "job_role_ids": sorted(
                    set(summary["roles"])
                ),
            }

            cursor.execute(
                """
                INSERT INTO AUDIT_LOGS (
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
                    str(actor or "HR"),
                    "Opportunity matching completed",
                    "Opportunity Matching Agent",
                    json.dumps(
                        details,
                        ensure_ascii=False,
                    ),
                ),
            )

        connection.commit()

        return len(results)

    except Exception:
        connection.rollback()
        raise

    finally:
        _close(cursor, connection)


# ---------------------------------------------------------------------
# Fetch matching results
# ---------------------------------------------------------------------

_MATCH_SELECT = """
    SELECT
        mr.MATCH_ID,
        mr.EMPLOYEE_ID,
        e.FULL_NAME,
        e.CURRENT_ROLE,
        e.YEARS_EXPERIENCE,
        mr.JOB_ROLE_ID,
        jr.TITLE,
        jr.DEPARTMENT,
        mr.MATCH_SCORE,
        mr.MATCH_STATUS,
        mr.MATCH_EXPLANATION,
        mr.MATCHED_SKILLS,
        mr.MISSING_SKILLS,
        mr.CREATED_AT,
        mr.UPDATED_AT
    FROM MATCHING_RESULTS mr
    INNER JOIN EMPLOYEES e
        ON e.EMPLOYEE_ID = mr.EMPLOYEE_ID
    INNER JOIN JOB_ROLES jr
        ON jr.JOB_ROLE_ID = mr.JOB_ROLE_ID
        AND jr.STATUS = 'active'
"""



def get_all_matching_results(
    employee_id=None,
    job_role_id=None,
    employee_ids=None,
    job_role_ids=None,
):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        query = _MATCH_SELECT
        conditions = []
        params = []

        if employee_id:
            conditions.append("mr.EMPLOYEE_ID = ?")
            params.append(employee_id)

        if job_role_id:
            conditions.append("mr.JOB_ROLE_ID = ?")
            params.append(job_role_id)

        if employee_ids is not None:
            if not employee_ids:
                return []

            placeholders, values = _build_in_clause(employee_ids)
            conditions.append(
                f"mr.EMPLOYEE_ID IN ({placeholders})"
            )
            params.extend(values)

        if job_role_ids is not None:
            if not job_role_ids:
                return []

            placeholders, values = _build_in_clause(job_role_ids)
            conditions.append(
                f"mr.JOB_ROLE_ID IN ({placeholders})"
            )
            params.extend(values)

        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        query += """
            ORDER BY
                mr.MATCH_SCORE DESC,
                mr.UPDATED_AT DESC
        """

        cursor.execute(query, params)

        rows = _rows_as_dicts(cursor)

        return [
            _restore_result(row)
            for row in rows
        ]

    finally:
        _close(cursor, connection)


def get_matching_result_by_id(match_id):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        query = _MATCH_SELECT + """
            WHERE mr.MATCH_ID = ?
        """

        cursor.execute(
            query,
            (match_id,),
        )

        rows = _rows_as_dicts(cursor)

        if not rows:
            return None

        return _restore_result(rows[0])

    finally:
        _close(cursor, connection)