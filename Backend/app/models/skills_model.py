
import json

from app.database.connection import (
    get_connection,
    release_connection,
    get_database_type
)


# ==================================================
# DATABASE HELPERS
# ==================================================

def _fetch_all(cursor):
    columns = [
        column[0].lower()
        for column in cursor.description
    ]

    rows = cursor.fetchall()

    return [
        dict(zip(columns, row))
        for row in rows
    ]


def _fetch_one(cursor):
    row = cursor.fetchone()

    if row is None:
        return None

    columns = [
        column[0].lower()
        for column in cursor.description
    ]

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
    if isinstance(value, str):
        return value.strip().lower() in (
            "1", "true", "yes"
        )

    return bool(value)


def _normalize_skill_name(name):
    return (name or "").strip().casefold()


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


def _get_employee(cursor, employee_id):
    cursor.execute(
        """
        SELECT EMPLOYEE_ID
        FROM EMPLOYEES
        WHERE EMPLOYEE_ID = ?
        """,
        (employee_id,)
    )

    return cursor.fetchone() is not None


def _get_confirmed_skill_names(cursor, employee_id):
    cursor.execute(
        """
        SELECT NAME
        FROM CONFIRMED_SKILLS_FINAL
        WHERE EMPLOYEE_ID = ?
        """,
        (employee_id,)
    )

    return {
        _normalize_skill_name(row[0])
        for row in cursor.fetchall()
        if row[0]
    }


# ==================================================
# GET EMPLOYEE PROFILE TEXT
# ==================================================

def get_employee_profile_text(employee_id):
    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT PROFILE_TEXT
            FROM EMPLOYEES
            WHERE EMPLOYEE_ID = ?
            """,
            (employee_id,)
        )

        row = cursor.fetchone()

        if row is None:
            raise ValueError("Employee not found.")

        profile_text = row[0]

        if not profile_text or not profile_text.strip():
            raise ValueError(
                "No profile text found. Please upload your documents first."
            )

        return profile_text.strip()

    finally:
        _close_resources(cursor, conn)


# ==================================================
# SAVE EXTRACTED SKILLS
# ==================================================

def save_extracted_skills(employee_id, extracted_skills):
    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        if not _get_employee(cursor, employee_id):
            raise ValueError("Employee not found.")

        confirmed_names = _get_confirmed_skill_names(
            cursor,
            employee_id
        )

        cursor.execute(
            """
            SELECT
                SKILL_ID,
                NAME,
                TAXONOMY_CATEGORY,
                EVIDENCE_SNIPPET
            FROM EXTRACTED_SKILLS_DRAFT
            WHERE EMPLOYEE_ID = ?
            """,
            (employee_id,)
        )

        pending_skills = []
        seen_names = set(confirmed_names)

        for skill in _fetch_all(cursor):
            name = (skill.get("name") or "").strip()
            normalized_name = _normalize_skill_name(name)

            if not name or normalized_name in seen_names:
                continue

            seen_names.add(normalized_name)
            pending_skills.append({
                "skill_id": skill["skill_id"],
                "name": name,
                "taxonomy_category": (
                    skill.get("taxonomy_category") or "General"
                ),
                "evidence_snippet": (
                    skill.get("evidence_snippet") or ""
                )
            })

        new_pending_skills = []

        for skill in extracted_skills:
            name = (skill.get("name") or "").strip()
            normalized_name = _normalize_skill_name(name)

            if not name or normalized_name in seen_names:
                continue

            seen_names.add(normalized_name)

            new_skill = {
                "skill_id": skill["skill_id"],
                "name": name,
                "taxonomy_category": (
                    skill.get("taxonomy_category") or "General"
                ),
                "evidence_snippet": (
                    skill.get("evidence_snippet") or ""
                )
            }
            pending_skills.append(new_skill)
            new_pending_skills.append(new_skill)

        print("\n========== SKILLS SAVE DEBUG ==========")
        print("Employee ID:", employee_id)
        print("Extracted skills count:", len(extracted_skills))
        print("Confirmed names:", confirmed_names)
        print("Pending skills count:", len(pending_skills))

        for skill in pending_skills:
            print("Pending:", skill["skill_id"], skill["name"])

        print("=======================================\n")

        # Append newly discovered proposals without replacing drafts awaiting review.
        for skill in new_pending_skills:
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
                    skill["taxonomy_category"],
                    skill["evidence_snippet"]
                )
            )

            print(
                "Inserted:",
                skill["skill_id"],
                skill["name"]
            )

        _add_audit_log(
            cursor,
            employee_id,
            "AI_AGENT",
            "SKILLS_EXTRACTED",
            "SKILLS_DISCOVERY",
            (
                f"{len(extracted_skills)} skills discovered; "
                f"{len(new_pending_skills)} new pending skills"
            )
        )

        conn.commit()

        return {
            "success": True,
            "discovered_count": len(extracted_skills),
            "pending_count": len(pending_skills),
            "pending_skills": pending_skills
        }

    except Exception:
        if conn:
            conn.rollback()
        raise

    finally:
        _close_resources(cursor, conn)


# ==================================================
# SAVE FINAL CONFIRMED SKILLS
# ==================================================

def save_confirmed_skills(employee_id, confirmed_skills):
    """
    Save the employee's final skill selection.

    - Preserve previously confirmed skills.
    - Save accepted extracted skills.
    - Save manually added skills.
    - Delete all reviewed pending drafts, including rejected skills.
    - Mark the review as completed.
    - Enable matching only when at least one skill is confirmed.
    """

    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        if not _get_employee(cursor, employee_id):
            raise ValueError("Employee not found.")

        # Get all pending skills before modifying them.
        cursor.execute(
            """
            SELECT
                SKILL_ID,
                NAME,
                TAXONOMY_CATEGORY,
                EVIDENCE_SNIPPET
            FROM EXTRACTED_SKILLS_DRAFT
            WHERE EMPLOYEE_ID = ?
            """,
            (employee_id,)
        )

        draft_rows = _fetch_all(cursor)

        draft_by_name = {
            _normalize_skill_name(skill["name"]): skill
            for skill in draft_rows
            if skill.get("name")
        }

        submitted_names = {
            _normalize_skill_name(skill.get("name"))
            for skill in confirmed_skills
            if skill.get("name")
        }

        # Track suggestions rejected by the employee.
        removed_names = [
            skill["name"]
            for skill in draft_rows
            if _normalize_skill_name(skill["name"])
            not in submitted_names
        ]

        existing_confirmed_names = _get_confirmed_skill_names(
            cursor,
            employee_id
        )

        newly_confirmed = []
        manually_added = []
        seen_names = set()

        for submitted_skill in confirmed_skills:
            name = (submitted_skill.get("name") or "").strip()

            if not name:
                continue

            normalized_name = _normalize_skill_name(name)

            if normalized_name in seen_names:
                continue

            seen_names.add(normalized_name)

            # Use database evidence for an extracted skill.
            draft_skill = draft_by_name.get(normalized_name)

            if draft_skill:
                skill_to_save = {
                    "name": draft_skill["name"],
                    "taxonomy_category": (
                        draft_skill.get("taxonomy_category") or "General"
                    ),
                    "evidence_snippet": (
                        draft_skill.get("evidence_snippet") or ""
                    )
                }

            else:
                # This skill was added by the employee.
                skill_to_save = {
                    "name": name,
                    "taxonomy_category": (
                        submitted_skill.get("taxonomy_category") or "General"
                    ),
                    "evidence_snippet": (
                        submitted_skill.get("evidence_snippet")
                        or "Self-reported and confirmed by employee"
                    )
                }

                manually_added.append(name)

            # Prevent duplicate confirmed skills.
            if normalized_name in existing_confirmed_names:
                continue

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
                    skill_to_save["name"],
                    skill_to_save["taxonomy_category"],
                    skill_to_save["evidence_snippet"]
                )
            )

            existing_confirmed_names.add(normalized_name)
            newly_confirmed.append(skill_to_save)

        # The employee has reviewed the entire pending list.
        # Delete accepted AND rejected pending suggestions.
        cursor.execute(
            """
            DELETE FROM EXTRACTED_SKILLS_DRAFT
            WHERE EMPLOYEE_ID = ?
            """,
            (employee_id,)
        )

        # Count every confirmed skill, including earlier confirmations.
        cursor.execute(
            """
            SELECT COUNT(*)
            FROM CONFIRMED_SKILLS_FINAL
            WHERE EMPLOYEE_ID = ?
            """,
            (employee_id,)
        )

        total_confirmed = cursor.fetchone()[0]

        ready_for_matching = total_confirmed > 0

        # A completed review and matching readiness are separate states.
        cursor.execute(
            """
            UPDATE EMPLOYEES
            SET
                IS_CONFIRMED = ?,
                READY_FOR_MATCHING = ?,
                UPDATED_AT = CURRENT_TIMESTAMP
            WHERE EMPLOYEE_ID = ?
            """,
            (
                1,
                1 if ready_for_matching else 0,
                employee_id
            )
        )

        # Retrieve the complete final confirmed list.
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

        final_confirmed_skills = _fetch_all(cursor)

        # Record additions and removals in the database audit log.
        audit_details = json.dumps({
            "newly_confirmed_count": len(newly_confirmed),
            "total_confirmed_count": total_confirmed,
            "manually_added": manually_added,
            "removed_skills": removed_names,
            "ready_for_matching": ready_for_matching
        })

        _add_audit_log(
            cursor,
            employee_id,
            "EMPLOYEE",
            "SKILLS_CONFIRMED",
            "SKILLS_DISCOVERY",
            audit_details
        )

        conn.commit()

        return {
            "success": True,
            "confirmed_count": total_confirmed,
            "newly_confirmed_count": len(newly_confirmed),
            "confirmed_skills": final_confirmed_skills,
            "is_confirmed": True,
            "ready_for_matching": ready_for_matching
        }

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
        conn = get_connection()
        cursor = conn.cursor()

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
            raise ValueError("Employee not found.")

        employee["has_career_break"] = _to_bool(
            employee["has_career_break"]
        )

        employee["is_confirmed"] = _to_bool(
            employee["is_confirmed"]
        )

        employee["ready_for_matching"] = _to_bool(
            employee["ready_for_matching"]
        )

        # Fetch confirmed skills.
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

        confirmed_names = {
            _normalize_skill_name(skill["name"])
            for skill in confirmed_skills
        }

        # Fetch pending skills.
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

        all_drafts = _fetch_all(cursor)

        # Do not show confirmed skills as pending.
        draft_skills = [
            skill
            for skill in all_drafts
            if _normalize_skill_name(skill.get("name"))
            not in confirmed_names
        ]

        # Keep the employee review flag from EMPLOYEES.
        # Do not infer it from whether the confirmed table is empty.
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
                    LOG_TIMESTAMP,
                    EMPLOYEE_ID,
                    ACTOR,
                    ACTION,
                    TOOL,
                    DETAILS
                FROM AUDIT_LOGS
                WHERE EMPLOYEE_ID = ?
                ORDER BY LOG_TIMESTAMP DESC
                """,
                (employee_id,)
            )

        else:
            cursor.execute(
                """
                SELECT
                    LOG_ID,
                    LOG_TIMESTAMP,
                    EMPLOYEE_ID,
                    ACTOR,
                    ACTION,
                    TOOL,
                    DETAILS
                FROM AUDIT_LOGS
                ORDER BY LOG_TIMESTAMP DESC
                """
            )

        return _fetch_all(cursor)

    finally:
        _close_resources(cursor, conn)
