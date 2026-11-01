from uuid import uuid4

from app.database.connection import (
    get_connection,
    release_connection
)


def save_document(
    employee_id: str,
    file_name: str,
    document_type: str,
    mime_type: str,
    file_content: bytes,
    extracted_text: str
):
    """
    Save the original document and its extracted text.
    """

    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        document_id = str(uuid4())

        cursor.execute(
            """
            INSERT INTO EMPLOYEE_DOCUMENTS
            (
                DOCUMENT_ID,
                EMPLOYEE_ID,
                FILE_NAME,
                DOCUMENT_TYPE,
                MIME_TYPE,
                FILE_CONTENT,
                EXTRACTED_TEXT,
                PROCESSING_STATUS
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                document_id,
                employee_id,
                file_name,
                document_type,
                mime_type,
                file_content,
                extracted_text,
                "COMPLETED"
            )
        )

        conn.commit()

        return {
            "document_id": document_id,
            "file_name": file_name,
            "processing_status": "COMPLETED"
        }

    except Exception:
        if conn:
            conn.rollback()
        raise

    finally:
        if cursor:
            cursor.close()

        if conn:
            release_connection(conn)


def get_employee_documents(employee_id: str):
    """
    Retrieve document metadata for an employee.
    Does not return the original file content.
    """

    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT
                DOCUMENT_ID,
                FILE_NAME,
                DOCUMENT_TYPE,
                MIME_TYPE,
                PROCESSING_STATUS,
                UPLOADED_AT
            FROM EMPLOYEE_DOCUMENTS
            WHERE EMPLOYEE_ID = ?
            ORDER BY UPLOADED_AT DESC
            """,
            (employee_id,)
        )

        rows = cursor.fetchall()

        columns = [
            column[0].lower()
            for column in cursor.description
        ]

        return [
            dict(zip(columns, row))
            for row in rows
        ]

    finally:
        if cursor:
            cursor.close()

        if conn:
            release_connection(conn)


def rebuild_employee_profile_text(employee_id: str):
    """
    Rebuild PROFILE_TEXT using all successfully processed documents.
    """

    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT EXTRACTED_TEXT
            FROM EMPLOYEE_DOCUMENTS
            WHERE EMPLOYEE_ID = ?
              AND PROCESSING_STATUS = ?
            ORDER BY UPLOADED_AT ASC
            """,
            (employee_id, "COMPLETED")
        )

        rows = cursor.fetchall()

        combined_text = "\n\n".join(
            row[0].strip()
            for row in rows
            if row[0] and row[0].strip()
        )

        if not combined_text:
            raise ValueError(
                "No successfully processed document text found."
            )

        cursor.execute(
            """
            UPDATE EMPLOYEES
            SET PROFILE_TEXT = ?
            WHERE EMPLOYEE_ID = ?
            """,
            (combined_text, employee_id)
        )

        if cursor.rowcount == 0:
            raise ValueError("Employee not found.")

        conn.commit()

        return combined_text

    except Exception:
        if conn:
            conn.rollback()
        raise

    finally:
        if cursor:
            cursor.close()

        if conn:
            release_connection(conn)


def delete_employee_document(
    employee_id: str,
    document_id: str
):
    """
    Delete a document belonging to an employee.
    """

    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            DELETE FROM EMPLOYEE_DOCUMENTS
            WHERE DOCUMENT_ID = ?
              AND EMPLOYEE_ID = ?
            """,
            (document_id, employee_id)
        )

        deleted = cursor.rowcount > 0

        conn.commit()

        return deleted

    except Exception:
        if conn:
            conn.rollback()
        raise

    finally:
        if cursor:
            cursor.close()

        if conn:
            release_connection(conn)