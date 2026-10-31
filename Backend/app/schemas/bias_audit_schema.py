
from typing import Optional
from datetime import datetime

from pydantic import BaseModel, Field


# --------------------------------------------------
# BIAS AUDIT FLAG SCHEMAS
# --------------------------------------------------

class BiasAuditFlagItem(BaseModel):
    flag_id: str
    job_role_id: str
    match_id: Optional[str] = None

    flag_type: str
    severity: str

    description: str
    recommendation: Optional[str] = None

    review_status: str
    reviewed_by_hr: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    review_comments: Optional[str] = None

    created_at: Optional[datetime] = None

    employee_id: Optional[str] = None
    employee_name: Optional[str] = None
    job_title: Optional[str] = None
    match_score: Optional[float] = None


class BiasAuditFlagsResponse(BaseModel):
    message: str
    total_flags: int
    flags: list[BiasAuditFlagItem] = Field(default_factory=list)


class BiasAuditFlagDetailResponse(BaseModel):
    message: str
    flag: BiasAuditFlagItem


# --------------------------------------------------
# HR FLAG REVIEW SCHEMAS
# --------------------------------------------------

class ReviewBiasFlagRequest(BaseModel):
    review_status: str = Field(
        ...,
        description="Must be concerning or not_concerning"
    )

    review_comments: Optional[str] = None


class ReviewBiasFlagResponse(BaseModel):
    message: str
    flag: BiasAuditFlagItem


# --------------------------------------------------
# HR MATCH DECISION SCHEMAS
# --------------------------------------------------

class HRMatchDecisionRequest(BaseModel):
    decision: str = Field(
        ...,
        description="HR decision for the matching result"
    )

    comments: Optional[str] = None
    override_reason: Optional[str] = None


class HRMatchDecisionItem(BaseModel):
    decision_id: str
    match_id: str
    hr_id: str

    decision: str
    comments: Optional[str] = None
    override_reason: Optional[str] = None

    created_at: Optional[datetime] = None


class HRMatchDecisionsResponse(BaseModel):
    message: str
    total_decisions: int
    decisions: list[HRMatchDecisionItem] = Field(default_factory=list)
