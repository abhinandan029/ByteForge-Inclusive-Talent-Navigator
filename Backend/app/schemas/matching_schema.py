
from typing import Optional
from pydantic import BaseModel, Field


# ==========================================
# MATCHING REQUEST SCHEMAS
# ==========================================

class RunMatchingRequest(BaseModel):
    """
    Optional filters:
    - employee_ids: Run matching for selected eligible employees.
    - job_role_ids: Run matching against selected active job roles.

    If omitted, all eligible employees and active job roles are considered.
    """

    employee_ids: Optional[list[str]] = None
    job_role_ids: Optional[list[str]] = None


# ==========================================
# MATCH DETAIL SCHEMAS
# ==========================================

class MatchedSkill(BaseModel):
    skill_name: str
    taxonomy_category: Optional[str] = None
    weight: float


class MissingSkill(BaseModel):
    skill_name: str
    taxonomy_category: Optional[str] = None
    required_proficiency: Optional[str] = None
    is_mandatory: bool
    weight: float


# ==========================================
# INDIVIDUAL MATCH RESULT
# ==========================================

class MatchingResultItem(BaseModel):
    match_id: str

    employee_id: str
    employee_name: Optional[str] = None
    current_role: Optional[str] = None
    years_experience: Optional[float] = None

    job_role_id: str
    job_title: str
    department: Optional[str] = None

    match_score: float
    match_status: str

    matched_skills: list[MatchedSkill] = Field(default_factory=list)
    missing_skills: list[MissingSkill] = Field(default_factory=list)

    missing_mandatory_skills: list[str] = Field(default_factory=list)
    experience_warning: Optional[str] = None

    match_explanation: Optional[str] = None


# ==========================================
# MATCHING API RESPONSE SCHEMAS
# ==========================================

class RunMatchingResponse(BaseModel):
    message: str
    total_employees_processed: int
    total_job_roles_processed: int
    total_matches_generated: int
    results: list[MatchingResultItem] = Field(default_factory=list)


class MatchingResultsResponse(BaseModel):
    message: str
    total_results: int
    results: list[MatchingResultItem] = Field(default_factory=list)
