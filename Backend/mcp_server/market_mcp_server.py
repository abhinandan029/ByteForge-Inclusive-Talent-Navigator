import json
import re
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("market-intelligence-server")


def _skill_key(value):
    return re.sub(r"[^a-z0-9]+", " ", str(value or "").lower()).strip()


@mcp.tool()
def analyze_market_demand(employee_id: str, session_record_json: str) -> str:
    """Match confirmed employee skills to the simulated demand dataset."""
    try:
        session_record = json.loads(session_record_json)
    except json.JSONDecodeError as exc:
        raise ValueError("Invalid session record JSON.") from exc

    if not isinstance(session_record, dict):
        raise ValueError("Session record must be a JSON object.")

    market_data = session_record.get("market_data") or []

    lookup = {}
    for item in market_data:
        names = [item.get("skill"), *(item.get("aliases") or [])]
        for name in names:
            if name:
                lookup[_skill_key(name)] = item
    raw_skills = (
        session_record.get("confirmed_skills")
        or session_record.get("final_skills")
        or session_record.get("accepted_skills")
        or session_record.get("skills")
        or []
    )
    matched = []
    for skill in raw_skills:
        if isinstance(skill, str):
            name, level = skill, "Intermediate"
        elif isinstance(skill, dict):
            name = (
                skill.get("name")
                or skill.get("skill_name")
                or skill.get("normalized_name")
                or skill.get("skill")
                or "Unknown Skill"
            )
            level = skill.get("level") or skill.get("proficiency") or "Intermediate"
        else:
            continue

        item = lookup.get(_skill_key(name), {
            "demand_level": "Medium",
            "trend": "Stable (+8% YoY)",
            "open_internal_roles": 2,
            "market_note": "Steady internal demand across engineering teams.",
            "source": "SIMULATED_MARKET_DATA",
        })
        matched.append({
            "skill": name,
            "user_level": level,
            "demand_level": item.get("demand_level", "Medium"),
            "trend": item.get("trend", "Stable (+8% YoY)"),
            "open_internal_roles": item.get("open_internal_roles", 2),
            "market_note": item.get(
                "market_note",
                "Steady internal demand across engineering teams.",
            ),
            "source": item.get("source", "SIMULATED_MARKET_DATA"),
            "role_titles": item.get("role_titles", []),
        })

    high_count = sum(item["demand_level"] == "High" for item in matched)
    names = [item["skill"] for item in matched]
    has_live_data = any(
        item["source"] == "ACTIVE_INTERNAL_ROLES"
        for item in matched
    )
    return json.dumps({
        "employee_id": employee_id,
        "data_label": (
            "LIVE_INTERNAL_ROLE_DEMAND"
            if has_live_data
            else "SIMULATED_MARKET_DATA"
        ),
        "is_simulated": not has_live_data,
        "how_this_was_produced": (
            "Matched confirmed skills against active internal job-role "
            "requirements."
            if has_live_data
            else "No active role requirements matched these skills; "
            "simulated market demand data was used."
        ),
        "in_demand_skills": matched,
        "high_demand_count": high_count,
        "summary_insight": (
            f"{high_count} of your {len(matched)} confirmed skills are in High demand "
            f"across active internal roles, led by "
            f"{', '.join(names[:3]) if names else 'core technical skills'}."
        ),
    })


if __name__ == "__main__":
    mcp.run(transport="stdio")
