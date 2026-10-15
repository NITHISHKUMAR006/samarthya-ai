import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.auth.dependencies import require_role
from app.auth.security import hash_password
from app.models.user import User, OfficialProfile, UserProgress
from app.models.competency import Competency, OfficialCompetency
from app.models.learning import Course
from app.models.quiz import Quiz, AssessmentResult
from app.schemas.admin import AdminStatistics, OfficialSummary, CreateOfficialRequest

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/statistics", response_model=AdminStatistics)
def get_statistics(
    admin: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    """Get aggregate platform statistics for the admin dashboard."""
    total_officials = db.query(User).filter(User.role == "OFFICIAL").count()
    active_learners = (
        db.query(UserProgress)
        .filter(UserProgress.quizzes_taken > 0)
        .count()
    )

    # Average competency score
    avg_comp = db.query(func.avg(OfficialCompetency.current_score)).scalar() or 0.0

    # Course completion
    total_progress = db.query(UserProgress).all()
    total_completed = sum(p.courses_completed for p in total_progress)
    total_possible = max(total_officials * db.query(Course).count(), 1)
    completion_rate = round((total_completed / total_possible) * 100, 1)

    # Average assessment score
    avg_assess = db.query(func.avg(AssessmentResult.percentage)).scalar() or 0.0

    # Skill gap distribution
    competencies = db.query(Competency).all()
    gap_dist = []
    for comp in competencies:
        avg_gap = (
            db.query(func.avg(OfficialCompetency.required_score - OfficialCompetency.current_score))
            .filter(OfficialCompetency.competency_id == comp.id)
            .scalar()
        ) or 0.0
        gap_dist.append({"name": comp.name, "avgGap": round(float(avg_gap), 1)})

    # Course popularity
    courses = db.query(Course).limit(10).all()
    course_pop = [
        {"name": c.name[:30], "enrollments": max(total_officials - i, 1)}
        for i, c in enumerate(courses)
    ]

    # Recent users
    officials = (
        db.query(User)
        .filter(User.role == "OFFICIAL")
        .order_by(User.created_at.desc())
        .limit(5)
        .all()
    )
    recent = [{"name": u.full_name, "email": u.email, "joinedAt": str(u.created_at)} for u in officials]

    return AdminStatistics(
        total_officials=total_officials,
        active_learners=active_learners,
        avg_competency=round(float(avg_comp), 1),
        course_completion_rate=completion_rate,
        avg_assessment_score=round(float(avg_assess), 1),
        total_courses=db.query(Course).count(),
        total_quizzes=db.query(Quiz).count(),
        skill_gap_distribution=gap_dist,
        course_popularity=course_pop,
        recent_users=recent,
    )


@router.get("/officials", response_model=list[OfficialSummary])
def list_officials(
    admin: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    """List all officials with their competency and progress data."""
    officials = db.query(User).filter(User.role == "OFFICIAL").all()
    result: list[OfficialSummary] = []

    for user in officials:
        profile = db.query(OfficialProfile).filter(OfficialProfile.user_id == user.id).first()
        progress = db.query(UserProgress).filter(UserProgress.user_id == user.id).first()

        # Average competency
        avg_comp = (
            db.query(func.avg(OfficialCompetency.current_score))
            .filter(OfficialCompetency.user_id == user.id)
            .scalar()
        ) or 0.0

        result.append(
            OfficialSummary(
                id=user.id,
                full_name=user.full_name,
                email=user.email,
                department=profile.department if profile else "",
                job_role=profile.job_role if profile else "",
                avg_competency=round(float(avg_comp), 1),
                courses_completed=progress.courses_completed if progress else 0,
                quizzes_taken=progress.quizzes_taken if progress else 0,
                average_score=progress.average_score if progress else 0.0,
                is_active=user.is_active,
            )
        )

    return result


@router.post("/officials", response_model=OfficialSummary, status_code=status.HTTP_201_CREATED)
def create_official(
    request: CreateOfficialRequest,
    admin: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    """Admin creates a new official account using username, email, and password."""
    clean_email = request.email.strip().lower()
    clean_name = request.full_name.strip()

    if not clean_email or not clean_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Official name and email ID are required.",
        )

    if not request.password or len(request.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long.",
        )

    existing = db.query(User).filter(User.email == clean_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"An account with email '{clean_email}' already exists.",
        )

    # 1. Create User
    new_user = User(
        email=clean_email,
        full_name=clean_name,
        password_hash=hash_password(request.password),
        role="OFFICIAL",
        is_active=True,
    )
    db.add(new_user)
    db.flush()

    # 2. Create Official Profile
    emp_code = f"MOSPI{new_user.id:04d}"
    dept = request.department.strip() if request.department else "Ministry of Statistics & PI (MoSPI)"
    role = request.job_role.strip() if request.job_role else "Statistical Officer"

    profile = OfficialProfile(
        user_id=new_user.id,
        employee_id=emp_code,
        department=dept,
        job_role=role,
        years_of_experience=1,
        skills=json.dumps(["Official Statistics", "Data Literacy", "MoSPI Frameworks"]),
        completed_training=json.dumps(["Induction to Official Statistics"]),
        bio=f"Official account for {clean_name} enrolled by System Administrator.",
    )
    db.add(profile)

    # 3. Create initial Progress record
    progress = UserProgress(
        user_id=new_user.id,
        courses_completed=0,
        courses_in_progress=1,
        quizzes_taken=0,
        average_score=0.0,
        total_learning_hours=0.0,
    )
    db.add(progress)

    # 4. Initialize baseline competencies from existing taxonomy
    competencies = db.query(Competency).all()
    for c in competencies:
        db.add(
            OfficialCompetency(
                user_id=new_user.id,
                competency_id=c.id,
                current_score=50.0,
                required_score=85.0,
            )
        )

    db.commit()
    db.refresh(new_user)

    return OfficialSummary(
        id=new_user.id,
        full_name=new_user.full_name,
        email=new_user.email,
        department=dept,
        job_role=role,
        avg_competency=50.0 if competencies else 0.0,
        courses_completed=0,
        quizzes_taken=0,
        average_score=0.0,
        is_active=new_user.is_active,
    )
