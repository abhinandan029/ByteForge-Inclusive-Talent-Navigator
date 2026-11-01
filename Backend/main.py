# main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from agents.skills_agent import SkillsDiscoveryAgent, get_audit_trail
from agents.market_agent import MarketIntelligenceResponse, run_market_intelligence
from agents.matching_agent import InclusiveMatchingResponse, run_inclusive_matching
from agents.bias_agent import BiasAuditResponse, run_bias_audit
from agents.learning_agent import LearningPathwayResponse, run_learning_pathway
from utils.audit_logger import read_audit_events
from utils.llm_provider import ANANYA_SYNTHETIC_PROFILE

app = FastAPI(
    title="Inclusive Talent Navigator - Skills Discovery API",
    version="0.1.0"
)

agent = SkillsDiscoveryAgent()

# In-memory store for prototype session state
SESSION_STORE: Dict[str, Dict[str, Any]] = {}

class ProfileSubmissionRequest(BaseModel):
    employee_id: str = Field(default="EMP_ANANYA_01")
    profile_text: str = Field(default=ANANYA_SYNTHETIC_PROFILE)

class SkillConfirmationRequest(BaseModel):
    employee_id: str = Field(default="EMP_ANANYA_01")
    employee_name: str = Field(default="Ananya Rao")
    accepted_skills: List[Dict[str, Any]] = Field(
        description="List of skill objects retained from the discovery step"
    )
    added_raw_skills: List[str] = Field(
        default_factory=list,
        description="New skill names typed in by the employee (e.g., ['Kubernetes'])"
    )
    removed_skill_ids: List[str] = Field(
        default_factory=list,
        description="IDs of extracted skills the employee rejected"
    )

@app.get("/api/profile/default")
async def get_default_ananya_profile():
    """FR-1: Load Ananya's synthetic profile text for the demo UI."""
    return {
        "employee_id": "EMP_ANANYA_01",
        "employee_name": "Ananya Rao",
        "role": "Software Engineer (Returner)",
        "data_label": "SYNTHETIC_DATA",
        "profile_text": ANANYA_SYNTHETIC_PROFILE
    }

@app.post("/api/skills/discover")
async def run_skills_discovery(payload: ProfileSubmissionRequest):
    """FR-2: Extract and normalize skills via MCP skills-server."""
    result = await agent.discover_skills(
        employee_id=payload.employee_id,
        profile_text=payload.profile_text
    )
    SESSION_STORE[payload.employee_id] = result
    return result

@app.post("/api/skills/confirm")
async def confirm_skills(payload: SkillConfirmationRequest):
    """
    FR-3 & R1: Human-in-the-loop gate. Employee accepts, removes, or adds skills 
    before any role matching is allowed to run.
    """
    confirmation_result = await agent.confirm_employee_skills(
        employee_id=payload.employee_id,
        employee_name=payload.employee_name,
        accepted_skills=payload.accepted_skills,
        added_raw_skills=payload.added_raw_skills,
        removed_skill_ids=payload.removed_skill_ids
    )
    SESSION_STORE[payload.employee_id] = confirmation_result
    return confirmation_result

@app.get("/api/skills/status/{employee_id}")
async def get_confirmed_skills_for_matching(employee_id: str):
    """
    Guardrail endpoint for the Matching Agent: blocks matching if the employee 
    has not confirmed their skills yet.
    """
    record = SESSION_STORE.get(employee_id)
    if not record:
        raise HTTPException(status_code=404, detail="Employee session not found.")
    if record.get("status") != "CONFIRMED_READY_FOR_MATCHING":
        raise HTTPException(
            status_code=403,
            detail="Responsible AI Guardrail (R1): Skills must be confirmed by the employee before matching."
        )
    return record

@app.get("/api/market/{employee_id}", response_model=MarketIntelligenceResponse)
@app.get("/api/sessions/{employee_id}/market", response_model=MarketIntelligenceResponse)
async def get_market_intelligence(employee_id: str = "EMP_ANANYA_01"):
    """
    F3: Market Intelligence Agent. Compares confirmed skills against simulated 
    market demand data. Enforces the R1 confirmation guardrail first.
    """
    record = SESSION_STORE.get(employee_id)
    if not record:
        raise HTTPException(status_code=404, detail="Employee session not found.")
    if record.get("status") != "CONFIRMED_READY_FOR_MATCHING":
        raise HTTPException(
            status_code=403,
            detail="Responsible AI Guardrail (R1): Skills must be confirmed by the employee before viewing market intelligence."
        )
    
    market_result = run_market_intelligence(employee_id, record)
    SESSION_STORE[employee_id]["market_intelligence"] = market_result.model_dump()
    return market_result

@app.post("/api/matches/{employee_id}", response_model=InclusiveMatchingResponse)
@app.post("/api/sessions/{employee_id}/matches", response_model=InclusiveMatchingResponse)
async def get_inclusive_role_matches(employee_id: str = "EMP_ANANYA_01"):
    """
    F4: Inclusive Matching Agent. Suggests internal roles based on confirmed skills 
    and potential (0-100 score + plain-language explanation). Enforces R1 guardrail.
    """
    record = SESSION_STORE.get(employee_id)
    if not record:
        raise HTTPException(status_code=404, detail="Employee session not found.")
    if record.get("status") != "CONFIRMED_READY_FOR_MATCHING":
        raise HTTPException(
            status_code=403,
            detail="Responsible AI Guardrail (R1): Skills must be confirmed by the employee before matching roles."
        )

    matching_result = run_inclusive_matching(employee_id, record)
    SESSION_STORE[employee_id]["role_matches"] = matching_result.model_dump()
    return matching_result

@app.post("/api/bias-audit/{employee_id}", response_model=BiasAuditResponse)
@app.post("/api/sessions/{employee_id}/bias-audit", response_model=BiasAuditResponse)
async def run_role_bias_audit(employee_id: str = "EMP_ANANYA_01"):
    """
    F5: Bias Audit Agent. Scans matched role criteria and flags exclusionary 
    requirements (e.g., penalizing career breaks) with severity levels.
    """
    record = SESSION_STORE.get(employee_id)
    if not record:
        raise HTTPException(status_code=404, detail="Employee session not found.")
    if record.get("status") != "CONFIRMED_READY_FOR_MATCHING":
        raise HTTPException(
            status_code=403,
            detail="Responsible AI Guardrail (R1): Skills must be confirmed by the employee before running bias audit."
        )

    bias_result = run_bias_audit(employee_id, record)
    SESSION_STORE[employee_id]["bias_audit"] = bias_result.model_dump()
    return bias_result

@app.post("/api/learning/{employee_id}", response_model=LearningPathwayResponse)
@app.post("/api/sessions/{employee_id}/learning", response_model=LearningPathwayResponse)
async def generate_learning_pathway(employee_id: str = "EMP_ANANYA_01"):
    """
    F6: Learning Pathway Agent. Identifies skill gaps for a target role 
    and suggests SAP Learning Hub courses with direct URL links.
    """
    record = SESSION_STORE.get(employee_id)
    if not record:
        raise HTTPException(status_code=404, detail="Employee session not found.")
    if record.get("status") != "CONFIRMED_READY_FOR_MATCHING":
        raise HTTPException(
            status_code=403,
            detail="Responsible AI Guardrail (R1): Skills must be confirmed by the employee before generating learning pathways."
        )

    learning_result = run_learning_pathway(employee_id, record)
    SESSION_STORE[employee_id]["learning_pathway"] = learning_result.model_dump()
    return learning_result

@app.get("/api/audit")
@app.get("/api/audit-log")
async def view_audit_log():
    """FR-9 & S4: View every agent action, MCP tool call, and human decision."""
    combined_logs = list(get_audit_trail()) + read_audit_events()
    return {"audit_trail": combined_logs}
