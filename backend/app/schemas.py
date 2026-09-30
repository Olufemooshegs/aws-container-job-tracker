"""
Pydantic schemas — request/response DTOs.

Separating them from ORM models keeps the API contract stable
even when the database schema changes.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, ConfigDict

from app.models import ApplicationStatus


# ─── Auth ────────────────────────────────────────────────────────
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=72)
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: EmailStr
    full_name: Optional[str]
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ─── Company ─────────────────────────────────────────────────────
class CompanyBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    website: Optional[str] = Field(None, max_length=500)
    notes: Optional[str] = None


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    website: Optional[str] = None
    notes: Optional[str] = None


class CompanyOut(CompanyBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


# ─── Application ─────────────────────────────────────────────────
class ApplicationBase(BaseModel):
    role_title: str = Field(..., min_length=1, max_length=255)
    company_id: int
    job_url: Optional[str] = Field(None, max_length=500)
    status: ApplicationStatus = ApplicationStatus.wishlist
    applied_at: Optional[datetime] = None
    notes: Optional[str] = None


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationUpdate(BaseModel):
    role_title: Optional[str] = None
    company_id: Optional[int] = None
    job_url: Optional[str] = None
    status: Optional[ApplicationStatus] = None
    applied_at: Optional[datetime] = None
    notes: Optional[str] = None


class ApplicationOut(ApplicationBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    updated_at: datetime


class ApplicationWithCompany(ApplicationOut):
    company: CompanyOut


# ─── Interview ───────────────────────────────────────────────────
class InterviewBase(BaseModel):
    scheduled_at: datetime
    round_name: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None
    outcome: Optional[str] = Field(None, max_length=50)


class InterviewCreate(InterviewBase):
    pass


class InterviewUpdate(BaseModel):
    scheduled_at: Optional[datetime] = None
    round_name: Optional[str] = None
    notes: Optional[str] = None
    outcome: Optional[str] = None


class InterviewOut(InterviewBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    application_id: int
    created_at: datetime