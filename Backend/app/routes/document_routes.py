
from typing import Annotated

from fastapi import APIRouter, UploadFile, File, Form

from app.controllers.document_controller import (
    upload_documents_controller,
    get_employee_documents_controller,
    delete_employee_document_controller
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


@router.get("/{employee_id}")
def get_employee_documents(employee_id: str):
    return get_employee_documents_controller(
        employee_id=employee_id
    )


@router.delete("/{employee_id}/{document_id}")
def delete_employee_document(
    employee_id: str,
    document_id: str
):
    return delete_employee_document_controller(
        employee_id=employee_id,
        document_id=document_id
    )
