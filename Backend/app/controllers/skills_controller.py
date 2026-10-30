
from fastapi import HTTPException

from app.schemas.skills_schema import (
    ProfileExtractRequest,
    ProfileExtractResponse,
    SkillConfirmRequest,
    SkillConfirmResponse,
    EmployeeSkillsStateResponse
)

from app.models.skills_model import (
    save_extracted_skills,
    save_confirmed_skills,
    get_employee_skills,
    get_audit_logs
)

from starlette.concurrency import run_in_threadpool

# ==================================================
# SKILLS EXTRACTION
# ==================================================

async def extract_skills_controller(payload):
    try:
        employee_id = payload.employee_id
        profile_text = payload.profile_text

        if not employee_id:
            raise HTTPException(
                status_code=400,
                detail="Employee ID is required"
            )

        if not profile_text or not profile_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Profile text is required"
            )

        # ------------------------------------------
        # MCP integration point
        # ------------------------------------------
        # Replace this section with your actual
        # Skills MCP agent call.
        #
        # Expected result:
        # [
        #   {
        #       "skill_id": "SK001",
        #       "name": "Python",
        #       "taxonomy_category": "Technical",
        #       "evidence_snippet": "Built Python microservices"
        #   }
        # ]

        extracted_skills = await _call_skills_mcp_stub(
            profile_text
        )

        # Save extracted skills through model
        save_extracted_skills(
            employee_id,
            extracted_skills
        )

        return {
            "employee_id": employee_id,
            "status": "success",
            "extracted_skills": extracted_skills,
            "simulated_data_notice": None
        }

    except HTTPException:
        raise

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )

    except Exception as error:
        print("Skills extraction error:", error)

        raise HTTPException(
            status_code=500,
            detail="Unable to extract skills"
        )


# ==================================================
# MCP STUB
# ==================================================

async def _call_skills_mcp_stub(profile_text):
    """
    Temporary integration point for the Skills MCP agent.

    Replace this function with the actual MCP call.
    It intentionally does not return hardcoded skills.
    """

    raise HTTPException(
        status_code=501,
        detail="Skills MCP integration is not configured yet."
    )


# ==================================================
# CONFIRM SKILLS
# ==================================================

async def confirm_skills_controller(payload):
    try:
        employee_id = payload.employee_id
        confirmed_skills = payload.confirmed_skills

        if not employee_id:
            raise HTTPException(
                status_code=400,
                detail="Employee ID is required"
            )

        if not confirmed_skills:
            raise HTTPException(
                status_code=400,
                detail="At least one skill must be confirmed"
            )

        skills_to_save = []

        for skill in confirmed_skills:
            skills_to_save.append({
                "name": skill.name,
                "taxonomy_category": (
                    skill.taxonomy_category or "General"
                ),
                "evidence_snippet": (
                    skill.evidence_snippet or
                    "Confirmed by employee"
                )
            })

        save_confirmed_skills(
            employee_id,
            skills_to_save
        )

        return {
            "employee_id": employee_id,
            "status": "success",
            "confirmed_count": len(skills_to_save),
            "ready_for_matching": True,
            "confirmed_skills": skills_to_save
        }

    except HTTPException:
        raise

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )

    except Exception as error:
        print("Skills confirmation error:", error)

        raise HTTPException(
            status_code=500,
            detail="Unable to confirm skills"
        )


# ==================================================
# GET EMPLOYEE SKILLS STATE
# ==================================================


async def get_skills_state_controller(employee_id):
    try:
        if not employee_id:
            raise HTTPException(
                status_code=400,
                detail="Employee ID is required"
            )

        employee_state = await run_in_threadpool(
            get_employee_skills,
            employee_id
        )

        return employee_state

    except HTTPException:
        raise

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )

    except Exception as error:
        print("Get employee skills error:", error)

        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve employee skills"
        )



# ==================================================
# GET AUDIT LOGS
# ==================================================

async def get_skills_audit_controller(employee_id=None):
    try:
        logs = get_audit_logs(employee_id)

        return {
            "status": "success",
            "count": len(logs),
            "logs": logs
        }

    except Exception as error:
        print("Audit logs error:", error)

        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve audit logs"
        )
