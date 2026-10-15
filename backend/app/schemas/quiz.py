from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class QuestionResponse(BaseModel):
    id: int
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    question_order: int

    model_config = {"from_attributes": True}


class QuizResponse(BaseModel):
    id: int
    title: str
    description: str
    competency_area: str
    total_questions: int
    created_at: datetime

    model_config = {"from_attributes": True}


class QuizDetailResponse(BaseModel):
    id: int
    title: str
    description: str
    competency_area: str
    total_questions: int
    questions: list[QuestionResponse]


class AnswerSubmission(BaseModel):
    question_id: int
    selected_option: str  # A | B | C | D


class QuizSubmitRequest(BaseModel):
    answers: list[AnswerSubmission]


class QuestionResultResponse(BaseModel):
    question_id: int
    question_text: str
    selected_option: str
    correct_option: str
    is_correct: bool
    explanation: str


class QuizResultResponse(BaseModel):
    quiz_id: int
    quiz_title: str
    score: int
    total: int
    percentage: float
    results: list[QuestionResultResponse]


class GenerateQuizRequest(BaseModel):
    material_id: Optional[int] = None
    competency_area: Optional[str] = None
    num_questions: int = 5


class AssessmentResultResponse(BaseModel):
    id: int
    quiz_id: int
    quiz_title: str
    competency_area: str
    score: int
    total: int
    percentage: float
    completed_at: datetime
