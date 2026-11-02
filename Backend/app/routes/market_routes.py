from fastapi import APIRouter, Depends

from app.controllers.market_controller import (
    get_market_intelligence_controller,
)
from app.schemas.market_schema import MarketIntelligenceResponse
from app.utils.auth_dependencies import (
    get_current_employee,
    require_password_changed,
)

router = APIRouter(prefix="/api/market", tags=["Market Intelligence"])


@router.get(
    "/intelligence",
    response_model=MarketIntelligenceResponse,
)
def get_market_intelligence(
    employee: dict = Depends(get_current_employee),
):
    employee = require_password_changed(employee)
    return get_market_intelligence_controller(employee["employee_id"])
