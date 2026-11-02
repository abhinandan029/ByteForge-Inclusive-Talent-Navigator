
import os

from fastapi import UploadFile, HTTPException

from app.models.document_model import (
    save_document,
    get_employee_documents,
    rebuild_employee_profile_text,
    delete_employee_document,
    employee_exists
)

from app.utils.document_extractor import extract_document_text


MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
MAX_FILES_PER_REQUEST = 10

ALLOWED_EXTENSIONS = {
    "pdf",
    "docx"
}


async def upload_documents_controller(
    employee_id: str,
    files: list[UploadFile]
):
    """
    Validate, extract and save employee documents.
    Rebuild PROFILE_TEXT after uploads or duplicate detection.
    """

    if not employee_id or not employee_id.strip():
        raise HTTPException(
            status_code=400,
            detail="Employee ID is required."
        )

    employee_id = employee_id.strip()

    if not employee_exists(employee_id):
        raise HTTPException(
            status_code=404,
            detail="Employee not found."
        )

    if not files:
        raise HTTPException(
            status_code=400,
            detail="Please upload at least one document."
        )

    if len(files) > MAX_FILES_PER_REQUEST:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum {MAX_FILES_PER_REQUEST} files allowed per request."
        )

    successful_uploads = []
    duplicate_documents = []
    failed_uploads = []

    for file in files:

        original_file_name = file.filename or "unnamed"
        safe_file_name = os.path.basename(
            original_file_name.replace("\\", "/")
        )

        try:
            # 1. Validate the filename and extension.
            if "." not in safe_file_name:
                raise ValueError("File extension is missing.")

            extension = safe_file_name.rsplit(".", 1)[-1].lower()

            if extension not in ALLOWED_EXTENSIONS:
                raise ValueError(
                    "Unsupported file format. Upload PDF or DOCX only."
                )

            # 2. Read and validate file size.
            file_content = await file.read(MAX_FILE_SIZE + 1)

            if not file_content:
                raise ValueError("The uploaded file is empty.")

            if len(file_content) > MAX_FILE_SIZE:
                raise ValueError("File size exceeds the 10 MB limit.")

            # 3. Extract and clean document text.
            extracted_text = extract_document_text(
                file_content,
                safe_file_name
            )

            if not extracted_text.strip():
                raise ValueError(
                    "No readable text found in the document. "
                    "Scanned PDFs are not supported yet."
                )

        except Exception as exc:
            failed_uploads.append({
                "file_name": original_file_name,
                "error": str(exc)
            })

            continue

        finally:
            await file.close()

        # Database errors are intentionally not swallowed as
        # individual file-validation failures.
        result = save_document(
            employee_id=employee_id,
            file_name=safe_file_name,
            document_type=extension.upper(),
            mime_type=(
                file.content_type or "application/octet-stream"
            ),
            file_content=file_content,
            extracted_text=extracted_text
        )

        if result["is_duplicate"]:
            duplicate_documents.append(result)
        else:
            successful_uploads.append(result)

    # All files failed validation.
    if not successful_uploads and not duplicate_documents:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "No documents were uploaded successfully.",
                "failed_uploads": failed_uploads
            }
        )

    # Rebuild even if all uploads were duplicates.
    # This also cleans text belonging to older stored documents.
    try:
        rebuild_employee_profile_text(employee_id)

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Documents were processed, but employee profile text "
                f"could not be rebuilt: {str(exc)}"
            )
        )

    return {
        "success": True,
        "message": "Document upload completed.",
        "employee_id": employee_id,
        "uploaded_count": len(successful_uploads),
        "duplicate_count": len(duplicate_documents),
        "failed_count": len(failed_uploads),
        "uploaded_documents": successful_uploads,
        "duplicate_documents": duplicate_documents,
        "failed_uploads": failed_uploads
    }


def get_employee_documents_controller(employee_id: str):
    """Return the metadata of an employee's uploaded documents."""

    if not employee_exists(employee_id):
        raise HTTPException(
            status_code=404,
            detail="Employee not found."
        )

    documents = get_employee_documents(employee_id)

    return {
        "success": True,
        "employee_id": employee_id,
        "document_count": len(documents),
        "documents": documents
    }


def delete_employee_document_controller(
    employee_id: str,
    document_id: str
):
    """Delete an employee's document and rebuild their profile."""

    if not employee_exists(employee_id):
        raise HTTPException(
            status_code=404,
            detail="Employee not found."
        )

    deleted = delete_employee_document(
        employee_id,
        document_id
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Document not found for this employee."
        )

    return {
        "success": True,
        "message": "Document deleted and employee profile updated.",
        "employee_id": employee_id,
        "document_id": document_id
    }
