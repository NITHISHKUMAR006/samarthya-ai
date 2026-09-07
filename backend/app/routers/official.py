import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User, OfficialProfile
from app.schemas.official import ProfileResponse, ProfileUpdate

router = APIRouter(prefix="/official", tags=["Official"])


def _profile_to_response(profile: OfficialProfile, user: User) -> ProfileResponse:
    """Convert ORM profile to response, deserializing JSON fields."""
    skills = json.loads(profile.skills) if profile.skills else []
    training = json.loads(profile.completed_training) if profile.completed_training else []
    return ProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        employee_id=profile.employee_id or "",
        department=profile.department or "",
        job_role=profile.job_role or "",
        years_of_experience=profile.years_of_experience or 0,
        skills=skills,
        completed_training=training,
        bio=profile.bio or "",
        full_name=user.full_name,
        email=user.email,
    )


@router.get("/profile", response_model=ProfileResponse)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the current official's profile."""
    profile = db.query(OfficialProfile).filter(OfficialProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return _profile_to_response(profile, current_user)


@router.put("/profile", response_model=ProfileResponse)
def update_profile(
    updates: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update the current official's profile."""
    profile = db.query(OfficialProfile).filter(OfficialProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    if updates.department is not None:
        profile.department = updates.department
    if updates.job_role is not None:
        profile.job_role = updates.job_role
    if updates.years_of_experience is not None:
        profile.years_of_experience = updates.years_of_experience
    if updates.skills is not None:
        profile.skills = json.dumps(updates.skills)
    if updates.completed_training is not None:
        profile.completed_training = json.dumps(updates.completed_training)
    if updates.bio is not None:
        profile.bio = updates.bio

    db.commit()
    db.refresh(profile)
    return _profile_to_response(profile, current_user)
