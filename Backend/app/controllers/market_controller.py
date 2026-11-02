from fastapi import HTTPException

from agents.market_agent import run_market_intelligence
from app.models.market_model import (
    get_market_session_record,
    record_market_audit,
)


def get_market_intelligence_controller(employee_id: str):
    try:
        session_record = get_market_session_record(employee_id)
        result = run_market_intelligence(employee_id, session_record)
        response = result.model_dump()
        record_market_audit(employee_id, response)
        return response
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Unable to analyze market intelligence.",
        ) from exc
