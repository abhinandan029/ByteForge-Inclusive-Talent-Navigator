# Backend/agents/market_agent.py
import json
import asyncio
from pathlib import Path
import sys
from typing import List, Dict, Any
from pydantic import BaseModel
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

class SkillDemandItem(BaseModel):
    skill: str
    user_level: str
    demand_level: str
    trend: str
    open_internal_roles: int
    market_note: str

class MarketIntelligenceResponse(BaseModel):
    employee_id: str
    data_label: str = "SIMULATED_MARKET_DATA"
    is_simulated: bool = True
    how_this_was_produced: str = (
        "Market Intelligence Agent matched confirmed employee skills against the "
        "simulated internal & industry demand dataset."
    )
    in_demand_skills: List[SkillDemandItem]
    high_demand_count: int
    summary_insight: str

async def _run_market_mcp(
    employee_id: str,
    session_record: Dict[str, Any],
) -> MarketIntelligenceResponse:
    server_script = (
        Path(__file__).resolve().parents[1]
        / "mcp_server"
        / "market_mcp_server.py"
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
                "analyze_market_demand",
                arguments={
                    "employee_id": employee_id,
                    "session_record_json": json.dumps(session_record),
                },
            )

            if response.isError or not response.content:
                raise RuntimeError("MCP market intelligence tool failed.")

            payload = json.loads(response.content[0].text)
            if not isinstance(payload, dict):
                raise ValueError("MCP market intelligence returned invalid data.")

            return MarketIntelligenceResponse.model_validate(payload)


def run_market_intelligence(
    employee_id: str,
    session_record: Dict[str, Any],
) -> MarketIntelligenceResponse:
    """Run Market Intelligence through the Market MCP server."""
    return asyncio.run(_run_market_mcp(employee_id, session_record))