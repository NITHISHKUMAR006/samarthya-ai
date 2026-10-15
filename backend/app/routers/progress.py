from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User, UserProgress
from app.models.quiz import AssessmentResult, Quiz
from app.schemas.admin import ProgressResponse
from app.schemas.quiz import AssessmentResultResponse

router = APIRouter(tags=["Progress & Results"])


@router.get("/progress", response_model=ProgressResponse)
def get_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the current official's learning progress."""
    progress = db.query(UserProgress).filter(UserProgress.user_id == current_user.id).first()

    recent_results = (
        db.query(AssessmentResult)
        .filter(AssessmentResult.user_id == current_user.id)
        .order_by(AssessmentResult.completed_at.desc())
        .limit(5)
        .all()
    )

    activities = []
    for r in recent_results:
        quiz = db.query(Quiz).filter(Quiz.id == r.quiz_id).first()
        activities.append({
            "type": "quiz",
            "title": f"Completed: {quiz.title}" if quiz else "Quiz completed",
            "score": f"{r.score}/{r.total} ({r.percentage}%)",
            "date": str(r.completed_at),
        })

    return ProgressResponse(
        courses_completed=progress.courses_completed if progress else 0,
        courses_in_progress=progress.courses_in_progress if progress else 0,
        quizzes_taken=progress.quizzes_taken if progress else 0,
        average_score=progress.average_score if progress else 0.0,
        total_learning_hours=progress.total_learning_hours if progress else 0.0,
        recent_activities=activities,
    )


@router.get("/results", response_model=list[AssessmentResultResponse])
def get_results(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all assessment results for the current official."""
    results = (
        db.query(AssessmentResult)
        .filter(AssessmentResult.user_id == current_user.id)
        .order_by(AssessmentResult.completed_at.desc())
        .all()
    )

    response = []
    for r in results:
        quiz = db.query(Quiz).filter(Quiz.id == r.quiz_id).first()
        response.append(
            AssessmentResultResponse(
                id=r.id,
                quiz_id=r.quiz_id,
                quiz_title=quiz.title if quiz else "Unknown Quiz",
                competency_area=quiz.competency_area if quiz else "",
                score=r.score,
                total=r.total,
                percentage=r.percentage,
                completed_at=r.completed_at,
            )
        )

    return response
