"""
Interview endpoints — nested under /applications/{id}/interviews.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.deps import get_db, get_current_user
from app.models import Application, Interview, User
from app.schemas import InterviewCreate, InterviewUpdate, InterviewOut

router = APIRouter()


def _get_owned_app(db: Session, app_id: int, user: User) -> Application:
    app = db.get(Application, app_id)
    if not app or app.user_id != user.id:
        raise HTTPException(status_code=404, detail="Application not found")
    return app


def _get_owned_interview(db: Session, interview_id: int, user: User) -> Interview:
    interview = db.get(Interview, interview_id)
    if not interview or interview.application.user_id != user.id:
        raise HTTPException(status_code=404, detail="Interview not found")
    return interview


@router.get("/applications/{app_id}/interviews", response_model=list[InterviewOut])
def list_interviews(
    app_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _get_owned_app(db, app_id, user)
    return (
        db.query(Interview)
        .filter(Interview.application_id == app_id)
        .order_by(Interview.scheduled_at)
        .all()
    )


@router.post(
    "/applications/{app_id}/interviews",
    response_model=InterviewOut,
    status_code=status.HTTP_201_CREATED,
)
def create_interview(
    app_id: int,
    payload: InterviewCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _get_owned_app(db, app_id, user)
    interview = Interview(application_id=app_id, **payload.model_dump())
    db.add(interview)
    db.commit()
    db.refresh(interview)
    return interview


@router.patch("/interviews/{interview_id}", response_model=InterviewOut)
def update_interview(
    interview_id: int,
    payload: InterviewUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    interview = _get_owned_interview(db, interview_id, user)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(interview, field, value)
    db.commit()
    db.refresh(interview)
    return interview


@router.delete("/interviews/{interview_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    interview = _get_owned_interview(db, interview_id, user)
    db.delete(interview)
    db.commit()