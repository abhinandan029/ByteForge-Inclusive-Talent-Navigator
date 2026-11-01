from typing import Annotated

from fastapi import APIRouter, UploadFile, File, Form

from app.controllers.document_controller import (
    upload_documents_controller
)

router = APIRouter(
    prefix="/api/documents",
    tags=["Employee Documents"]
)


@router.post("/upload")
async def upload_documents(
    employee_id: Annotated[str, Form()],
    files: Annotated[list[UploadFile], File()]
):
    return await upload_documents_controller(
        employee_id=employee_id,
        files=files
    )