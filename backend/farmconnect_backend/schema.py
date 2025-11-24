from pydantic import BaseModel, EmailStr
from typing import Optional, List, Literal
from datetime import datetime



# ==========================================================
# UPDATE PROFILE SCHEMAS
# ==========================================================
class FarmerUpdate(BaseModel):
    profile_picture: Optional[str] = None
    name: Optional[str] = None
    contact_number: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    full_address: Optional[str] = None

class WorkerUpdate(BaseModel):
    profile_picture: Optional[str] = None
    name: Optional[str] = None
    contact_number: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    job_expertise: Optional[List[str]] = None
    skill_level: Optional[str] = None
    
    need_accommodation: Optional[bool] = None
    expected_salary: Optional[float] = None
    additional_benefits: Optional[List[str]] = None
    full_address: Optional[str] = None
    work_capacity: Optional[str] = None
    availability_duration: Optional[str] = None
    salary_type: Optional[str] = None
# ==========================================================
# WORKER REQUESTS / MATCHING SYSTEM
# ==========================================================
class WorkerSearchFilter(BaseModel):
    skill_expertise: Optional[str] = None
    skill_level: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    salary_range: Optional[List[float]] = None  # [min, max]
    need_accommodation: Optional[bool] = None


class SendRequest(BaseModel):
    farmer_id: int
    worker_id: int
    job_id: int


class UpdateRequestStatus(BaseModel):
    collaboration_id: int
    status: Literal["Pending", "Accepted", "Rejected", "Active", "Completed"]


# ==========================================================
# JOB CREATION / UPDATE HELPERS
# ==========================================================
class JobCreate(BaseModel):
    farmer_id: int
    job_type: str
    job_title: str
    land_area: Optional[str] = None
    workers_needed: int
    job_duration: str
    payment_type: str
    salary_amount: float
    urgency_level: Optional[str] = None
    required_skill_level: Optional[str] = None
    physical_demands: Optional[str] = None
    working_hours_per_day: Optional[str] = None
    accommodation_type: Optional[str] = None
    transportation_facility: Optional[str] = None
    additional_benefits: Optional[str] = None
    state: str
    city: str
    job_description: Optional[str] = None
    job_images: Optional[List[str]] = None


class JobFilter(BaseModel):
    city: Optional[str] = None
    state: Optional[str] = None
    job_type: Optional[str] = None
    skill_required: Optional[str] = None
    urgency_level: Optional[str] = None


# ==========================================================
# FEEDBACK (INPUT ONLY)
# ==========================================================
class FeedbackInput(BaseModel):
    collaboration_id: int
    given_by: Literal["Farmer", "Worker"]
    rating: int
    review: Optional[str] = None


# ==========================================================
# DASHBOARD / HOMEPAGE STRUCTURES
# ==========================================================
class NotificationResponse(BaseModel):
    notification_id: int
    message: str
    is_read: bool
    created_at: datetime


class HomeDashboard(BaseModel):
    total_jobs_posted: Optional[int] = 0
    active_collaborations: Optional[int] = 0
    pending_requests: Optional[int] = 0
    notifications: Optional[List[NotificationResponse]] = []


# ==========================================================
# AUTH RESPONSE SCHEMAS
# ==========================================================
class AuthResponse(BaseModel):
    message: str
    user_type: Literal["Farmer", "Worker"]
    email: EmailStr
    token: Optional[str] = None


class WorkRequest(BaseModel):
    id: Optional[int] = None
    job_id: int
    farmer_id: int
    worker_id: int
    status: Literal["Pending", "Accepted", "Rejected", "Active", "Completed"] = "Pending"
    accepted_by_farmer: Optional[bool] = False
    accepted_by_worker: Optional[bool] = False
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    created_at: Optional[datetime] = None