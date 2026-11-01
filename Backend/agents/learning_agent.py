# Backend/agents/learning_agent.py
import json
from pathlib import Path
from typing import List, Dict, Any
from pydantic import BaseModel
from utils.audit_logger import log_audit_event

COURSES_FILE = Path(__file__).resolve().parent.parent / "data" / "courses.json"

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

def run_learning_pathway(employee_id: str, session_record: Dict[str, Any]) -> LearningPathwayResponse:
    """
    F6: Learning Pathway Agent. Identifies skill gaps for a target role
    and suggests courses with direct SAP Learning Hub URL links.
    """
    try:
        with open(COURSES_FILE, "r", encoding="utf-8") as f:
            courses_data = json.load(f)
    except FileNotFoundError:
        courses_data = []

    # Pull skill gaps from the top matched role stored in SESSION_STORE
    role_matches = session_record.get("role_matches", {}).get("recommended_roles", [])
    target_role_title = "AI & Backend Solutions Engineer (SAP BTP)"
    skill_gaps = ["SAP BTP", "Cloud Foundry", "Machine Learning"]

    if role_matches:
        top_role = role_matches[0]
        target_role_title = top_role.get("title", target_role_title)
        missing = top_role.get("missing_skills", [])
        if missing:
            skill_gaps = missing

    recommended_courses: List[CourseRecommendation] = []
    matched_gaps = set()

    for course in courses_data:
        if course["target_skill"] in skill_gaps or len(recommended_courses) < 4:
            if course["course_id"] not in [c.course_id for c in recommended_courses]:
                recommended_courses.append(
                    CourseRecommendation(
                        course_id=course["course_id"],
                        title=course["title"],
                        target_skill=course["target_skill"],
                        duration=course["duration"],
                        sap_learning_hub_url=course["sap_learning_hub_url"]
                    )
                )
                matched_gaps.add(course["target_skill"])

    summary = (
        f"Generated targeted learning pathway for '{target_role_title}' addressing "
        f"skill gaps in {', '.join(list(matched_gaps) or skill_gaps)}. "
        f"All courses include direct SAP Learning Hub links."
    )

    log_audit_event(
        session_id=employee_id,
        actor="Learning Pathway Agent",
        action="generate_learning_pathway",
        input_summary=f"Target role: {target_role_title}, Gaps: {skill_gaps}",
        output_summary=f"Recommended {len(recommended_courses)} SAP Learning Hub courses"
    )

    return LearningPathwayResponse(
        employee_id=employee_id,
        target_role=target_role_title,
        skill_gaps_addressed=list(matched_gaps) or skill_gaps,
        recommended_courses=recommended_courses,
        pathway_summary=summary
    )