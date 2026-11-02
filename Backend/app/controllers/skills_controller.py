
import traceback
from pathlib import Path

from fastapi import HTTPException
from starlette.concurrency import run_in_threadpool

from agents.skills_agent import SkillsDiscoveryAgent

from app.schemas.skills_schema import (
    ProfileExtractResponse,
    SkillConfirmResponse,
)

from app.models.skills_model import (
    save_extracted_skills,
    save_confirmed_skills,
    get_employee_skills,
    get_audit_logs,
    get_employee_profile_text,
)
from app.models.skill_taxonomy_model import get_skill_taxonomy


# =====================================================
# AGENT INITIALIZATION
# =====================================================

BACKEND_ROOT = Path(__file__).resolve().parents[2]

MCP_SERVER_PATH = (
    BACKEND_ROOT / "mcp_server" / "skill_mcp_server.py"
)

if not MCP_SERVER_PATH.is_file():
    raise FileNotFoundError(
        f"Skills MCP server not found: {MCP_SERVER_PATH}"
    )

skills_agent = SkillsDiscoveryAgent(
    server_script=str(MCP_SERVER_PATH)
)


# =====================================================
# EXTRACT SKILLS
# =====================================================

async def extract_skills_controller(payload):
    employee_id = payload.employee_id

    if not employee_id:
        raise HTTPException(
            status_code=400,
            detail="Employee ID is required."
        )

    try:
        # Always retrieve the profile text from the database.
        profile_text = await run_in_threadpool(
            get_employee_profile_text,
            employee_id
        )
        taxonomy_rows = await run_in_threadpool(
            get_skill_taxonomy
        )

        agent_result = await skills_agent.discover_skills(
            employee_id=employee_id,
            profile_text=profile_text.strip(),
            taxonomy_rows=taxonomy_rows,
        )

        proposed_skills = agent_result.get(
            "proposed_skills",
            []
        )

        print("\n========== CONTROLLER RESULT ========")
        print("Proposed skills:", proposed_skills)
        print("Count:", len(proposed_skills))
        print("=====================================\n")

        if not isinstance(proposed_skills, list):
            raise ValueError(
                "The skills agent returned an invalid skills list."
            )

        extracted_skills = []
        seen_skills = set()

        for skill in proposed_skills:
            if not isinstance(skill, dict):
                continue

            name = skill.get("name")

            if not isinstance(name, str) or not name.strip():
                continue

            name = name.strip()
            normalized_name = name.casefold()

            if normalized_name in seen_skills:
                continue

            seen_skills.add(normalized_name)

            skill_id = skill.get("skill_id")

            if not skill_id:
                raise ValueError(
                    f"The normalizer did not provide a skill ID for {name}."
                )

            extracted_skills.append({
                "skill_id": str(skill_id),
                "name": name,
                "taxonomy_category": (
                    skill.get("taxonomy_category") or "General"
                ),
                "evidence_snippet": (
                    skill.get("evidence_snippet") or ""
                ),
            })

        save_result = await run_in_threadpool(
            save_extracted_skills,
            employee_id,
            extracted_skills
        )

        return ProfileExtractResponse(
            employee_id=employee_id,
            status="PENDING_EMPLOYEE_CONFIRMATION",
            extracted_skills=save_result["pending_skills"],
            simulated_data_notice=None,
        )

    except HTTPException:
        raise

    except ValueError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error)
        )

    except Exception as error:
        print(
            f"[SKILLS EXTRACTION ERROR] {repr(error)}"
        )
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail="An error occurred while extracting skills."
        )


# =====================================================
# CONFIRM SKILLS
# =====================================================

async def confirm_skills_controller(payload):
    employee_id = payload.employee_id

    if not employee_id:
        raise HTTPException(
            status_code=400,
            detail="Employee ID is required."
        )

    try:
        # Read the existing employee state and pending drafts.
        current_state = await run_in_threadpool(
            get_employee_skills,
            employee_id
        )
        taxonomy_rows = await run_in_threadpool(
            get_skill_taxonomy
        )

        employee = current_state["employee"]

        current_drafts = current_state[
            "extracted_skills_draft"
        ]

        already_confirmed = current_state[
            "confirmed_skills_final"
        ]

        # Build a lookup of actual database drafts.
        draft_by_name = {
            skill["name"].strip().casefold(): skill
            for skill in current_drafts
            if skill.get("name")
        }

        existing_confirmed_names = {
            skill["name"].strip().casefold()
            for skill in already_confirmed
            if skill.get("name")
        }

        # Validate and deduplicate the employee's final selection.
        submitted_skills = []
        seen_names = set()

        for skill in payload.confirmed_skills:
            name = (skill.name or "").strip()

            if not name:
                continue

            normalized_name = name.casefold()

            if normalized_name in seen_names:
                continue

            seen_names.add(normalized_name)

            submitted_skills.append({
                "name": name,
                "taxonomy_category": (
                    skill.taxonomy_category or "General"
                ),
                "evidence_snippet": (
                    skill.evidence_snippet or ""
                )
            })

        selected_names = {
            skill["name"].casefold()
            for skill in submitted_skills
        }

        # Only accept extracted skills that actually exist in the
        # employee's current pending draft table.
        accepted_skills = [
            draft_by_name[skill["name"].casefold()]
            for skill in submitted_skills
            if skill["name"].casefold() in draft_by_name
        ]

        # Names that are neither pending nor already confirmed
        # are manual skills added by the employee.
        added_raw_skills = [
            skill["name"]
            for skill in submitted_skills
            if skill["name"].casefold() not in draft_by_name
            and skill["name"].casefold()
            not in existing_confirmed_names
        ]

        # Identify pending suggestions the employee rejected.
        removed_skill_ids = [
            skill["skill_id"]
            for skill in current_drafts
            if skill["name"].strip().casefold()
            not in selected_names
        ]

        # Send accepted skills and manual additions through the
        # existing Skills Discovery MCP agent.
        #
        # Avoid creating a misleading local agent confirmation event
        # when the employee has no confirmed skills and selects none.
        if (
            accepted_skills
            or added_raw_skills
            or already_confirmed
        ):
            agent_result = await skills_agent.confirm_employee_skills(
                employee_id=employee_id,
                employee_name=employee.get(
                    "full_name",
                    employee_id
                ),
                accepted_skills=accepted_skills,
                added_raw_skills=added_raw_skills,
                removed_skill_ids=removed_skill_ids,
                taxonomy_rows=taxonomy_rows,
            )

            final_skills = agent_result.get(
                "confirmed_skills",
                []
            )

        else:
            final_skills = []

        # Persist the final employee selection.
        result = await run_in_threadpool(
            save_confirmed_skills,
            employee_id,
            final_skills
        )

        ready = result["ready_for_matching"]

        return SkillConfirmResponse(
            employee_id=employee_id,
            status=(
                "CONFIRMED_READY_FOR_MATCHING"
                if ready
                else "CONFIRMED_NOT_READY_FOR_MATCHING"
            ),
            confirmed_count=result["confirmed_count"],
            ready_for_matching=ready,
            confirmed_skills=result["confirmed_skills"]
        )

    except HTTPException:
        raise

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )

    except Exception as error:
        print(
            f"[SKILLS CONFIRMATION ERROR] "
            f"{type(error).__name__}: {error}"
        )
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail="Unable to save confirmed skills."
        )


# =====================================================
# GET EMPLOYEE SKILLS STATE
# =====================================================

async def get_skills_state_controller(employee_id):
    try:
        employee_state = await run_in_threadpool(
            get_employee_skills,
            employee_id
        )

        return employee_state

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )

    except Exception as error:
        print(
            f"[SKILLS STATE ERROR] "
            f"{type(error).__name__}: {error}"
        )
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail="Unable to load employee skills."
        )


# =====================================================
# GET EMPLOYEE AUDIT LOGS
# =====================================================

async def get_skills_audit_controller(employee_id=None):
    try:
        logs = await run_in_threadpool(
            get_audit_logs,
            employee_id
        )

        return {
            "employee_id": employee_id,
            "count": len(logs),
            "logs": logs,
        }

    except Exception as error:
        print(
            f"[SKILLS AUDIT ERROR] "
            f"{type(error).__name__}: {error}"
        )
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve audit logs."
        )
