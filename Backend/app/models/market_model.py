import json

from app.database.connection import get_connection, release_connection


def get_market_session_record(employee_id: str) -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            SELECT NAME, TAXONOMY_CATEGORY, EVIDENCE_SNIPPET
            FROM CONFIRMED_SKILLS_FINAL
            WHERE EMPLOYEE_ID = ?
            ORDER BY NAME
            """,
            (employee_id,),
        )
        columns = [column[0].lower() for column in cursor.description]
        skills = [dict(zip(columns, row)) for row in cursor.fetchall()]
        return {"confirmed_skills": skills}
    finally:
        cursor.close()
        release_connection(conn)


def record_market_audit(employee_id: str, result: dict) -> None:
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
                "Market Intelligence Agent",
                "analyze_market_demand",
                "Market Intelligence MCP",
                json.dumps({
                    "matched_skills": len(result["in_demand_skills"]),
                    "high_demand_count": result["high_demand_count"],
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
