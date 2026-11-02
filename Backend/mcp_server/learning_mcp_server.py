import json
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("career-development-server")


@mcp.tool()
def generate_learning_pathway(
    employee_id: str,
    session_record_json: str,
) -> str:
    """Generate a learning pathway from role skill gaps and course data."""
    try:
        session_record = json.loads(session_record_json)
    except json.JSONDecodeError as exc:
        raise ValueError("Invalid session record JSON.") from exc

    if not isinstance(session_record, dict):
        raise ValueError("Session record must be a JSON object.")

    courses_data = session_record.get("courses") or []
    confirmed_skills = {
        str(skill).strip().casefold()
        for skill in session_record.get("confirmed_skills") or []
        if str(skill).strip()
    }

    role_matches = session_record.get("role_matches", {}).get(
        "recommended_roles", []
    )
    title = "AI & Backend Solutions Engineer (SAP BTP)"
    gaps = ["SAP BTP", "Cloud Foundry", "Machine Learning"]
    if role_matches:
        top_role = role_matches[0]
        title = top_role.get("title", title)
        gaps = top_role.get("missing_skills", []) or gaps

    selected = []
    matched_gaps = set()
    for course in courses_data:
        target_skill = str(course["target_skill"]).strip()
        if (
            target_skill.casefold() not in confirmed_skills
            and (target_skill in gaps or len(selected) < 4)
        ):
            if course["course_id"] not in {item["course_id"] for item in selected}:
                selected.append(course)
                matched_gaps.add(target_skill)

    if not selected:
        for course in courses_data[:4]:
            target_skill = str(course["target_skill"]).strip()
            if course["course_id"] not in {item["course_id"] for item in selected}:
                selected.append(course)
                matched_gaps.add(target_skill)

    return json.dumps({
        "employee_id": employee_id,
        "target_role": title,
        "skill_gaps_addressed": list(matched_gaps) or gaps,
        "recommended_courses": selected,
        "pathway_summary": (
            f"Generated targeted learning pathway for '{title}' addressing "
            f"skill gaps in {', '.join(list(matched_gaps) or gaps)}. "
            "All courses include direct SAP Learning Hub links."
        ),
    })


if __name__ == "__main__":
    mcp.run(transport="stdio")
