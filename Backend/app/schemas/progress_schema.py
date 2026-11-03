from datetime import date
from pydantic import BaseModel, Field


class ProjectCreateRequest(BaseModel):
    project_name: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1, max_length=2000)
    skills_used: list[str] = Field(default_factory=list)
    outcome: str | None = Field(default=None, max_length=1000)
    started_at: date | None = None
    completed_at: date | None = None


class CareerGoalsRequest(BaseModel):
    target_role: str | None = Field(default=None, max_length=255)
    preferred_department: str | None = Field(default=None, max_length=255)


class ManagerValidationRequest(BaseModel):
    validated: bool
    note: str | None = Field(default=None, max_length=1000)
