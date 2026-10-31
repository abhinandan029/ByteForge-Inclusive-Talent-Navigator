from pydantic import BaseModel, Field, EmailStr


class HRLoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


class HRLoginResponse(BaseModel):
    message: str
    hr: dict


class HRProfileResponse(BaseModel):
    hr_id: str
    full_name: str
    email: str
    department: str | None = None

class HRDashboardStats(BaseModel):
    total_employees: int
    employees_ready_for_matching: int
    active_job_roles: int
    total_matches: int
    pending_bias_reviews: int


class HRDashboardResponse(BaseModel):
    message: str
    stats: HRDashboardStats