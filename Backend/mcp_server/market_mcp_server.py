import json
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("market-intelligence-server")


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

    lookup = {item["skill"].lower(): item for item in market_data}
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

        item = lookup.get(name.lower(), {
            "demand_level": "Medium",
            "trend": "Stable (+8% YoY)",
            "open_internal_roles": 2,
            "market_note": "Steady internal demand across engineering teams.",
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
        })

    high_count = sum(item["demand_level"] == "High" for item in matched)
    names = [item["skill"] for item in matched]
    return json.dumps({
        "employee_id": employee_id,
        "in_demand_skills": matched,
        "high_demand_count": high_count,
        "summary_insight": (
            f"{high_count} of your {len(matched)} confirmed skills are in High demand "
            f"internally, led by {', '.join(names[:3]) if names else 'core technical skills'}."
        ),
    })


if __name__ == "__main__":
    mcp.run(transport="stdio")
