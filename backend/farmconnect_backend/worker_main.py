from fastapi import APIRouter, HTTPException
from models import WorkerRegistration, Collaboration, FeedbackModel
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime
import os
from schema import WorkerUpdate, UpdateRequestStatus

router = APIRouter()

# Load environment variables
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# -------------------- WORKER REGISTRATION --------------------
@router.post("/register")
def register_worker(data: WorkerRegistration):
    existing = supabase.table("worker_registration").select("*").eq("email", data.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered. Please go to login instead.")

    
    data_dict = data.dict()
    data_dict.pop("worker_id", None)
    if data_dict.get("created_at"):
        data_dict["created_at"] = data_dict["created_at"].isoformat()

    result = supabase.table("worker_registration").insert(data_dict).execute()
    return {"message": "Worker registered successfully", "data": result.data}


# -------------------- SAVE (UPDATE) PROFILE --------------------
@router.put("/update_profile/{id}")
def save_worker_profile(id: str, updates: WorkerUpdate):
    existing = supabase.table("worker_registration").select("*").eq("id", id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Worker not found. Please register first.")

    update_data = updates.dict(exclude_unset=True)
    supabase.table("worker_registration").update(update_data).eq("id", id).execute()

    updated = supabase.table("worker_registration").select("*").eq("id", id).execute()

    return {"message": "Worker profile updated successfully.", "updated_profile": updated.data[0]}
 
@router.get("/profile/{id}")
def get_worker_profile(id: str):    
    worker = supabase.table("worker_registration").select("*").eq("id", id).execute()
    if not worker.data:
        raise HTTPException(status_code=404, detail="Worker not found.")
    return worker.data[0]


# -------------------- FIND AVAILABLE JOBS --------------------
@router.get("/find_work")
def find_work():
    """Show all jobs posted by farmers."""
    jobs = supabase.table("job_listings").select("*").execute()
    if not jobs.data:
        return {"jobs": []}
    return {"jobs": jobs.data} 


# ==========================================================
# 1️⃣ APPLY FOR JOB (Worker → Farmer)
# ==========================================================
@router.post("/apply_for_job")
def apply_for_job(data: Collaboration):
    """Worker applies for a specific job."""
    worker = supabase.table("worker_registration").select("*").eq("id", data.worker_id).execute()
    if not worker.data:
        raise HTTPException(status_code=404, detail="Worker not found.")

    job = supabase.table("job_listings").select("*").eq("job_id", data.job_id).execute()
    if not job.data:
        raise HTTPException(status_code=404, detail="Job not found.")

    farmer_id = job.data[0]["farmer_id"]

    # Prevent duplicate application
    existing = supabase.table("collaborations").select("*") \
        .eq("worker_id", data.worker_id).eq("job_id", data.job_id).execute()

    if existing.data:
        raise HTTPException(status_code=400, detail="Already applied for this job.")

    data_dict = data.dict()
    data_dict.pop("collaboration_id", None)
    data_dict["farmer_id"] = farmer_id
    data_dict["status"] = "Pending"
    data_dict["accepted_by_worker"] = True
    data_dict["requested_at"] = datetime.now().isoformat()

    result = supabase.table("collaborations").insert(data_dict).execute()
    return {"message": "Job application sent to farmer.", "data": result.data}


# ==========================================================
# 2️⃣ VIEW SENT APPLICATIONS (Worker)
# ==========================================================
# ==========================================================
# 2️⃣ VIEW SENT APPLICATIONS (Worker)
# ==========================================================
@router.get("/sent_requests/{worker_id}")
def view_sent_applications(worker_id: str):
    """View all job applications sent by this worker."""

    # Fetch only rows where worker has accepted
    requests = (
        supabase.table("collaborations")
        .select("*")
        .eq("worker_id", worker_id)
        .eq("accepted_by_worker", True)
        .eq("accepted_by_farmer", False)
        
        .execute()
    )

    if not requests.data:
        return {"sent_requests": []}

    enriched = []
    for req in requests.data:

        farmer = (
            supabase.table("farmer_registration")
            .select("name, city, state")
            .eq("id", req["farmer_id"])
            .execute()
        )

        job = (
            supabase.table("job_listings")
            .select("job_title, job_description")
            .eq("job_id", req["job_id"])
            .execute()
        )

        enriched.append({
            "collaboration_id": req["collaboration_id"],
            "farmer_details": farmer.data[0] if farmer.data else {},
            "job_details": job.data[0] if job.data else {},
            "status": req["status"],
            "accepted_by_worker": req.get("accepted_by_worker", False),
            "accepted_by_farmer": req.get("accepted_by_farmer", False),
            "created_at": req["requested_at"],
        })

    return {"sent_requests": enriched}
               

@router.get("/received_requests/{worker_id}")
def view_received_requests(worker_id: str):
    """View all job requests received by this worker."""

    # Fetch only requests sent by farmers & not yet accepted by worker
    requests = (
        supabase.table("collaborations")
        .select("*")
        .eq("worker_id", worker_id)
        .eq("accepted_by_farmer", True)
        .eq("accepted_by_worker", False)
        .execute()
    )

    if not requests.data:
        return {"received_requests": []}

    enriched = []
    for req in requests.data:

        farmer = (
            supabase.table("farmer_registration")
            .select("name, city, state")
            .eq("id", req["farmer_id"])
            .execute()
        )

        job = (
            supabase.table("job_listings")
            .select("job_title, job_description")
            .eq("job_id", req["job_id"])
            .execute()
        )

        enriched.append({
            "collaboration_id": req["collaboration_id"],
            "farmer_details": farmer.data[0] if farmer.data else {},
            "job_details": job.data[0] if job.data else {},
            "status": req["status"],
            "accepted_by_farmer": req.get("accepted_by_farmer", False),
            "accepted_by_worker": req.get("accepted_by_worker", False),
            "created_at": req["requested_at"],
        })

    return {"received_requests": enriched}

# -------------------- ACCEPT / REJECT REQUEST --------------------
@router.put("/update_request_status")
def update_request_status(data: UpdateRequestStatus):
    if data.status not in ["Accepted", "Rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status.")

    req = supabase.table("collaborations").select("*").eq("collaboration_id", data.collaboration_id).execute()
    if not req.data:
        raise HTTPException(status_code=404, detail="Collaboration not found.")

    collaboration = req.data[0]
    update_data = {"status": data.status}
    if data.status == "Accepted":
        update_data["accepted_by_worker"] = True
        if collaboration["accepted_by_farmer"]:
            update_data["status"] = "Active"
            update_data["started_at"] = datetime.now().isoformat()

    elif data.status == "Rejected":
        update_data["ended_at"] = datetime.now().isoformat()

    supabase.table("collaborations").update(update_data).eq("collaboration_id", data.collaboration_id).execute()
    return {"message": f"Request {data.status.lower()} successfully."}

#---------------------GET ACTIVE COLLABORATIONS (Worker)--------------------
@router.get("/active_collaborations/{worker_id}")
def get_active_collaborations(worker_id: str):
    """Get all active collaborations for a worker."""
    collaborations = (
        supabase.table("collaborations")
        .select("*")
        .eq("worker_id", worker_id)
        .in_("status", ["Accepted", "Active"])
        .execute()
    )

    if not collaborations.data:
        return {"active_collaborations": []}

    enriched = []
    for collab in collaborations.data:
        farmer = (
            supabase.table("farmer_registration")
            .select("name, city, state")
            .eq("id", collab["farmer_id"])
            .execute()
        )

        job = (
            supabase.table("job_listings")
            .select("job_title, job_description")
            .eq("job_id", collab["job_id"])
            .execute()
        )

        enriched.append({
            "collaboration_id": collab["collaboration_id"],
            "farmer_details": farmer.data[0] if farmer.data else {},
            "job_details": job.data[0] if job.data else {},
            "status": collab["status"],
            "started_at": collab.get("started_at"),
        })

    return {"active_collaborations": enriched}
# -------------------- END COLLABORATION (Worker) --------------------
@router.put("/end_collaboration/{collaboration_id}")
def end_collaboration(collaboration_id: int, worker_id: str):
    req = supabase.table("collaborations").select("*").eq("collaboration_id", collaboration_id).execute()
    if not req.data:
        raise HTTPException(status_code=404, detail="Request not found.")

    record = req.data[0]
    if record["worker_id"] != worker_id:
        raise HTTPException(status_code=403, detail="Only the assigned worker can end this collaboration.")

    if record["status"] not in ["Active", "Accepted"]:
        raise HTTPException(status_code=400, detail="Cannot end collaboration unless it's active or accepted.")

    supabase.table("collaborations").update({
        "status": "Completed",
        "ended_at": datetime.now().isoformat()
    }).eq("collaboration_id", collaboration_id).execute()

    return {"message": "Collaboration ended successfully. Worker can now give feedback."}


# -------------------- ADD FEEDBACK (Worker to Farmer) --------------------
@router.post("/add_feedback")
def add_feedback(data: FeedbackModel):
    req = supabase.table("collaborations").select("*").eq("collaboration_id", data.collaboration_id).execute()
    if not req.data:
        raise HTTPException(status_code=404, detail="Request not found.")

    record = req.data[0]
    if data.worker_id != record["worker_id"]:
        raise HTTPException(status_code=403, detail="Only the worker can give feedback for the farmer.")

    if record["status"] != "Completed":
        raise HTTPException(status_code=400, detail="Feedback can only be given after collaboration is completed.")

    supabase.table("feedback").insert({
        "collaboration_id": data.collaboration_id,
        "given_by": data.given_by,
        "farmer_id": data.farmer_id,
        "worker_id": data.worker_id,
        "rating": data.rating, 
        "review": data.review,
        "created_at": datetime.now().isoformat()
    }).execute()

    return {"message": "Feedback saved successfully for farmer by worker."}


# -------------------- WORKER DASHBOARD --------------------
@router.get("/dashboard/{worker_id}")
def worker_dashboard(worker_id: str):
    """
    Returns worker dashboard summary:
    - Profile info (name + profile picture)
    - Total applications
    - Active collaborations
    """

    # Profile info
    worker_data = supabase.table("worker_registration").select("name, profile_picture").eq("id", worker_id).execute()
    if not worker_data.data:
        raise HTTPException(status_code=404, detail="Worker not found.")

    worker_info = worker_data.data[0]

    # Total applications
    applications = supabase.table("collaborations").select("*").eq("worker_id", worker_id).execute()
    total_applications = len(applications.data) if applications.data else 0

    # Active collaborations
    active = [req for req in applications.data if req["status"] in ["Accepted", "Active"]]
    total_active = len(active)

    return {
        "worker_name": worker_info.get("name"),
        "profile_picture": worker_info.get("profile_picture"),
        "total_applications": total_applications,
        "active_collaborations": total_active
    }
