# Backend/agents/bias_agent.py
import json
from pathlib import Path
from typing import List, Dict, Any
from pydantic import BaseModel
from utils.audit_logger import log_audit_event

ROLES_FILE = Path(__file__).resolve().parent.parent / "data" / "roles.json"

class BiasFlagItem(BaseModel):
    role_id: str
    role_title: str
    flagged_criterion: str
    bias_category: str
    severity: str  # "high", "medium", "low"
    explanation: str
    inclusive_rewrite: str

class BiasAuditResponse(BaseModel):
    employee_id: str
    audit_status: str = "BIAS_FLAGS_DETECTED_FOR_HR_REVIEW"
    total_roles_audited: int
    total_flags_raised: int
    flags: List[BiasFlagItem]
    hr_summary_recommendation: str

# Exclusionary patterns targeting career returners and non-linear career paths
BIAS_RULES = [
    {
        "keywords": ["uninterrupted", "continuous recent", "continuous tenure"],
        "category": "Career Break / Continuity Penalty",
        "severity": "high",
        "explanation": (
            "Requiring uninterrupted or continuous recent tenure directly penalizes "
            "caregivers and career returners like Ananya without measuring actual technical competency."
        ),
        "inclusive_rewrite": (
            "5+ years of cumulative hands-on software engineering experience or equivalent demonstrated proficiency."
        ),
    },
    {
        "keywords": ["no career gaps", "currently employed"],
        "category": "Employment Status Exclusion",
        "severity": "high",
        "explanation": (
            "Filtering out candidates with career gaps excludes qualified returners who have "
            "maintained or upskilled their capabilities during a break."
        ),
        "inclusive_rewrite": (
            "Proven track record of delivering production database schemas and data pipelines, regardless of recent career breaks."
        ),
    },
    {
        "keywords": ["recent grad", "graduated within"],
        "category": "Age / Recency Proxy Bias",
        "severity": "medium",
        "explanation": (
            "Restricting eligibility by graduation recency acts as an age proxy and blocks "
            "experienced mid-career returners pivoting into MLOps."
        ),
        "inclusive_rewrite": (
            "Foundational applied experience or certification in Machine Learning and containerization."
        ),
    },
]

def run_bias_audit(employee_id: str, session_record: Dict[str, Any]) -> BiasAuditResponse:
    """
    F5: Scans matched role criteria and flags exclusionary or unjustified requirements
    with reasons and severity levels (low, medium, high) for HR review.
    """
    # Pull matched roles from session if available; otherwise fall back to roles.json
    role_matches_data = session_record.get("role_matches", {})
    roles_to_audit = role_matches_data.get("recommended_roles", [])

    if not roles_to_audit:
        try:
            with open(ROLES_FILE, "r", encoding="utf-8") as f:
                roles_to_audit = json.load(f)
        except FileNotFoundError:
            roles_to_audit = []

    flags: List[BiasFlagItem] = []

    for role in roles_to_audit:
        role_id = role.get("role_id", "UNKNOWN_ROLE")
        role_title = role.get("title", "Internal Role")
        criteria_list = role.get("raw_criteria", [])

        for criterion in criteria_list:
            crit_lower = criterion.lower()
            for rule in BIAS_RULES:
                if any(kw in crit_lower for kw in rule["keywords"]):
                    flags.append(
                        BiasFlagItem(
                            role_id=role_id,
                            role_title=role_title,
                            flagged_criterion=criterion,
                            bias_category=rule["category"],
                            severity=rule["severity"],
                            explanation=rule["explanation"],
                            inclusive_rewrite=rule["inclusive_rewrite"]
                        )
                    )
                    break

    high_count = sum(1 for f in flags if f.severity == "high")

    hr_summary = (
        f"Bias Audit Agent scanned {len(roles_to_audit)} matched roles and raised {len(flags)} "
        f"exclusionary flags ({high_count} High severity). Recommend HR persona (Rahul) replace "
        f"continuity-based filters with skills-first criteria before final evaluation."
    )

    log_audit_event(
        session_id=employee_id,
        actor="Bias Audit Agent",
        action="audit_role_criteria_for_bias",
        input_summary=f"Audited {len(roles_to_audit)} matched roles",
        output_summary=f"Raised {len(flags)} bias flags ({high_count} high severity)"
    )

    return BiasAuditResponse(
        employee_id=employee_id,
        total_roles_audited=len(roles_to_audit),
        total_flags_raised=len(flags),
        flags=flags,
        hr_summary_recommendation=hr_summary
    )