import json
from pathlib import Path
import sys

from mcp.server.fastmcp import FastMCP

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from agents.matching_agent import _run_inclusive_matching_core


mcp = FastMCP("matching-server")


@mcp.tool()
def run_matching(
    employees_json: str,
    job_roles_json: str,
    job_requirements_json: str,
    employee_skills_json: str,
) -> str:
    """Calculate inclusive employee-to-role matching results."""
    try:
        employees = json.loads(employees_json)
        job_roles = json.loads(job_roles_json)
        job_requirements = json.loads(job_requirements_json)
        employee_skills = json.loads(employee_skills_json)
    except json.JSONDecodeError as exc:
        raise ValueError("Invalid JSON input for matching.") from exc

    if not isinstance(employees, list) or not isinstance(job_roles, list):
        raise ValueError("Matching expects employee and role lists.")

    results = _run_inclusive_matching_core(
        employees,
        job_roles,
        job_requirements,
        employee_skills,
    )
    return json.dumps({
        "schema_version": "1.0",
        "tool": "run_matching",
        "results": results,
    })


if __name__ == "__main__":
    mcp.run(transport="stdio")
