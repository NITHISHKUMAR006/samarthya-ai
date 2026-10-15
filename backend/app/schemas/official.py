from pydantic import BaseModel
from typing import Optional


class ProfileResponse(BaseModel):
    id: int
    user_id: int
    employee_id: str
    department: str
    job_role: str
    years_of_experience: int
    skills: list[str]
    completed_training: list[str]
    bio: str
    full_name: str = ""
    email: str = ""

    model_config = {"from_attributes": True}


class ProfileUpdate(BaseModel):
    department: Optional[str] = None
    job_role: Optional[str] = None
    years_of_experience: Optional[int] = None
    skills: Optional[list[str]] = None
    completed_training: Optional[list[str]] = None
    bio: Optional[str] = None
