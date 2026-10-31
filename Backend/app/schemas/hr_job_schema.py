from pydantic import BaseModel, Field
from typing import Literal


class JobSkillRequest(BaseModel):
    skill_name: str = Field(min_length=1, max_length=100)
    taxonomy_category: str | None = Field(
        default="General",
        max_length=100
    )
    required_proficiency: str | None = Field(
        default=None,
        max_length=30
    )
    is_mandatory: bool = True
    weight: float = Field(default=1.0, gt=0, le=100)


class CreateJobRoleRequest(BaseModel):
    title: str = Field(min_length=2, max_length=150)
    department: str | None = Field(default=None, max_length=100)
    description: str | None = None

    experience_min: float | None = Field(default=None, ge=0, le=99)
    experience_max: float | None = Field(default=None, ge=0, le=99)

    required_skills: list[JobSkillRequest] = Field(default_factory=list)


class UpdateJobRoleRequest(BaseModel):
    title: str = Field(min_length=2, max_length=150)
    department: str | None = Field(default=None, max_length=100)
    description: str | None = None

    experience_min: float | None = Field(default=None, ge=0, le=99)
    experience_max: float | None = Field(default=None, ge=0, le=99)


class AddJobSkillsRequest(BaseModel):
    skills: list[JobSkillRequest] = Field(min_length=1)


class UpdateJobRoleStatusRequest(BaseModel):
    status: Literal["active", "inactive"]