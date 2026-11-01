# skills_agent.py
import sys
import json
from datetime import datetime, timezone
from typing import List, Dict, Any
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

AUDIT_LOG_FILE = "audit_log.jsonl"

def record_audit_event(actor: str, action: str, tool: str, details: Dict[str, Any]) -> Dict[str, Any]:
    """
    Records every agent action, MCP tool call, and human confirmation.
    Can be wired directly to the team's `audit-server` MCP once combined.
    """
    event = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "actor": actor,          # e.g., "SkillsDiscoveryAgent" or "Employee (Ananya Rao)"
        "action": action,        # e.g., "MCP_TOOL_CALL", "HUMAN_SKILL_CONFIRMATION"
        "tool": tool,            # e.g., "skills-server:extract_skills"
        "details": details
    }
    with open(AUDIT_LOG_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(event) + "\n")
    return event

def get_audit_trail() -> List[Dict[str, Any]]:
    """Reads the local JSONL audit store."""
    try:
        with open(AUDIT_LOG_FILE, "r", encoding="utf-8") as f:
            return [json.loads(line) for line in f if line.strip()]
    except FileNotFoundError:
        return []

class SkillsDiscoveryAgent:
    """
    Orchestrates the Skills Discovery flow via the MCP skills-server.
    Enforces Responsible AI Requirement R1: skills remain in 'PENDING_CONFIRMATION'
    until the employee explicitly approves/edits them.
    """
    def __init__(self, server_script: str = "skills_mcp_server.py"):
        self.server_params = StdioServerParameters(
            command=sys.executable,
            args=[server_script],
            env=None
        )

    async def discover_skills(self, employee_id: str, profile_text: str) -> Dict[str, Any]:
        record_audit_event(
            actor="SkillsDiscoveryAgent",
            action="START_SKILL_DISCOVERY",
            tool="orchestrator",
            details={"employee_id": employee_id, "text_length": len(profile_text)}
        )

        # Connect to skills-server via MCP stdio client
        async with stdio_client(self.server_params) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()

                # Step 1: Call MCP tool `extract_skills`
                extract_res = await session.call_tool("extract_skills", arguments={"text": profile_text})
                extract_payload = json.loads(extract_res.content[0].text)

                print("\n========== MCP EXTRACTION ==========")
                print(json.dumps(extract_payload, indent=2))
                print("====================================\n")

                record_audit_event(
                    actor="SkillsDiscoveryAgent",
                    action="MCP_TOOL_CALL",
                    tool="skills-server:extract_skills",
                    details={
                        "employee_id": employee_id,
                        "execution_mode": extract_payload["mode"],
                        "is_fallback": extract_payload["is_fallback"],
                        "extracted_count": len(extract_payload["extracted_items"])
                    }
                )

                # Step 2: Call MCP tool `normalize_skills`
                raw_items_str = json.dumps(extract_payload["extracted_items"])
                norm_res = await session.call_tool("normalize_skills", arguments={"raw_skills_json": raw_items_str})
                norm_payload = json.loads(norm_res.content[0].text)

                print("\n========== MCP NORMALIZATION =======")
                print(json.dumps(norm_payload, indent=2))
                print("====================================\n")

                record_audit_event(
                    actor="SkillsDiscoveryAgent",
                    action="MCP_TOOL_CALL",
                    tool="skills-server:normalize_skills",
                    details={
                        "employee_id": employee_id,
                        "normalized_count": len(norm_payload["normalized_skills"])
                    }
                )

        return {
            "employee_id": employee_id,
            "status": "PENDING_EMPLOYEE_CONFIRMATION",
            "data_label": "SIMULATED_SYNTHETIC_DATA",
            "llm_mode": extract_payload["mode"],
            "is_fallback": extract_payload["is_fallback"],
            "proposed_skills": norm_payload["normalized_skills"],
            "message": "Skills extracted. Employee must review, edit, and confirm before matching can proceed."
        }

    async def confirm_employee_skills(
        self,
        employee_id: str,
        employee_name: str,
        accepted_skills: List[Dict[str, Any]],
        added_raw_skills: List[str],
        removed_skill_ids: List[str]
    ) -> Dict[str, Any]:
        """
        Handles FR-3 & R1: The employee accepts, removes, or adds skills.
        Any newly added skills are normalized through the MCP server before locking the profile.
        """
        final_skills = [s for s in accepted_skills if s.get("skill_id") not in removed_skill_ids]

        # If the employee manually added skills in the UI, normalize them via MCP
        if added_raw_skills:
            new_items_payload = [
                {"raw_skill": skill_str, "evidence": "Self-reported and confirmed by employee"}
                for skill_str in added_raw_skills
            ]
            async with stdio_client(self.server_params) as (read, write):
                async with ClientSession(read, write) as session:
                    await session.initialize()
                    norm_res = await session.call_tool(
                        "normalize_skills",
                        arguments={"raw_skills_json": json.dumps(new_items_payload)}
                    )
                    newly_normalized = json.loads(norm_res.content[0].text)["normalized_skills"]
                    final_skills.extend(newly_normalized)

                    record_audit_event(
                        actor="SkillsDiscoveryAgent",
                        action="MCP_TOOL_CALL",
                        tool="skills-server:normalize_skills",
                        details={
                            "reason": "Normalize employee-added skills",
                            "added_skills": added_raw_skills
                        }
                    )

        # Log the explicit human decision (Write action triggered only after human action)
        record_audit_event(
            actor=f"Employee ({employee_name})",
            action="CONFIRM_SKILLS_LIST",
            tool="audit-server:log_event",
            details={
                "employee_id": employee_id,
                "confirmed_skill_count": len(final_skills),
                "added_by_employee": added_raw_skills,
                "removed_skill_ids": removed_skill_ids,
                "ready_for_matching": True
            }
        )

        return {
            "employee_id": employee_id,
            "status": "CONFIRMED_READY_FOR_MATCHING",
            "confirmed_skills": final_skills
        }