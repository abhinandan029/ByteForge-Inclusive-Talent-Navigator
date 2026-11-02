
import json
from typing import Any

from app.database.connection import (
    get_connection,
    release_connection
)


def insert_audit_event(
    cursor,
    employee_id: str,
    actor: str,
    action: str,
    tool: str,
    details: Any
):
    """
    Insert an audit event using an existing database cursor.

    The caller controls the transaction and commits or rolls it back.
    """

    if not isinstance(details, str):
        details = json.dumps(
            details,
            ensure_ascii=False,
            default=str
        )

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


def log_audit_event(
    session_id: str,
    actor: str,
    action: str,
    input_summary: str,
    output_summary: str
):
    """
    Log an agent event directly into the database.

    The existing agent interface is retained for compatibility.
    session_id represents the employee ID in this project.
    """

    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        details = {
            "input_summary": input_summary,
            "output_summary": output_summary
        }

        insert_audit_event(
            cursor=cursor,
            employee_id=session_id,
            actor=actor,
            action=action,
            tool="AGENT_EXECUTION",
            details=details
        )

        conn.commit()

    except Exception:
        if conn:
            conn.rollback()
        raise

    finally:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass

        if conn:
            release_connection(conn)
