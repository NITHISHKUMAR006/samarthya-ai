from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.models.competency import Competency, OfficialCompetency
from app.schemas.competency import CompetencyResponse, CompetencyGapResponse

router = APIRouter(prefix="/competencies", tags=["Competencies"])


@router.get("", response_model=list[CompetencyResponse])
def list_competencies(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    """List all competencies in the system."""
    competencies = db.query(Competency).all()
    return [CompetencyResponse.model_validate(c) for c in competencies]


@router.get("/gaps", response_model=list[CompetencyGapResponse])
def get_competency_gaps(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get competency gaps for the current official, sorted by gap size."""
    records = (
        db.query(OfficialCompetency)
        .filter(OfficialCompetency.user_id == current_user.id)
        .all()
    )

    gaps: list[CompetencyGapResponse] = []
    for rec in records:
        competency = db.query(Competency).filter(Competency.id == rec.competency_id).first()
        if not competency:
            continue
        gap = max(rec.required_score - rec.current_score, 0)
        priority = "High" if gap >= 25 else ("Medium" if gap >= 10 else "Low")
        gaps.append(
            CompetencyGapResponse(
                competency_id=competency.id,
                competency_name=competency.name,
                category=competency.category,
                current_score=rec.current_score,
                required_score=rec.required_score,
                gap=gap,
                priority=priority,
            )
        )

    gaps.sort(key=lambda g: g.gap, reverse=True)
    return gaps
