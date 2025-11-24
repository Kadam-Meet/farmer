from pydantic import BaseModel, EmailStr
from typing import Optional, List, Literal
from datetime import datetime


# ==========================================================
# FARMER REGISTRATION
# ==========================================================
class FarmerRegistration(BaseModel):
    id: str
    profile_picture: Optional[str] = None
    name: str
    contact_number: str
    city: str
    state: str
    email: EmailStr
    created_at: Optional[datetime] = None
    full_address: str
 

# ==========================================================
# WORKER REGISTRATION
# ==========================================================
class WorkerRegistration(BaseModel):
    id: str
    profile_picture: Optional[str] = None
    name: str
    contact_number: str
    city: str
    state: str
    email: EmailStr
    full_address: str
    job_expertise: Optional[List[str]] = None
    skill_level: Optional[str] = None
    work_capacity: Optional[str] = None
    need_accommodation: Optional[bool] = False
    expected_salary: Optional[float] = None
    salary_type: Optional[str] = None
    additional_benefits: Optional[List[str]] = None
    availability_duration: Optional[str] = None
    created_at: Optional[datetime] = None
  


# ==========================================================
# JOB LISTINGS (Created by Farmer)
# ==========================================================
class JobListings(BaseModel):
    job_id: Optional[int] = None
    farmer_id: str
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
    created_at: Optional[datetime] = None
    full_address: Optional[str] = None
    email: EmailStr 
    contact_number: str


# ==========================================================
# COLLABORATIONS (Farmer ↔ Worker Requests)
# ==========================================================
class Collaboration(BaseModel):
    collaboration_id: Optional[int] = None
    job_id: int
    farmer_id: Optional[str] = None
    worker_id: str
    status: Literal["Pending", "Accepted", "Rejected", "Active", "Completed"] = "Pending"
    accepted_by_farmer: Optional[bool] = False
    accepted_by_worker: Optional[bool] = False
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    requested_at: Optional[datetime] = None


# ==========================================================
# FEEDBACK (Given After Collaboration Ends)
# ==========================================================
class FeedbackModel(BaseModel):
    feedback_id: Optional[int] = None
    collaboration_id: int
    given_by: Literal["Farmer", "Worker"]
    farmer_id: Optional[int] = None
    worker_id: Optional[int] = None
    rating: int
    review: Optional[str] = None
    created_at: Optional[datetime] = None


# ==========================================================
# NOTIFICATIONS (Sent to Farmer or Worker)
# ==========================================================
# class NotificationModel(BaseModel):
#     notification_id: Optional[int] = None
#     user_type: Literal["Farmer", "Worker"]
#     user_id: int
#     message: str
#     is_read: Optional[bool] = False
#     created_at: Optional[datetime] = None
