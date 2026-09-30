"""
Application CRUD + status filtering + enriched list.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload

from app.deps import get_db, get_current_user
from app.models import Application, Company, User, ApplicationStatus
from app.schemas import (
    ApplicationCreate, ApplicationUpdate,
    ApplicationOut, ApplicationWithCompany,
)

router = APIRouter()


def _get_owned(db: Session, app_id: int, user: User) -> Application:
    app = db.get(Application, app_id)
    if not app or app.user_id != user.id:
        raise HTTPException(status_code=404, detail="Application not found")
    return app


@router.get("", response_model=list[ApplicationWithCompany])
def list_applications(
    status_filter: Optional[ApplicationStatus] = Query(None, alias="status"),
    company_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = (
        db.query(Application)
        .options(joinedload(Application.company))
        .filter(Application.user_id == user.id)
    )
    if status_filter:
        q = q.filter(Application.status == status_filter)
    if company_id:
        q = q.filter(Application.company_id == company_id)
    return q.order_by(Application.updated_at.desc()).all()


@router.post("", response_model=ApplicationWithCompany, status_code=status.HTTP_201_CREATED)
def create_application(
    payload: ApplicationCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Verify the company belongs to the user
    company = db.get(Company, payload.company_id)
    if not company or company.user_id != user.id:
        raise HTTPException(status_code=400, detail="Invalid company_id")

    app = Application(user_id=user.id, **payload.model_dump())
    db.add(app)
    db.commit()
    db.refresh(app)
    return app


@router.get("/{app_id}", response_model=ApplicationWithCompany)
def get_application(
    app_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return _get_owned(db, app_id, user)


@router.patch("/{app_id}", response_model=ApplicationWithCompany)
def update_application(
    app_id: int,
    payload: ApplicationUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    app = _get_owned(db, app_id, user)

    updates = payload.model_dump(exclude_unset=True)
    if "company_id" in updates:
        company = db.get(Company, updates["company_id"])
        if not company or company.user_id != user.id:
            raise HTTPException(status_code=400, detail="Invalid company_id")

    for field, value in updates.items():
        setattr(app, field, value)
    db.commit()
    db.refresh(app)
    return app


@router.delete("/{app_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
    app_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    app = _get_owned(db, app_id, user)
    db.delete(app)
    db.commit()