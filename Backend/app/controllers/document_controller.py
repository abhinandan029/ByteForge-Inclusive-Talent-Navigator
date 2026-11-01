import os

from fastapi import UploadFile, HTTPException

from app.models.document_model import (
    save_document,
    rebuild_employee_profile_text
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
    Rebuild employee PROFILE_TEXT after successful uploads.
    """

    if not employee_id or not employee_id.strip():
        raise HTTPException(
            status_code=400,
            detail="Employee ID is required."
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
    failed_uploads = []

    for file in files:

        file_name = file.filename or "unnamed"

        try:
            # Get and validate the file extension.
            safe_file_name = os.path.basename(
                file_name.replace("\\", "/")
            )

            extension = safe_file_name.rsplit(".", 1)[-1].lower()

            if "." not in safe_file_name or extension not in ALLOWED_EXTENSIONS:
                raise ValueError(
                    "Unsupported file format. Upload PDF or DOCX only."
                )

            # Read file content with a size limit.
            file_content = await file.read(MAX_FILE_SIZE + 1)

            if not file_content:
                raise ValueError("The uploaded file is empty.")

            if len(file_content) > MAX_FILE_SIZE:
                raise ValueError("File size exceeds the 10 MB limit.")

            # Extract document text.
            extracted_text = extract_document_text(
                file_content,
                safe_file_name
            )

            if not extracted_text.strip():
                raise ValueError(
                    "No readable text found in the document. "
                    "Scanned PDFs are not supported yet."
                )

            # Save the original file and extracted text.
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

            successful_uploads.append(result)

        except Exception as exc:
            failed_uploads.append({
                "file_name": file_name,
                "error": str(exc)
            })

        finally:
            await file.close()

    # If no document was successfully saved, return an error.
    if not successful_uploads:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "No documents were uploaded successfully.",
                "failed_uploads": failed_uploads
            }
        )

    # Rebuild PROFILE_TEXT after successful uploads.
    try:
        rebuild_employee_profile_text(employee_id)

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Documents were saved, but employee profile text "
                f"could not be rebuilt: {str(exc)}"
            )
        )

    return {
        "success": True,
        "message": "Document upload completed.",
        "employee_id": employee_id,
        "uploaded_count": len(successful_uploads),
        "failed_count": len(failed_uploads),
        "uploaded_documents": successful_uploads,
        "failed_uploads": failed_uploads
    }