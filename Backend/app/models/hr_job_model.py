import uuid

from app.database.connection import (
    get_connection,
    release_connection
)


def generate_id(prefix: str):
    return f"{prefix}-{uuid.uuid4().hex}"


def insert_hr_audit_log(
    cursor,
    hr_id: str,
    action: str,
    entity_type: str,
    entity_id: str,
    details: str | None = None
):
    cursor.execute(
        """
        INSERT INTO HR_AUDIT_LOGS (
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


def get_all_job_roles():
    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT
                JOB_ROLE_ID,
                TITLE,
                DEPARTMENT,
                DESCRIPTION,
                EXPERIENCE_MIN,
                EXPERIENCE_MAX,
                ROLE_SOURCE,
                CREATED_BY_HR,
                STATUS,
                CREATED_AT
            FROM JOB_ROLES
            ORDER BY CREATED_AT DESC
            """
        )

        columns = [
            column[0].lower()
            for column in cursor.description
        ]

        roles = [
            dict(zip(columns, row))
            for row in cursor.fetchall()
        ]

        if not roles:
            return roles

        placeholders = ", ".join("?" for _ in roles)
        role_ids = [role["job_role_id"] for role in roles]

        cursor.execute(
            f"""
            SELECT
                JOB_ROLE_ID,
                REQUIREMENT_ID,
                SKILL_NAME,
                TAXONOMY_CATEGORY,
                REQUIRED_PROFICIENCY,
                IS_MANDATORY,
                WEIGHT
            FROM JOB_REQUIRED_SKILLS
            WHERE JOB_ROLE_ID IN ({placeholders})
            ORDER BY JOB_ROLE_ID, SKILL_NAME
            """,
            role_ids
        )

        skill_columns = [
            column[0].lower()
            for column in cursor.description
        ]
        skills_by_role = {}

        for row in cursor.fetchall():
            skill = dict(zip(skill_columns, row))
            skills_by_role.setdefault(
                skill["job_role_id"],
                []
            ).append({
                key: value
                for key, value in skill.items()
                if key != "job_role_id"
            })

        for role in roles:
            role["required_skills"] = skills_by_role.get(
                role["job_role_id"],
                []
            )

        return roles

    finally:
        if cursor:
            cursor.close()

        if conn:
            release_connection(conn)


def get_job_role_by_id(job_role_id: str):
    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT
                JOB_ROLE_ID,
                TITLE,
                DEPARTMENT,
                DESCRIPTION,
                EXPERIENCE_MIN,
                EXPERIENCE_MAX,
                ROLE_SOURCE,
                CREATED_BY_HR,
                STATUS,
                CREATED_AT
            FROM JOB_ROLES
            WHERE JOB_ROLE_ID = ?
            """,
            (job_role_id,)
        )

        row = cursor.fetchone()

        if not row:
            return None

        columns = [
            column[0].lower()
            for column in cursor.description
        ]

        role = dict(zip(columns, row))

        cursor.execute(
            """
            SELECT
                REQUIREMENT_ID,
                SKILL_NAME,
                TAXONOMY_CATEGORY,
                REQUIRED_PROFICIENCY,
                IS_MANDATORY,
                WEIGHT
            FROM JOB_REQUIRED_SKILLS
            WHERE JOB_ROLE_ID = ?
            ORDER BY SKILL_NAME
            """,
            (job_role_id,)
        )

        skill_columns = [
            column[0].lower()
            for column in cursor.description
        ]

        role["required_skills"] = [
            dict(zip(skill_columns, skill_row))
            for skill_row in cursor.fetchall()
        ]

        return role

    finally:
        if cursor:
            cursor.close()

        if conn:
            release_connection(conn)


def create_job_role(
    hr_id: str,
    role_data: dict,
    skills: list[dict]
):
    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        job_role_id = generate_id("ROLE")

        cursor.execute(
            """
            INSERT INTO JOB_ROLES (
                JOB_ROLE_ID,
                TITLE,
                DEPARTMENT,
                DESCRIPTION,
                EXPERIENCE_MIN,
                EXPERIENCE_MAX,
                ROLE_SOURCE,
                CREATED_BY_HR,
                STATUS
            )
            VALUES (?, ?, ?, ?, ?, ?, 'hr_created', ?, 'active')
            """,
            (
                job_role_id,
                role_data["title"],
                role_data.get("department"),
                role_data.get("description"),
                role_data.get("experience_min"),
                role_data.get("experience_max"),
                hr_id
            )
        )

        insert_job_skills(cursor, job_role_id, skills)

        insert_hr_audit_log(
            cursor=cursor,
            hr_id=hr_id,
            action="JOB_ROLE_CREATED",
            entity_type="JOB_ROLE",
            entity_id=job_role_id,
            details=f"Created job role: {role_data['title']}"
        )

        conn.commit()

        return job_role_id

    except Exception:
        if conn:
            conn.rollback()
        raise

    finally:
        if cursor:
            cursor.close()

        if conn:
            release_connection(conn)


def insert_job_skills(cursor, job_role_id: str, skills: list[dict]):
    for skill in skills:
        cursor.execute(
            """
            INSERT INTO JOB_REQUIRED_SKILLS (
                REQUIREMENT_ID,
                JOB_ROLE_ID,
                SKILL_NAME,
                TAXONOMY_CATEGORY,
                REQUIRED_PROFICIENCY,
                IS_MANDATORY,
                WEIGHT
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                generate_id("REQ"),
                job_role_id,
                skill["skill_name"].strip(),
                skill.get("taxonomy_category") or "General",
                skill.get("required_proficiency"),
                1 if skill.get("is_mandatory", True) else 0,
                skill.get("weight", 1.0)
            )
        )


def update_job_role(job_role_id: str, role_data: dict,  hr_id: str):
    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            UPDATE JOB_ROLES
            SET
                TITLE = ?,
                DEPARTMENT = ?,
                DESCRIPTION = ?,
                EXPERIENCE_MIN = ?,
                EXPERIENCE_MAX = ?
            WHERE JOB_ROLE_ID = ?
              AND ROLE_SOURCE = 'hr_created'
            """,
            (
                role_data["title"],
                role_data.get("department"),
                role_data.get("description"),
                role_data.get("experience_min"),
                role_data.get("experience_max"),
                job_role_id
            )
        )

        cursor.execute(
            """
            SELECT JOB_ROLE_ID
            FROM JOB_ROLES
            WHERE JOB_ROLE_ID = ?
            """,
            (job_role_id,)
        )

        exists = cursor.fetchone() is not None

        if not exists:
            conn.rollback()
            return "not_found"

        cursor.execute(
            """
            SELECT ROLE_SOURCE
            FROM JOB_ROLES
            WHERE JOB_ROLE_ID = ?
            """,
            (job_role_id,)
        )

        role_source = cursor.fetchone()[0]

        if role_source != "hr_created":
            conn.rollback()
            return "predefined"

        insert_hr_audit_log(
            cursor=cursor,
            hr_id=hr_id,
            action="JOB_ROLE_UPDATED",
            entity_type="JOB_ROLE",
            entity_id=job_role_id,
            details=f"Updated job role: {role_data['title']}"
        )

        conn.commit()
        return "updated"

    except Exception:
        if conn:
            conn.rollback()
        raise

    finally:
        if cursor:
            cursor.close()

        if conn:
            release_connection(conn)


def update_job_role_status(job_role_id: str, new_status: str, hr_id: str):
    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            UPDATE JOB_ROLES
            SET STATUS = ?
            WHERE JOB_ROLE_ID = ?
              AND ROLE_SOURCE = 'hr_created'
            """,
            (new_status, job_role_id)
        )

        cursor.execute(
            """
            SELECT ROLE_SOURCE
            FROM JOB_ROLES
            WHERE JOB_ROLE_ID = ?
            """,
            (job_role_id,)
        )

        row = cursor.fetchone()

        if not row:
            conn.rollback()
            return "not_found"

        if row[0] != "hr_created":
            conn.rollback()
            return "predefined"

        if new_status == "inactive":
            cursor.execute(
                """
                SELECT MATCH_ID
                FROM MATCHING_RESULTS
                WHERE JOB_ROLE_ID = ?
                """,
                (job_role_id,)
            )
            match_ids = [row[0] for row in cursor.fetchall()]

            cursor.execute(
                """
                DELETE FROM BIAS_AUDIT_FLAGS
                WHERE JOB_ROLE_ID = ?
                """,
                (job_role_id,)
            )

            if match_ids:
                placeholders = ", ".join("?" for _ in match_ids)
                cursor.execute(
                    f"""
                    DELETE FROM HR_REVIEW_DECISIONS
                    WHERE MATCH_ID IN ({placeholders})
                    """,
                    match_ids
                )
                cursor.execute(
                    f"""
                    DELETE FROM MATCHING_RESULTS
                    WHERE MATCH_ID IN ({placeholders})
                    """,
                    match_ids
                )

        insert_hr_audit_log(
            cursor=cursor,
            hr_id=hr_id,
            action=(
                "JOB_ROLE_ACTIVATED"
                if new_status == "active"
                else "JOB_ROLE_DEACTIVATED"
            ),
            entity_type="JOB_ROLE",
            entity_id=job_role_id,
            details=f"Changed job role status to {new_status}"
        )

        conn.commit()
        return "updated"

    except Exception:
        if conn:
            conn.rollback()
        raise

    finally:
        if cursor:
            cursor.close()

        if conn:
            release_connection(conn)


def add_required_skills(job_role_id: str, skills: list[dict], hr_id: str):
    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT JOB_ROLE_ID
            FROM JOB_ROLES
            WHERE JOB_ROLE_ID = ?
            """,
            (job_role_id,)
        )

        if not cursor.fetchone():
            conn.rollback()
            return False

        insert_job_skills(cursor, job_role_id, skills)

        insert_hr_audit_log(
            cursor=cursor,
            hr_id=hr_id,
            action="JOB_SKILLS_ADDED",
            entity_type="JOB_ROLE",
            entity_id=job_role_id,
            details=f"Added {len(skills)} required skill(s)"
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


def delete_required_skill(
    job_role_id: str,
    requirement_id: str,
    hr_id: str,
):
    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT SKILL_NAME
            FROM JOB_REQUIRED_SKILLS
            WHERE JOB_ROLE_ID = ?
              AND REQUIREMENT_ID = ?
            """,
            (job_role_id, requirement_id)
        )
        row = cursor.fetchone()

        if not row:
            conn.rollback()
            return False

        skill_name = (
            row.get("SKILL_NAME") or row.get("skill_name")
            if isinstance(row, dict)
            else row[0]
        )

        cursor.execute(
            """
            DELETE FROM JOB_REQUIRED_SKILLS
            WHERE JOB_ROLE_ID = ?
              AND REQUIREMENT_ID = ?
            """,
            (job_role_id, requirement_id)
        )

        insert_hr_audit_log(
            cursor=cursor,
            hr_id=hr_id,
            action="JOB_SKILL_REMOVED",
            entity_type="JOB_ROLE",
            entity_id=job_role_id,
            details=f"Removed required skill: {skill_name}"
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


def get_existing_skill_names(job_role_id: str):
    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT SKILL_NAME
            FROM JOB_REQUIRED_SKILLS
            WHERE JOB_ROLE_ID = ?
            """,
            (job_role_id,)
        )

        return {
            row[0].strip().casefold()
            for row in cursor.fetchall()
        }

    finally:
        if cursor:
            cursor.close()

        if conn:
            release_connection(conn)


def get_hr_audit_logs(hr_id: str, limit: int = 50):
    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT
                LOG_ID,
                HR_ID,
                ACTION,
                ENTITY_TYPE,
                ENTITY_ID,
                DETAILS,
                CREATED_AT
            FROM HR_AUDIT_LOGS
            WHERE HR_ID = ?
            ORDER BY CREATED_AT DESC, LOG_ID DESC
            LIMIT ?
            """,
            (hr_id, limit)
        )

        columns = [
            column[0].lower()
            for column in cursor.description
        ]

        return [
            dict(zip(columns, row))
            for row in cursor.fetchall()
        ]

    finally:
        if cursor:
            cursor.close()

        if conn:
            release_connection(conn)