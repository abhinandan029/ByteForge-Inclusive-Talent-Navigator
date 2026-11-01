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
)


# =====================================================
# AGENT INITIALIZATION
# =====================================================

# Backend/
# ├── agents/
# ├── app/
# ├── mcp_server/
# │   └── skills_mcp_server.py
# └── main.py

BACKEND_ROOT = Path(__file__).resolve().parents[2]

MCP_SERVER_PATH = BACKEND_ROOT / "mcp_server" / "skill_mcp_server.py"

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
    profile_text = payload.profile_text

    if not employee_id:
        raise HTTPException(
            status_code=400,
            detail="Employee ID is required."
        )

    if not profile_text or not profile_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Employee profile text is empty."
        )

    try:
        # discover_skills is asynchronous, so await it directly.
        print("\n========== SKILLS DEBUG ==========")
        print("Employee ID:", employee_id)
        print("Profile Text:", repr(profile_text))
        print("Profile Text Length:", len(profile_text))
        print("==================================\n")
        agent_result = await skills_agent.discover_skills(
            employee_id=employee_id,
            profile_text=profile_text.strip()
        )

        print("\n========== AGENT RESPONSE ==========")
        print(agent_result)
        print("====================================\n")

        proposed_skills = agent_result.get(
            "proposed_skills",
            []
        )

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

            # Avoid duplicate skill names.
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

        # Save extracted skills as employee drafts.
        await run_in_threadpool(
            save_extracted_skills,
            employee_id,
            extracted_skills
        )

        return ProfileExtractResponse(
            employee_id=employee_id,
            status="PENDING_EMPLOYEE_CONFIRMATION",
            extracted_skills=extracted_skills,
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
        print(f"\n[SKILLS EXTRACTION ERROR] {repr(error)}")
        traceback.print_exc()

        if isinstance(error, BaseExceptionGroup):
            for index, sub_error in enumerate(error.exceptions, 1):
                print(f"\n[SUB-ERROR {index}]")
                traceback.print_exception(sub_error)

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

    if not payload.confirmed_skills:
        raise HTTPException(
            status_code=400,
            detail="At least one skill must be confirmed."
        )

    try:
        confirmed_skills = []
        seen_skills = set()

        for skill in payload.confirmed_skills:

            name = skill.name.strip()

            if not name:
                continue

            normalized_name = name.casefold()

            if normalized_name in seen_skills:
                continue

            seen_skills.add(normalized_name)

            confirmed_skills.append({
                "name": name,
                "taxonomy_category": (
                    skill.taxonomy_category or "General"
                ),
                "evidence_snippet": (
                    skill.evidence_snippet or ""
                ),
            })

        if not confirmed_skills:
            raise HTTPException(
                status_code=400,
                detail="No valid skills were provided."
            )

        # Persist employee-approved skills.
        # This also updates employee confirmation flags
        # and writes the database audit event.
        await run_in_threadpool(
            save_confirmed_skills,
            employee_id,
            confirmed_skills
        )

        return SkillConfirmResponse(
            employee_id=employee_id,
            status="CONFIRMED_READY_FOR_MATCHING",
            confirmed_count=len(confirmed_skills),
            ready_for_matching=True,
            confirmed_skills=confirmed_skills,
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

        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve audit logs."
        )
