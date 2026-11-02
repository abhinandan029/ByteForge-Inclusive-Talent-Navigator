import json
from pathlib import Path
import sys

from mcp.server.fastmcp import FastMCP

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from agents.bias_agent import _run_bias_audit_core


mcp = FastMCP("bias-review-server")


@mcp.tool()
def run_bias_audit(
    matching_results_json: str,
    job_roles_json: str,
) -> str:
    """Analyze matching results and role criteria for HR review indicators."""
    try:
        matching_results = json.loads(matching_results_json)
        job_roles = json.loads(job_roles_json)
    except json.JSONDecodeError as exc:
        raise ValueError("Invalid JSON input for bias review.") from exc

    if not isinstance(matching_results, list) or not isinstance(job_roles, list):
        raise ValueError("Bias review expects matching-result and role lists.")

    result = _run_bias_audit_core(
        matching_results,
        job_roles,
    )
    return json.dumps({
        "schema_version": "1.0",
        "tool": "run_bias_audit",
        **result,
    })


if __name__ == "__main__":
    mcp.run(transport="stdio")
