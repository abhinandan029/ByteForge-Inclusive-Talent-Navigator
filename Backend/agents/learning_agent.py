# Backend/agents/learning_agent.py
import json
import asyncio
from pathlib import Path
import sys
from typing import List, Dict, Any
from pydantic import BaseModel
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

class CourseRecommendation(BaseModel):
    course_id: str
    title: str
    target_skill: str
    duration: str
    sap_learning_hub_url: str

class LearningPathwayResponse(BaseModel):
    employee_id: str
    pathway_status: str = "LEARNING_PATHWAY_GENERATED"
    target_role: str
    skill_gaps_addressed: List[str]
    recommended_courses: List[CourseRecommendation]
    pathway_summary: str

async def _run_learning_mcp(
    employee_id: str,
    session_record: Dict[str, Any],
) -> LearningPathwayResponse:
    server_script = (
        Path(__file__).resolve().parents[1]
        / "mcp_server"
        / "learning_mcp_server.py"
    )
    params = StdioServerParameters(
        command=sys.executable,
        args=[str(server_script)],
        env=None,
    )

    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            response = await session.call_tool(
                "generate_learning_pathway",
                arguments={
                    "employee_id": employee_id,
                    "session_record_json": json.dumps(session_record),
                },
            )

            if response.isError or not response.content:
                raise RuntimeError("MCP learning pathway tool failed.")

            payload = json.loads(response.content[0].text)
            if not isinstance(payload, dict):
                raise ValueError("MCP learning pathway returned invalid data.")

            return LearningPathwayResponse.model_validate(payload)


def run_learning_pathway(
    employee_id: str,
    session_record: Dict[str, Any],
) -> LearningPathwayResponse:
    """Run Career Development through the Learning MCP server."""
    return asyncio.run(_run_learning_mcp(employee_id, session_record))