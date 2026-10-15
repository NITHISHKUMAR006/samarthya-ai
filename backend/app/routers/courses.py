from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.models.competency import OfficialCompetency
from app.models.learning import Course, LearningPath, LearningPathCourse
from app.schemas.course import CourseResponse, RecommendedCourseResponse, LearningPathResponse, LearningPathCourseResponse
from app.integrations.igot_adapter import IGOTAdapter

router = APIRouter(tags=["Courses & Learning"])
igot = IGOTAdapter()


@router.get("/courses", response_model=list[CourseResponse])
def list_courses(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    """List all available courses (mock iGOT catalogue)."""
    courses = igot.get_courses(db)
    return [CourseResponse.model_validate(c) for c in courses]


@router.get("/courses/recommended", response_model=list[RecommendedCourseResponse])
def get_recommended_courses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get courses recommended based on the official's competency gaps."""
    # Fetch user competency gaps
    user_gaps = (
        db.query(OfficialCompetency)
        .filter(OfficialCompetency.user_id == current_user.id)
        .all()
    )
    gap_map: dict[str, float] = {}
    for oc in user_gaps:
        from app.models.competency import Competency
        comp = db.query(Competency).filter(Competency.id == oc.competency_id).first()
        if comp:
            gap = max(oc.required_score - oc.current_score, 0)
            if gap > 0:
                gap_map[comp.name] = gap

    courses = igot.get_courses(db)
    recommended: list[RecommendedCourseResponse] = []
    for course in courses:
        match_score = 0.0
        reason = ""
        for gap_name, gap_val in gap_map.items():
            if gap_name.lower() in course.competency_area.lower() or course.competency_area.lower() in gap_name.lower():
                match_score = min(gap_val / 30.0 * 100, 98)
                reason = f"Addresses your {gap_name} skill gap ({gap_val:.0f}% gap)"
                break

        if match_score == 0:
            # Partial / category match
            match_score = 40.0
            reason = "General competency development"

        recommended.append(
            RecommendedCourseResponse(
                id=course.id,
                course_code=course.course_code,
                name=course.name,
                competency_area=course.competency_area,
                difficulty=course.difficulty,
                duration_hours=course.duration_hours,
                description=course.description,
                provider=course.provider,
                is_igot=course.is_igot,
                match_score=round(match_score, 1),
                reason=reason,
            )
        )

    recommended.sort(key=lambda r: r.match_score, reverse=True)
    return recommended


@router.get("/learning-path", response_model=LearningPathResponse)
def get_learning_path(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the official's personalized learning path."""
    lp = db.query(LearningPath).filter(LearningPath.user_id == current_user.id).first()

    stages = [
        {"name": "Assess", "description": "Evaluate current competencies", "status": "completed", "icon": "clipboard-check"},
        {"name": "Identify Gap", "description": "Detect skill deficiencies", "status": "completed", "icon": "search"},
        {"name": "Personalize", "description": "Build custom learning path", "status": "completed", "icon": "user-cog"},
        {"name": "Learn", "description": "Complete recommended courses", "status": "in_progress", "icon": "book-open"},
        {"name": "Practice", "description": "Apply through quizzes & tasks", "status": "pending", "icon": "target"},
        {"name": "Measure", "description": "Assess improvement", "status": "pending", "icon": "bar-chart"},
        {"name": "Adapt", "description": "Refine learning path", "status": "pending", "icon": "refresh-cw"},
    ]

    if not lp:
        return LearningPathResponse(id=0, status="not_started", courses=[], stages=stages)

    path_courses: list[LearningPathCourseResponse] = []
    for lpc in lp.path_courses:
        course = lpc.course
        path_courses.append(
            LearningPathCourseResponse(
                id=lpc.id,
                course_id=course.id,
                course_name=course.name,
                course_code=course.course_code,
                competency_area=course.competency_area,
                order=lpc.order,
                status=lpc.status,
                difficulty=course.difficulty,
                duration_hours=course.duration_hours,
            )
        )

    path_courses.sort(key=lambda c: c.order)
    return LearningPathResponse(id=lp.id, status=lp.status, courses=path_courses, stages=stages)
