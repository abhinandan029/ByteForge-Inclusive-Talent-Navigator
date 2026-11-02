

import hashlib
from uuid import uuid4

from app.database.connection import (
    get_connection,
    release_connection
)

from app.utils.document_extractor import sanitize_extracted_text


def save_document(
    employee_id: str,
    file_name: str,
    document_type: str,
    mime_type: str,
    file_content: bytes,
    extracted_text: str
):
    """
    Save an employee document.

    Detects duplicate file content per employee.
    Safely consumes all MySQL query results.
    """

    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        file_hash = hashlib.sha256(file_content).hexdigest()

        cleaned_text = sanitize_extracted_text(extracted_text)

        if not cleaned_text:
            raise ValueError("Document contains no readable text.")

        # Check documents that already have a stored hash.
        cursor.execute(
            """
            SELECT DOCUMENT_ID, FILE_NAME, PROCESSING_STATUS
            FROM EMPLOYEE_DOCUMENTS
            WHERE EMPLOYEE_ID = ?
              AND FILE_HASH = ?
            ORDER BY UPLOADED_AT DESC
            """,
            (employee_id, file_hash)
        )

        existing_rows = cursor.fetchall()

        if existing_rows:
            existing = existing_rows[0]
            conn.commit()

            return {
                "document_id": existing[0],
                "file_name": existing[1],
                "processing_status": existing[2],
                "is_duplicate": True
            }

        # Find older documents without a stored hash.
        cursor.execute(
            """
            SELECT DOCUMENT_ID, FILE_CONTENT
            FROM EMPLOYEE_DOCUMENTS
            WHERE EMPLOYEE_ID = ?
              AND FILE_HASH IS NULL
            """,
            (employee_id,)
        )

        legacy_documents = cursor.fetchall()

        duplicate_document_id = None

        for row in legacy_documents:
            existing_document_id = row[0]
            existing_content = row[1]

            if existing_content is None:
                continue

            existing_hash = hashlib.sha256(
                bytes(existing_content)
            ).hexdigest()

            # Backfill the hash for the old record.
            cursor.execute(
                """
                UPDATE EMPLOYEE_DOCUMENTS
                SET FILE_HASH = ?
                WHERE DOCUMENT_ID = ?
                  AND EMPLOYEE_ID = ?
                """,
                (
                    existing_hash,
                    existing_document_id,
                    employee_id
                )
            )

            if existing_hash == file_hash:
                duplicate_document_id = existing_document_id

        if duplicate_document_id:
            cursor.execute(
                """
                SELECT FILE_NAME, PROCESSING_STATUS
                FROM EMPLOYEE_DOCUMENTS
                WHERE DOCUMENT_ID = ?
                  AND EMPLOYEE_ID = ?
                """,
                (duplicate_document_id, employee_id)
            )

            duplicate_rows = cursor.fetchall()

            if not duplicate_rows:
                raise ValueError(
                    "Duplicate document could not be retrieved."
                )

            existing = duplicate_rows[0]

            conn.commit()

            return {
                "document_id": duplicate_document_id,
                "file_name": existing[0],
                "processing_status": existing[1],
                "is_duplicate": True
            }

        # Save a new document.
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
                PROCESSING_STATUS,
                FILE_HASH
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                document_id,
                employee_id,
                file_name,
                document_type,
                mime_type,
                file_content,
                cleaned_text,
                "COMPLETED",
                file_hash
            )
        )

        conn.commit()

        return {
            "document_id": document_id,
            "file_name": file_name,
            "processing_status": "COMPLETED",
            "is_duplicate": False
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



def employee_exists(employee_id: str) -> bool:
    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT EMPLOYEE_ID
            FROM EMPLOYEES
            WHERE EMPLOYEE_ID = ?
            """,
            (employee_id,)
        )

        return cursor.fetchone() is not None

    finally:
        if cursor:
            cursor.close()

        if conn:
            release_connection(conn)


def get_employee_documents(employee_id: str):
    """
    Retrieve document metadata for an employee.
    Original file content is never returned.
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


def _rebuild_employee_profile_text(cursor, employee_id: str):
    """
    Internal helper. Rebuilds profile text using completed documents.
    """

    cursor.execute(
        """
        SELECT EMPLOYEE_ID
        FROM EMPLOYEES
        WHERE EMPLOYEE_ID = ?
        """,
        (employee_id,)
    )

    if cursor.fetchone() is None:
        raise ValueError("Employee not found.")

    cursor.execute(
        """
        SELECT FILE_NAME, DOCUMENT_TYPE, EXTRACTED_TEXT
        FROM EMPLOYEE_DOCUMENTS
        WHERE EMPLOYEE_ID = ?
          AND PROCESSING_STATUS = ?
        ORDER BY UPLOADED_AT ASC
        """,
        (employee_id, "COMPLETED")
    )

    rows = cursor.fetchall()

    cleaned_documents = []

    for row in rows:
        file_name, document_type, extracted_text = row

        if extracted_text:
            cleaned_text = sanitize_extracted_text(extracted_text)

            if cleaned_text:
                cleaned_documents.append(
                    "\n".join(
                        [
                            f"DOCUMENT: {file_name or 'Uploaded document'}",
                            f"TYPE: {document_type or 'UNKNOWN'}",
                            cleaned_text,
                            "END DOCUMENT",
                        ]
                    )
                )

    # An empty document collection should clear PROFILE_TEXT.
    combined_text = "\n\n".join(cleaned_documents)

    cursor.execute(
        """
        UPDATE EMPLOYEES
        SET PROFILE_TEXT = ?
        WHERE EMPLOYEE_ID = ?
        """,
        (combined_text, employee_id)
    )

    return combined_text


def rebuild_employee_profile_text(employee_id: str):
    """
    Rebuild PROFILE_TEXT from all completed documents.

    Also cleans old stored text when documents are reprocessed.
    """

    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        combined_text = _rebuild_employee_profile_text(
            cursor,
            employee_id
        )

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
    Delete a document belonging to an employee and rebuild
    the employee's profile text in the same transaction.
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

        if deleted:
            # Rebuild profile before committing the deletion.
            _rebuild_employee_profile_text(
                cursor,
                employee_id
            )

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
