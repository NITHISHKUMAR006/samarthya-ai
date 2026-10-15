from pydantic import BaseModel
from typing import Optional


class CourseResponse(BaseModel):
    id: int
    course_code: str
    name: str
    competency_area: str
    difficulty: str
    duration_hours: float
    description: str
    provider: str
    is_igot: bool

    model_config = {"from_attributes": True}


class RecommendedCourseResponse(BaseModel):
    id: int
    course_code: str
    name: str
    competency_area: str
    difficulty: str
    duration_hours: float
    description: str
    provider: str
    is_igot: bool
    match_score: float
    reason: str


class LearningPathCourseResponse(BaseModel):
    id: int
    course_id: int
    course_name: str
    course_code: str
    competency_area: str
    order: int
    status: str
    difficulty: str
    duration_hours: float


class LearningPathResponse(BaseModel):
    id: int
    status: str
    courses: list[LearningPathCourseResponse]
    stages: list[dict]
