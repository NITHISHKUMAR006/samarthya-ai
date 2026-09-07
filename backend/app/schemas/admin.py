from pydantic import BaseModel
from datetime import datetime


class OfficialSummary(BaseModel):
    id: int
    full_name: str
    email: str
    department: str
    job_role: str
    avg_competency: float
    courses_completed: int
    quizzes_taken: int
    average_score: float
    is_active: bool


class AdminStatistics(BaseModel):
    total_officials: int
    active_learners: int
    avg_competency: float
    course_completion_rate: float
    avg_assessment_score: float
    total_courses: int
    total_quizzes: int
    skill_gap_distribution: list[dict]
    course_popularity: list[dict]
    recent_users: list[dict]


class ProgressResponse(BaseModel):
    courses_completed: int
    courses_in_progress: int
    quizzes_taken: int
    average_score: float
    total_learning_hours: float
    recent_activities: list[dict]
