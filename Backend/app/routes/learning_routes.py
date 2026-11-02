from fastapi import APIRouter, Depends

from app.controllers.learning_controller import (
    get_learning_pathway_controller,
)
from app.schemas.learning_schema import LearningPathwayResponse
from app.utils.auth_dependencies import (
    get_current_employee,
    require_password_changed,
)

router = APIRouter(prefix="/api/learning", tags=["Career Development"])


@router.get(
    "/pathway",
    response_model=LearningPathwayResponse,
)
def get_learning_pathway(
    employee: dict = Depends(get_current_employee),
):
    employee = require_password_changed(employee)
    return get_learning_pathway_controller(employee["employee_id"])
