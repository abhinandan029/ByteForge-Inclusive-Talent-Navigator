
import json
import uuid

from collections import defaultdict

from app.database.connection import get_connection


# ---------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------

def _new_id(prefix):
    return f"{prefix}_{uuid.uuid4().hex[:20].upper()}"


def _rows_as_dicts(cursor):
    """Convert database rows into dictionaries."""
    rows = cursor.fetchall()

    if not rows:
        return []

    if isinstance(rows[0], dict):
        return rows

    columns = [column[0] for column in cursor.description]

    return [
        dict(zip(columns, row))
        for row in rows
    ]


def _decode_json(value, default=None):
    if value is None:
        return default

    if isinstance(value, (dict, list)):
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


def _add_audit_log(
    cursor,
    employee_id,
    actor,
    action,
    tool,
    details,
):
    """Write audit events into the shared AUDIT_LOGS table."""
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
            str(actor or "System"),
            str(action),
            str(tool),
            json.dumps(details, ensure_ascii=False),
        ),
    )


def _get_employee_id_for_match(cursor, match_id):
    """Resolve the employee associated with a matching result."""
    if not match_id:
        return None

    cursor.execute(
        """
        SELECT EMPLOYEE_ID
        FROM MATCHING_RESULTS
        WHERE MATCH_ID = ?
        """,
        (match_id,),
    )

    rows = _rows_as_dicts(cursor)

    return rows[0]["EMPLOYEE_ID"] if rows else None


# ---------------------------------------------------------------------
# Retrieve matching data for the Bias Review Agent
# ---------------------------------------------------------------------

def get_bias_audit_inputs(
    employee_id=None,
    match_ids=None,
    job_role_ids=None,
):
    """
    Fetch matching results and their associated job roles.

    All data retrieval happens here, not inside the agent.
    """
    connection = get_connection()
    cursor = connection.cursor()

    try:
        match_query = """
            SELECT
                mr.MATCH_ID,
                mr.EMPLOYEE_ID,
                mr.JOB_ROLE_ID,
                mr.MATCH_SCORE,
                mr.MATCH_STATUS,
                mr.MATCH_EXPLANATION,
                mr.MATCHED_SKILLS,
                mr.MISSING_SKILLS,
                e.FULL_NAME,
                e.CURRENT_ROLE,
                e.YEARS_EXPERIENCE,
                jr.TITLE,
                jr.DEPARTMENT,
                jr.DESCRIPTION
            FROM MATCHING_RESULTS mr
            INNER JOIN EMPLOYEES e
                ON e.EMPLOYEE_ID = mr.EMPLOYEE_ID
            INNER JOIN JOB_ROLES jr
                ON jr.JOB_ROLE_ID = mr.JOB_ROLE_ID
                AND jr.STATUS = 'active'
        """

        conditions = []
        params = []

        if employee_id:
            conditions.append("mr.EMPLOYEE_ID = ?")
            params.append(employee_id)

        if match_ids is not None:
            if not match_ids:
                return [], []

            placeholders, values = _build_in_clause(match_ids)

            conditions.append(
                f"mr.MATCH_ID IN ({placeholders})"
            )
            params.extend(values)

        if job_role_ids is not None:
            if not job_role_ids:
                return [], []

            placeholders, values = _build_in_clause(job_role_ids)

            conditions.append(
                f"mr.JOB_ROLE_ID IN ({placeholders})"
            )
            params.extend(values)

        if conditions:
            match_query += " WHERE " + " AND ".join(conditions)

        match_query += """
            ORDER BY
                mr.EMPLOYEE_ID,
                mr.JOB_ROLE_ID
        """

        cursor.execute(match_query, params)
        matching_rows = _rows_as_dicts(cursor)

        matching_results = []
        role_ids_from_matches = set()

        for row in matching_rows:
            role_id = str(row["JOB_ROLE_ID"])
            role_ids_from_matches.add(role_id)

            missing_skills = _decode_json(
                row.get("MISSING_SKILLS"),
                [],
            ) or []

            matched_skills = _decode_json(
                row.get("MATCHED_SKILLS"),
                [],
            ) or []

            explanation_payload = _decode_json(
                row.get("MATCH_EXPLANATION"),
                {},
            )

            if isinstance(explanation_payload, dict):
                explanation = explanation_payload.get(
                    "explanation"
                )

                experience_warning = explanation_payload.get(
                    "experience_warning"
                )

                missing_mandatory = explanation_payload.get(
                    "missing_mandatory_skills",
                    [],
                )
            else:
                explanation = explanation_payload
                experience_warning = None
                missing_mandatory = []

            if not missing_mandatory:
                missing_mandatory = [
                    skill.get("skill_name")
                    for skill in missing_skills
                    if isinstance(skill, dict)
                    and skill.get("is_mandatory")
                ]

            matching_results.append({
                "match_id": row["MATCH_ID"],
                "employee_id": row["EMPLOYEE_ID"],
                "employee_name": row["FULL_NAME"],
                "current_role": row["CURRENT_ROLE"],
                "years_experience": row["YEARS_EXPERIENCE"],
                "job_role_id": role_id,
                "job_title": row["TITLE"],
                "department": row["DEPARTMENT"],
                "match_score": float(row["MATCH_SCORE"] or 0),
                "match_status": row["MATCH_STATUS"],
                "matched_skills": matched_skills,
                "missing_skills": missing_skills,
                "missing_mandatory_skills": missing_mandatory,
                "experience_warning": experience_warning,
                "match_explanation": explanation,
            })

        # Fetch job-role criteria from the database.
        role_query = """
            SELECT
                JOB_ROLE_ID,
                TITLE,
                DEPARTMENT,
                DESCRIPTION,
                STATUS
            FROM JOB_ROLES
        """

        role_conditions = ["STATUS = ?"]
        role_params = ["active"]

        if job_role_ids is not None:
            if not job_role_ids:
                return matching_results, []

            placeholders, values = _build_in_clause(job_role_ids)

            role_conditions.append(
                f"JOB_ROLE_ID IN ({placeholders})"
            )
            role_params.extend(values)

        elif employee_id or match_ids is not None:
            if not role_ids_from_matches:
                return matching_results, []

            placeholders, values = _build_in_clause(
                sorted(role_ids_from_matches)
            )

            role_conditions.append(
                f"JOB_ROLE_ID IN ({placeholders})"
            )
            role_params.extend(values)

        if role_conditions:
            role_query += (
                " WHERE " + " AND ".join(role_conditions)
            )

        role_query += " ORDER BY TITLE"

        cursor.execute(role_query, role_params)
        job_roles = _rows_as_dicts(cursor)

        return matching_results, job_roles

    finally:
        _close(cursor, connection)


# ---------------------------------------------------------------------
# Create bias flags and central audit events
# ---------------------------------------------------------------------

def create_bias_audit_flags(
    flags,
    actor="Bias Review Agent",
    summary_text=None,
):
    """
    Insert bias flags without duplicating existing records.

    Each audit summary is associated with the relevant employee,
    including when all flags for that employee already exist.

    Matching flag identity:
        JOB_ROLE_ID + MATCH_ID + FLAG_TYPE

    Role-level flags have MATCH_ID = NULL.
    """

    flags = flags or []

    connection = get_connection()
    cursor = connection.cursor()

    try:
        inserted_count = 0
        skipped_count = 0

        # Maintain independent audit statistics per employee.
        employee_summaries = defaultdict(
            lambda: {
                "detected": 0,
                "inserted": 0,
                "skipped": 0,
                "roles": set(),
            }
        )

        for flag in flags:
            job_role_id = (
                flag.get("job_role_id")
                or flag.get("JOB_ROLE_ID")
                or flag.get("role_id")
            )

            match_id = (
                flag.get("match_id")
                or flag.get("MATCH_ID")
            )

            flag_type = (
                flag.get("flag_type")
                or flag.get("FLAG_TYPE")
            )

            if not job_role_id or not flag_type:
                raise ValueError(
                    "Every bias flag requires job_role_id "
                    "and flag_type."
                )

            # Resolve employee BEFORE checking for duplicates.
            # This ensures repeated audits are associated with
            # the correct employees even when flags are skipped.
            employee_id = _get_employee_id_for_match(
                cursor,
                match_id,
            )

            summary_key = (
                str(employee_id)
                if employee_id is not None
                else None
            )

            employee_summaries[summary_key]["detected"] += 1

            employee_summaries[summary_key]["roles"].add(
                str(job_role_id)
            )

            # Check whether the flag already exists.
            if match_id:
                cursor.execute(
                    """
                    SELECT FLAG_ID
                    FROM BIAS_AUDIT_FLAGS
                    WHERE JOB_ROLE_ID = ?
                      AND MATCH_ID = ?
                      AND FLAG_TYPE = ?
                    """,
                    (
                        job_role_id,
                        match_id,
                        flag_type,
                    ),
                )
            else:
                cursor.execute(
                    """
                    SELECT FLAG_ID
                    FROM BIAS_AUDIT_FLAGS
                    WHERE JOB_ROLE_ID = ?
                      AND MATCH_ID IS NULL
                      AND FLAG_TYPE = ?
                    """,
                    (
                        job_role_id,
                        flag_type,
                    ),
                )

            existing_rows = _rows_as_dicts(cursor)

            if existing_rows:
                skipped_count += 1

                employee_summaries[summary_key]["skipped"] += 1

                continue

            # Insert a new flag.
            flag_id = _new_id("FLAG")

            description = (
                flag.get("description")
                or flag.get("DESCRIPTION")
                or "Potential bias review required."
            )

            recommendation = (
                flag.get("recommendation")
                or flag.get("RECOMMENDATION")
            )

            severity = (
                flag.get("severity")
                or flag.get("SEVERITY")
                or "medium"
            )

            cursor.execute(
                """
                INSERT INTO BIAS_AUDIT_FLAGS (
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
                    flag_id,
                    job_role_id,
                    match_id,
                    flag_type,
                    severity,
                    description,
                    recommendation,
                    "pending",
                ),
            )

            inserted_count += 1

            employee_summaries[summary_key]["inserted"] += 1

            _add_audit_log(
                cursor=cursor,
                employee_id=employee_id,
                actor=actor,
                action="Potential bias flag created",
                tool="Bias Review Agent",
                details={
                    "flag_id": flag_id,
                    "job_role_id": job_role_id,
                    "match_id": match_id,
                    "flag_type": flag_type,
                    "severity": severity,
                },
            )

        # Write one audit summary for each affected employee.
        # Role-level flags without a match retain employee_id=NULL.
        for employee_id, employee_summary in (
            employee_summaries.items()
        ):
            _add_audit_log(
                cursor=cursor,
                employee_id=employee_id,
                actor=actor,
                action="Bias review completed",
                tool="Bias Review Agent",
                details={
                    "flags_detected": employee_summary["detected"],
                    "flags_inserted": employee_summary["inserted"],
                    "existing_flags_skipped": (
                        employee_summary["skipped"]
                    ),
                    "job_role_ids": sorted(
                        employee_summary["roles"]
                    ),
                    "summary": summary_text,
                },
            )

        connection.commit()

        return {
            "total_flags_detected": len(flags),
            "total_flags_inserted": inserted_count,
            "total_existing_flags_skipped": skipped_count,
        }

    except Exception:
        connection.rollback()
        raise

    finally:
        _close(cursor, connection)


# ---------------------------------------------------------------------
# Retrieve bias flags
# ---------------------------------------------------------------------

_FLAG_SELECT = """
    SELECT
        bf.FLAG_ID,
        bf.JOB_ROLE_ID,
        bf.MATCH_ID,
        bf.FLAG_TYPE,
        bf.SEVERITY,
        bf.DESCRIPTION,
        bf.RECOMMENDATION,
        bf.REVIEW_STATUS,
        bf.REVIEWED_BY_HR,
        bf.REVIEWED_AT,
        bf.REVIEW_COMMENTS,
        bf.CREATED_AT,
        jr.TITLE AS JOB_TITLE,
        mr.EMPLOYEE_ID,
        e.FULL_NAME AS EMPLOYEE_NAME,
        mr.MATCH_SCORE
    FROM BIAS_AUDIT_FLAGS bf
    LEFT JOIN JOB_ROLES jr
        ON jr.JOB_ROLE_ID = bf.JOB_ROLE_ID
    LEFT JOIN MATCHING_RESULTS mr
        ON mr.MATCH_ID = bf.MATCH_ID
    LEFT JOIN EMPLOYEES e
        ON e.EMPLOYEE_ID = mr.EMPLOYEE_ID
"""


def get_bias_audit_flags(
    review_status=None,
    employee_id=None,
    job_role_id=None,
    flag_type=None,
):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        query = _FLAG_SELECT

        conditions = []
        params = []

        if review_status:
            conditions.append("bf.REVIEW_STATUS = ?")
            params.append(review_status)

        if employee_id:
            conditions.append("mr.EMPLOYEE_ID = ?")
            params.append(employee_id)

        if job_role_id:
            conditions.append("bf.JOB_ROLE_ID = ?")
            params.append(job_role_id)

        if flag_type:
            conditions.append("bf.FLAG_TYPE = ?")
            params.append(flag_type)

        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        query += " ORDER BY bf.CREATED_AT DESC"

        cursor.execute(query, params)

        return _rows_as_dicts(cursor)

    finally:
        _close(cursor, connection)


def get_bias_audit_flag_by_id(flag_id):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            _FLAG_SELECT + " WHERE bf.FLAG_ID = ?",
            (flag_id,),
        )

        rows = _rows_as_dicts(cursor)

        return rows[0] if rows else None

    finally:
        _close(cursor, connection)


# ---------------------------------------------------------------------
# HR flag review
# ---------------------------------------------------------------------

def review_bias_audit_flag(
    flag_id,
    hr_id,
    review_status,
    review_comments=None,
):
    """
    Update a flag's HR review and write a central audit event
    in the same transaction.
    """

    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT
                FLAG_ID,
                MATCH_ID,
                JOB_ROLE_ID
            FROM BIAS_AUDIT_FLAGS
            WHERE FLAG_ID = ?
            """,
            (flag_id,),
        )

        existing_rows = _rows_as_dicts(cursor)

        if not existing_rows:
            raise ValueError("Bias audit flag not found.")

        existing = existing_rows[0]

        employee_id = _get_employee_id_for_match(
            cursor,
            existing.get("MATCH_ID"),
        )

        cursor.execute(
            """
            UPDATE BIAS_AUDIT_FLAGS
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
                flag_id,
            ),
        )

        _add_audit_log(
            cursor=cursor,
            employee_id=employee_id,
            actor=hr_id,
            action="Bias audit flag reviewed",
            tool="Bias Review",
            details={
                "flag_id": flag_id,
                "job_role_id": existing["JOB_ROLE_ID"],
                "match_id": existing.get("MATCH_ID"),
                "review_status": review_status,
                "review_comments": review_comments,
            },
        )

        connection.commit()

        cursor.execute(
            _FLAG_SELECT + " WHERE bf.FLAG_ID = ?",
            (flag_id,),
        )

        rows = _rows_as_dicts(cursor)

        return rows[0] if rows else None

    except Exception:
        connection.rollback()
        raise

    finally:
        _close(cursor, connection)


# ---------------------------------------------------------------------
# HR match decisions
# ---------------------------------------------------------------------


def create_hr_match_decision(
    match_id,
    hr_id,
    decision,
    comments=None,
    override_reason=None,
):
    """
    Store HR decisions separately from matching results.
    Preserve previous decisions as history.
    """

    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT MATCH_ID, EMPLOYEE_ID
            FROM MATCHING_RESULTS
            WHERE MATCH_ID = ?
            """,
            (match_id,),
        )

        match_rows = _rows_as_dicts(cursor)

        if not match_rows:
            raise ValueError("Matching result not found.")

        employee_id = match_rows[0]["EMPLOYEE_ID"]

        decision_id = _new_id("DECISION")

        cursor.execute(
            """
            INSERT INTO HR_REVIEW_DECISIONS (
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
                override_reason,
            ),
        )

        # Retrieve the database-generated timestamp.
        cursor.execute(
            """
            SELECT CREATED_AT
            FROM HR_REVIEW_DECISIONS
            WHERE DECISION_ID = ?
            """,
            (decision_id,),
        )

        timestamp_rows = _rows_as_dicts(cursor)

        created_at = (
            timestamp_rows[0].get("CREATED_AT")
            if timestamp_rows
            else None
        )

        _add_audit_log(
            cursor=cursor,
            employee_id=employee_id,
            actor=hr_id,
            action="HR match decision recorded",
            tool="Bias Review",
            details={
                "decision_id": decision_id,
                "match_id": match_id,
                "decision": decision,
                "comments": comments,
                "override_reason": override_reason,
            },
        )

        connection.commit()

        return {
            "decision_id": decision_id,
            "match_id": match_id,
            "hr_id": hr_id,
            "decision": decision,
            "comments": comments,
            "override_reason": override_reason,
            "created_at": created_at,
        }

    except Exception:
        connection.rollback()
        raise

    finally:
        _close(cursor, connection)


def get_hr_match_decisions(match_id=None):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        query = """
            SELECT
                DECISION_ID,
                MATCH_ID,
                HR_ID,
                DECISION,
                COMMENTS,
                OVERRIDE_REASON,
                CREATED_AT
            FROM HR_REVIEW_DECISIONS
        """

        params = []

        if match_id:
            query += " WHERE MATCH_ID = ?"
            params.append(match_id)

        query += " ORDER BY CREATED_AT DESC"

        cursor.execute(query, params)

        return _rows_as_dicts(cursor)

    finally:
        _close(cursor, connection)
