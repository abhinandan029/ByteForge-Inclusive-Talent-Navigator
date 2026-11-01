# Backend/agents/market_agent.py
import json
from pathlib import Path
from typing import List, Dict, Any
from pydantic import BaseModel
from utils.audit_logger import log_audit_event

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "market_demand.json"

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

def run_market_intelligence(employee_id: str, session_record: Dict[str, Any]) -> MarketIntelligenceResponse:
    """F3: Compare confirmed skills against a simulated demand dataset."""
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            market_data = json.load(f)
    except FileNotFoundError:
        market_data = []

    market_lookup = {item["skill"].lower(): item for item in market_data}

    # Safely extract the confirmed skills list from whatever key skills_agent.py uses
    raw_skills = (
        session_record.get("confirmed_skills")
        or session_record.get("final_skills")
        or session_record.get("accepted_skills")
        or session_record.get("skills")
        or []
    )

    matched_demand: List[SkillDemandItem] = []

    for s in raw_skills:
        if isinstance(s, str):
            skill_name = s
            skill_level = "Intermediate"
        elif isinstance(s, dict):
            skill_name = (
                s.get("name")
                or s.get("skill_name")
                or s.get("normalized_name")
                or s.get("skill")
                or "Unknown Skill"
            )
            skill_level = s.get("level") or s.get("proficiency") or "Intermediate"
        else:
            continue

        key = skill_name.lower()
        if key in market_lookup:
            m = market_lookup[key]
            matched_demand.append(
                SkillDemandItem(
                    skill=skill_name,
                    user_level=skill_level,
                    demand_level=m["demand_level"],
                    trend=m["trend"],
                    open_internal_roles=m["open_internal_roles"],
                    market_note=m["market_note"]
                )
            )
        else:
            matched_demand.append(
                SkillDemandItem(
                    skill=skill_name,
                    user_level=skill_level,
                    demand_level="Medium",
                    trend="Stable (+8% YoY)",
                    open_internal_roles=2,
                    market_note="Steady internal demand across engineering teams."
                )
            )

    high_demand_count = sum(1 for item in matched_demand if item.demand_level == "High")
    skill_names = [item.skill for item in matched_demand]

    summary_insight = (
        f"{high_demand_count} of your {len(matched_demand)} confirmed skills are in High demand "
        f"internally, led by {', '.join(skill_names[:3]) if skill_names else 'core technical skills'}."
    )

    log_audit_event(
        session_id=employee_id,
        actor="Market Intelligence Agent",
        action="analyze_market_demand",
        input_summary=f"Confirmed skills: {', '.join(skill_names)}",
        output_summary=f"Matched {len(matched_demand)} skills ({high_demand_count} High demand)"
    )

    return MarketIntelligenceResponse(
        employee_id=employee_id,
        in_demand_skills=matched_demand,
        high_demand_count=high_demand_count,
        summary_insight=summary_insight
    )