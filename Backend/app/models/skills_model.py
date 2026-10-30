from pydantic import BaseModel, Field
from typing import List, Optional

class ProfileExtractRequest(BaseModel):
    employee_id: str = Field(
        default="emp-ananya",
        description="Synthetic employee identifier"
    )
    profile_text: str = Field(
        ...,
        description="Free-text profile for Ananya (FR-1)",
        json_schema_extra={
            "example": (
                "Ananya Rao, 28, Software Engineer returning from a 14-month caregiving break. "
                "Previously built microservices in Python and FastAPI, deployed containerized apps "
                "on Docker, and optimized PostgreSQL queries. Recently completed a cloud course on SAP BTP."
            )
        }
    )

class SkillItem(BaseModel):
    skill_id: str = Field(..., json_schema_extra={"example": "sk-101"})
    name: str = Field(..., json_schema_extra={"example": "Python"})
    taxonomy_category: str = Field(..., json_schema_extra={"example": "Backend Development"})
    evidence_snippet: str = Field(
        ...,
        description="Snippet from profile text proving the skill (FR-2)",
        json_schema_extra={"example": "built microservices in Python and FastAPI"}
    )

class ProfileExtractResponse(BaseModel):
    employee_id: str
    status: str
    extracted_skills: List[SkillItem]
    simulated_data_notice: str = "Simulated Data - Local Fallback Active (R8)"

class SkillConfirmationItem(BaseModel):
    name: str = Field(..., json_schema_extra={"example": "Python"})
    taxonomy_category: str = Field(default="General", json_schema_extra={"example": "Backend Development"})
    evidence_snippet: Optional[str] = Field(
        default="Confirmed/Added by employee",
        json_schema_extra={"example": "built microservices in Python and FastAPI"}
    )

class SkillConfirmRequest(BaseModel):
    employee_id: str = Field(default="emp-ananya")
    confirmed_skills: List[SkillConfirmationItem] = Field(
        ...,
        description="Final list after Ananya accepts, removes, or adds skills (FR-3, R1)",
        json_schema_extra={
            "example": [
                {
                    "name": "Python",
                    "taxonomy_category": "Backend Development",
                    "evidence_snippet": "built microservices in Python and FastAPI"
                },
                {
                    "name": "FastAPI",
                    "taxonomy_category": "Backend Frameworks",
                    "evidence_snippet": "built microservices in Python and FastAPI"
                },
                {
                    "name": "SAP BTP",
                    "taxonomy_category": "Cloud Platform",
                    "evidence_snippet": "completed a cloud course on SAP BTP"
                },
                {
                    "name": "Git",
                    "taxonomy_category": "Version Control",
                    "evidence_snippet": "Added manually by Ananya during confirmation"
                }
            ]
        }
    )

class SkillConfirmResponse(BaseModel):
    employee_id: str
    status: str
    confirmed_count: int
    ready_for_matching: bool
    confirmed_skills: List[SkillConfirmationItem]

class EmployeeSkillsStateResponse(BaseModel):
    employee_id: str
    is_confirmed: bool
    extracted_skills_draft: List[SkillItem]
    confirmed_skills_final: List[SkillConfirmationItem]