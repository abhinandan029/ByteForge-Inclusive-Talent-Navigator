import logging

from fastapi import HTTPException

from agents.learning_agent import run_learning_pathway
from app.models.learning_model import (
    get_learning_session_record,
    record_learning_audit,
)

logger = logging.getLogger(__name__)


def get_learning_pathway_controller(employee_id: str):
    try:
        session_record = get_learning_session_record(employee_id)
        result = run_learning_pathway(employee_id, session_record)
        response = result.model_dump()
        record_learning_audit(employee_id, response)
        return response
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(
            "Learning pathway generation failed for employee %s.",
            employee_id,
        )
        raise HTTPException(
            status_code=500,
            detail="Unable to generate a learning pathway.",
        ) from exc
