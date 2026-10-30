from pydantic import BaseModel, Field


class EmployeeLoginRequest(BaseModel):
    employee_id: str = Field(min_length=1)
    password: str = Field(min_length=1)


class EmployeeLoginResponse(BaseModel):
    message: str
    employee: dict


class ChangePasswordRequest(BaseModel):
    new_password: str = Field(min_length=10)