import json
import uuid

from app.database.connection import get_connection, release_connection


def _rows(cursor):
    values = cursor.fetchall()
    columns = [column[0].lower() for column in cursor.description]
    return [dict(zip(columns, row)) for row in values]


def get_employee_progress(employee_id: str) -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            SELECT SKILL_NAME, INFERRED_PROFICIENCY, EVIDENCE_CONFIDENCE,
                   LAST_EVIDENCE_AT, PROJECT_EVIDENCE_COUNT,
                   LEARNING_PROGRESS_SCORE, EMPLOYEE_CONFIRMED,
                   MANAGER_VALIDATED, MANAGER_NOTE
            FROM EMPLOYEE_SKILL_PROGRESS
            WHERE EMPLOYEE_ID = ?
            ORDER BY SKILL_NAME
            """,
            (employee_id,),
        )
        skills = _rows(cursor)
        cursor.execute(
            """
            SELECT TARGET_ROLE, PREFERRED_DEPARTMENT
            FROM EMPLOYEE_CAREER_GOALS
            WHERE EMPLOYEE_ID = ?
            """,
            (employee_id,),
        )
        goals = _rows(cursor)
        cursor.execute(
            """
            SELECT PROJECT_ID, PROJECT_NAME, DESCRIPTION, SKILLS_USED,
                   OUTCOME, STARTED_AT, COMPLETED_AT, CREATED_AT
            FROM EMPLOYEE_PROJECTS
            WHERE EMPLOYEE_ID = ?
            ORDER BY COALESCE(COMPLETED_AT, STARTED_AT, CREATED_AT) DESC
            """,
            (employee_id,),
        )
        projects = _rows(cursor)
        for project in projects:
            project["skills_used"] = (
                json.loads(project["skills_used"])
                if project.get("skills_used")
                else []
            )
        return {
            "employee_id": employee_id,
            "skills": skills,
            "goals": goals[0] if goals else {
                "target_role": None,
                "preferred_department": None,
            },
            "projects": projects,
        }
    finally:
        cursor.close()
        release_connection(conn)


def save_career_goals(employee_id: str, target_role, preferred_department):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT EMPLOYEE_ID FROM EMPLOYEE_CAREER_GOALS WHERE EMPLOYEE_ID = ?",
            (employee_id,),
        )
        if cursor.fetchone():
            cursor.execute(
                """
                UPDATE EMPLOYEE_CAREER_GOALS
                SET TARGET_ROLE = ?, PREFERRED_DEPARTMENT = ?,
                    UPDATED_AT = CURRENT_TIMESTAMP
                WHERE EMPLOYEE_ID = ?
                """,
                (target_role, preferred_department, employee_id),
            )
        else:
            cursor.execute(
                """
                INSERT INTO EMPLOYEE_CAREER_GOALS
                    (EMPLOYEE_ID, TARGET_ROLE, PREFERRED_DEPARTMENT)
                VALUES (?, ?, ?)
                """,
                (employee_id, target_role, preferred_department),
            )
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        release_connection(conn)


def add_project(employee_id: str, data: dict) -> dict:
    project_id = f"PROJ_{uuid.uuid4().hex[:24].upper()}"
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            INSERT INTO EMPLOYEE_PROJECTS
                (PROJECT_ID, EMPLOYEE_ID, PROJECT_NAME, DESCRIPTION,
                 SKILLS_USED, OUTCOME, STARTED_AT, COMPLETED_AT)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                project_id, employee_id, data["project_name"],
                data["description"], json.dumps(data["skills_used"]),
                data.get("outcome"), data.get("started_at"),
                data.get("completed_at"),
            ),
        )
        for skill in data["skills_used"]:
            cursor.execute(
                """
                UPDATE EMPLOYEE_SKILL_PROGRESS
                SET PROJECT_EVIDENCE_COUNT = PROJECT_EVIDENCE_COUNT + 1,
                    UPDATED_AT = CURRENT_TIMESTAMP
                WHERE EMPLOYEE_ID = ? AND LOWER(SKILL_NAME) = LOWER(?)
                """,
                (employee_id, skill),
            )
        conn.commit()
        return {"project_id": project_id, **data}
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        release_connection(conn)


def delete_project(employee_id: str, project_id: str) -> None:
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "DELETE FROM EMPLOYEE_PROJECTS WHERE PROJECT_ID = ? AND EMPLOYEE_ID = ?",
            (project_id, employee_id),
        )
        if cursor.rowcount == 0:
            raise ValueError("Project not found.")
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        release_connection(conn)


def validate_skill(employee_id: str, skill_name: str, validated: bool, note: str | None):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            UPDATE EMPLOYEE_SKILL_PROGRESS
            SET MANAGER_VALIDATED = ?, MANAGER_NOTE = ?,
                UPDATED_AT = CURRENT_TIMESTAMP
            WHERE EMPLOYEE_ID = ? AND SKILL_NAME = ?
            """,
            (1 if validated else 0, note, employee_id, skill_name),
        )
        if cursor.rowcount == 0:
            raise ValueError("Skill progress record not found.")
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        release_connection(conn)
