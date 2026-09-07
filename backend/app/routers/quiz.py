import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User, UserProgress
from app.models.quiz import Quiz, Question, AssessmentResult
from app.models.learning import LearningMaterial
from app.schemas.quiz import (
    QuizResponse,
    QuizDetailResponse,
    QuestionResponse,
    QuizSubmitRequest,
    QuizResultResponse,
    QuestionResultResponse,
    GenerateQuizRequest,
    AssessmentResultResponse,
)
from app.ai.quiz_generator import MockQuizGenerator

router = APIRouter(prefix="/quizzes", tags=["Quizzes"])
quiz_gen = MockQuizGenerator()


@router.get("", response_model=list[QuizResponse])
def list_quizzes(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    """List all available quizzes."""
    quizzes = db.query(Quiz).order_by(Quiz.created_at.desc()).all()
    return [QuizResponse.model_validate(q) for q in quizzes]


@router.get("/{quiz_id}", response_model=QuizDetailResponse)
def get_quiz(quiz_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    """Get a quiz with all its questions (correct answers excluded)."""
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

    questions = (
        db.query(Question)
        .filter(Question.quiz_id == quiz_id)
        .order_by(Question.question_order)
        .all()
    )

    return QuizDetailResponse(
        id=quiz.id,
        title=quiz.title,
        description=quiz.description,
        competency_area=quiz.competency_area,
        total_questions=quiz.total_questions,
        questions=[QuestionResponse.model_validate(q) for q in questions],
    )


@router.post("/{quiz_id}/submit", response_model=QuizResultResponse)
def submit_quiz(
    quiz_id: int,
    submission: QuizSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Submit quiz answers and get scored results."""
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

    questions = db.query(Question).filter(Question.quiz_id == quiz_id).all()
    question_map = {q.id: q for q in questions}

    score = 0
    total = len(questions)
    results: list[QuestionResultResponse] = []

    for answer in submission.answers:
        q = question_map.get(answer.question_id)
        if not q:
            continue
        is_correct = answer.selected_option.upper() == q.correct_option.upper()
        if is_correct:
            score += 1
        results.append(
            QuestionResultResponse(
                question_id=q.id,
                question_text=q.question_text,
                selected_option=answer.selected_option,
                correct_option=q.correct_option,
                is_correct=is_correct,
                explanation=q.explanation or "",
            )
        )

    percentage = round((score / total) * 100, 1) if total > 0 else 0.0

    # Save assessment result
    result_record = AssessmentResult(
        user_id=current_user.id,
        quiz_id=quiz_id,
        score=score,
        total=total,
        percentage=percentage,
        answers=json.dumps([a.model_dump() for a in submission.answers]),
        completed_at=datetime.utcnow(),
    )
    db.add(result_record)

    # Update user progress
    progress = db.query(UserProgress).filter(UserProgress.user_id == current_user.id).first()
    if progress:
        progress.quizzes_taken += 1
        # Recalculate average score
        all_results = db.query(AssessmentResult).filter(AssessmentResult.user_id == current_user.id).all()
        total_pct = sum(r.percentage for r in all_results) + percentage
        progress.average_score = round(total_pct / (len(all_results) + 1), 1)
        progress.last_activity = datetime.utcnow()

    db.commit()

    return QuizResultResponse(
        quiz_id=quiz_id,
        quiz_title=quiz.title,
        score=score,
        total=total,
        percentage=percentage,
        results=results,
    )


@router.post("/generate", response_model=QuizResponse)
def generate_quiz(
    request: GenerateQuizRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate a quiz from uploaded material or competency area (mock AI)."""
    extracted_text = ""
    if request.material_id:
        material = db.query(LearningMaterial).filter(LearningMaterial.id == request.material_id).first()
        if material and material.extracted_text:
            extracted_text = material.extracted_text

    competency = request.competency_area or "General Knowledge"
    generated = quiz_gen.generate(
        text=extracted_text,
        competency_area=competency,
        num_questions=request.num_questions,
    )

    quiz = Quiz(
        title=generated["title"],
        description=generated["description"],
        competency_area=competency,
        material_id=request.material_id,
        created_by=current_user.id,
        total_questions=len(generated["questions"]),
    )
    db.add(quiz)
    db.flush()

    for i, q in enumerate(generated["questions"]):
        question = Question(
            quiz_id=quiz.id,
            question_text=q["question_text"],
            option_a=q["option_a"],
            option_b=q["option_b"],
            option_c=q["option_c"],
            option_d=q["option_d"],
            correct_option=q["correct_option"],
            explanation=q["explanation"],
            question_order=i + 1,
        )
        db.add(question)

    db.commit()
    db.refresh(quiz)
    return QuizResponse.model_validate(quiz)
