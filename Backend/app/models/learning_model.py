import json

from app.database.connection import get_connection, release_connection


def get_learning_session_record(employee_id: str) -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            SELECT
                jr.TITLE,
                mr.MISSING_SKILLS,
                mr.MATCH_SCORE
            FROM MATCHING_RESULTS mr
            INNER JOIN JOB_ROLES jr
                ON jr.JOB_ROLE_ID = mr.JOB_ROLE_ID
            WHERE mr.EMPLOYEE_ID = ?
            ORDER BY mr.MATCH_SCORE DESC
            """,
            (employee_id,),
        )
        columns = [column[0].lower() for column in cursor.description]
        roles = []
        for row in cursor.fetchall():
            record = dict(zip(columns, row))
            missing = record.get("missing_skills") or []
            if isinstance(missing, str):
                try:
                    missing = json.loads(missing)
                except json.JSONDecodeError:
                    missing = []
            roles.append({
                "title": record["title"],
                "missing_skills": [
                    item.get("skill_name")
                    for item in missing
                    if isinstance(item, dict) and item.get("skill_name")
                ],
                "match_score": (
                    float(record["match_score"])
                    if record["match_score"] is not None
                    else None
                ),
            })
        cursor.execute(
            """
            SELECT COURSE_ID, TITLE, TARGET_SKILL, DURATION, SAP_LEARNING_HUB_URL
            FROM LEARNING_COURSES
            WHERE IS_ACTIVE = 1
            ORDER BY COURSE_ID
            """
        )
        columns = [column[0].lower() for column in cursor.description]
        courses = [dict(zip(columns, row)) for row in cursor.fetchall()]

        cursor.execute(
            """
            SELECT NAME
            FROM CONFIRMED_SKILLS_FINAL
            WHERE EMPLOYEE_ID = ?
            ORDER BY NAME
            """,
            (employee_id,),
        )
        confirmed_skills = [
            row[0]
            for row in cursor.fetchall()
            if row[0]
        ]

        return {
            "role_matches": {"recommended_roles": roles},
            "courses": courses,
            "confirmed_skills": confirmed_skills,
        }
    finally:
        cursor.close()
        release_connection(conn)


def record_learning_audit(employee_id: str, result: dict) -> None:
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            INSERT INTO AUDIT_LOGS
                (EMPLOYEE_ID, ACTOR, ACTION, TOOL, DETAILS)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                employee_id,
                "Learning Pathway Agent",
                "generate_learning_pathway",
                "Career Development MCP",
                json.dumps({
                    "target_role": result["target_role"],
                    "recommended_courses": len(
                        result["recommended_courses"]
                    ),
                }),
            ),
        )
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        release_connection(conn)
