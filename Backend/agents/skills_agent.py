
import sys
import json
from typing import List, Dict, Any

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


class SkillsDiscoveryAgent:
    """
    Orchestrates the Skills Discovery flow via the MCP skills-server.

    Audit events are stored in the database through the skills model.
    This agent does not maintain a separate local audit file.
    """

    def __init__(self, server_script: str = "skills_mcp_server.py"):
        self.server_params = StdioServerParameters(
            command=sys.executable,
            args=[server_script],
            env=None
        )

    async def discover_skills(
        self,
        employee_id: str,
        profile_text: str,
        taxonomy_rows: List[Dict[str, Any]] | None = None,
    ) -> Dict[str, Any]:

        if not profile_text or not profile_text.strip():
            raise ValueError("Profile text cannot be empty.")

        taxonomy_rows = taxonomy_rows or []

        # Connect to skills-server through MCP stdio.
        async with stdio_client(self.server_params) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()

                # Step 1: Extract raw skills.
                extract_res = await session.call_tool(
                    "extract_skills_tool",
                    arguments={
                        "text": profile_text,
                        "taxonomy_json": json.dumps(taxonomy_rows),
                    }
                )

                if extract_res.isError:
                    raise RuntimeError(
                        "MCP extract_skills tool execution failed."
                    )

                if not extract_res.content:
                    raise RuntimeError(
                        "MCP extraction returned an empty response."
                    )

                extract_payload = json.loads(
                    extract_res.content[0].text
                )

                extracted_items = extract_payload.get(
                    "extracted_items",
                    []
                )

                if not isinstance(extracted_items, list):
                    raise ValueError(
                        "MCP extraction returned an invalid skills list."
                    )

                # Step 2: Normalize extracted skills.
                raw_items_str = json.dumps(extracted_items)

                norm_res = await session.call_tool(
                    "normalize_skills",
                    arguments={
                        "raw_skills_json": raw_items_str,
                        "taxonomy_json": json.dumps(taxonomy_rows),
                    }
                )

                if norm_res.isError:
                    raise RuntimeError(
                        "MCP normalize_skills tool execution failed."
                    )

                if not norm_res.content:
                    raise RuntimeError(
                        "MCP normalization returned an empty response."
                    )

                norm_payload = json.loads(
                    norm_res.content[0].text
                )

                normalized_skills = norm_payload.get(
                    "normalized_skills",
                    []
                )

                if not isinstance(normalized_skills, list):
                    raise ValueError(
                        "MCP normalization returned an invalid skills list."
                    )

        return {
            "employee_id": employee_id,
            "status": "PENDING_EMPLOYEE_CONFIRMATION",
            "data_label": "SIMULATED_SYNTHETIC_DATA",
            "llm_mode": extract_payload.get("mode"),
            "is_fallback": extract_payload.get("is_fallback"),
            "proposed_skills": normalized_skills,
            "message": (
                "Skills extracted. Employee must review, edit, "
                "and confirm before matching can proceed."
            )
        }

    async def confirm_employee_skills(
        self,
        employee_id: str,
        employee_name: str,
        accepted_skills: List[Dict[str, Any]],
        added_raw_skills: List[str],
        removed_skill_ids: List[str],
        taxonomy_rows: List[Dict[str, Any]] | None = None,
    ) -> Dict[str, Any]:
        """
        Processes the employee's final skill selection.

        Already extracted skills are retained.
        Manually added skills are normalized through MCP.
        Rejected skills are excluded.

        Database audit logging is handled by skills_model.py.
        """

        taxonomy_rows = taxonomy_rows or []

        # Remove rejected skills from accepted suggestions.
        final_skills = [
            skill
            for skill in accepted_skills
            if skill.get("skill_id") not in removed_skill_ids
        ]

        # Normalize manually added skills using MCP.
        if added_raw_skills:

            new_items_payload = [
                {
                    "raw_skill": skill_name,
                    "evidence": (
                        "Self-reported and confirmed by employee"
                    )
                }
                for skill_name in added_raw_skills
            ]

            async with stdio_client(self.server_params) as (read, write):
                async with ClientSession(read, write) as session:
                    await session.initialize()

                    norm_res = await session.call_tool(
                        "normalize_skills",
                        arguments={
                            "raw_skills_json": json.dumps(new_items_payload),
                            "taxonomy_json": json.dumps(taxonomy_rows),
                        }
                    )

                    if norm_res.isError:
                        raise RuntimeError(
                            "MCP normalization of employee-added "
                            "skills failed."
                        )

                    if not norm_res.content:
                        raise RuntimeError(
                            "MCP returned an empty normalization response."
                        )

                    norm_payload = json.loads(
                        norm_res.content[0].text
                    )

                    newly_normalized = norm_payload.get(
                        "normalized_skills",
                        []
                    )

                    if not isinstance(newly_normalized, list):
                        raise ValueError(
                            "Invalid normalized skills response."
                        )

                    final_skills.extend(newly_normalized)

        # No local JSON audit file is written.
        # The controller persists the final selection and audit
        # event through the database model.

        return {
            "employee_id": employee_id,
            "status": "CONFIRMATION_PROCESSED",
            "confirmed_skills": final_skills
        }
