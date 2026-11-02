
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from app.controllers.document_controller import (
    upload_documents_controller,
    get_employee_documents_controller,
    delete_employee_document_controller
)
from app.utils.auth_dependencies import get_current_employee


router = APIRouter(
    prefix="/api/documents",
    tags=["Employee Documents"]
)


@router.post("/upload")
async def upload_documents(
    employee_id: Annotated[str, Form()],
    files: Annotated[list[UploadFile], File()],
    employee: dict = Depends(get_current_employee)
):
    if employee_id.strip() != employee["employee_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to upload documents for this employee."
        )

    return await upload_documents_controller(
        employee_id=employee["employee_id"],
        files=files
    )


@router.get("/{employee_id}")
def get_employee_documents(
    employee_id: str,
    employee: dict = Depends(get_current_employee)
):
    if employee_id != employee["employee_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access these documents."
        )

    return get_employee_documents_controller(
        employee_id=employee["employee_id"]
    )


@router.delete("/{employee_id}/{document_id}")
def delete_employee_document(
    employee_id: str,
    document_id: str,
    employee: dict = Depends(get_current_employee)
):
    if employee_id != employee["employee_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to delete these documents."
        )

    return delete_employee_document_controller(
        employee_id=employee["employee_id"],
        document_id=document_id
    )
