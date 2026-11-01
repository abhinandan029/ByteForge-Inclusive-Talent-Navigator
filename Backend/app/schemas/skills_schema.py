
from pydantic import BaseModel, Field
from typing import Optional


# =====================================================
# EXTRACT SKILLS
# =====================================================

class ProfileExtractRequest(BaseModel):
    employee_id: str


class SkillItem(BaseModel):
    skill_id: str
    name: str
    taxonomy_category: str = "General"
    evidence_snippet: Optional[str] = None


class ProfileExtractResponse(BaseModel):
    employee_id: str
    status: str
    extracted_skills: list[SkillItem]
    simulated_data_notice: Optional[str] = None


# =====================================================
# CONFIRM SKILLS
# =====================================================

class SkillConfirmationItem(BaseModel):
    name: str
    taxonomy_category: str = "General"
    evidence_snippet: Optional[str] = None


class SkillConfirmRequest(BaseModel):
    employee_id: str

    # Allows an employee to reject every pending suggestion.
    confirmed_skills: list[SkillConfirmationItem] = Field(
        default_factory=list
    )


class SkillConfirmResponse(BaseModel):
    employee_id: str
    status: str
    confirmed_count: int
    ready_for_matching: bool
    confirmed_skills: list[SkillConfirmationItem]


# =====================================================
# EMPLOYEE PROFILE
# =====================================================

class EmployeeProfileResponse(BaseModel):
    employee_id: str
    full_name: str
    current_role: Optional[str] = None
    grade: Optional[str] = None
    years_experience: Optional[int] = None
    has_career_break: bool = False
    is_confirmed: bool = False
    ready_for_matching: bool = False


# =====================================================
# EMPLOYEE SKILLS STATE
# =====================================================

class EmployeeSkillsStateResponse(BaseModel):
    employee_id: str
    employee: EmployeeProfileResponse
    is_confirmed: bool
    extracted_skills_draft: list[SkillItem]
    confirmed_skills_final: list[SkillConfirmationItem]
