from fastapi import APIRouter, HTTPException
from supabase import create_client, Client
from dotenv import load_dotenv
import os
from datetime import datetime
from models import FarmerRegistration, JobListings, FeedbackModel, Collaboration
from schema import (
     FarmerUpdate, WorkerSearchFilter, 
    SendRequest, UpdateRequestStatus, FeedbackInput, JobCreate
)

# Initialize Router
router = APIRouter()

# Load Supabase environment variables
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# ==========================================================
# 🔧 Helper Function: Convert datetime fields to ISO format
# ==========================================================
def convert_datetime_to_iso(data_dict: dict):
    for key, value in data_dict.items():
        if isinstance(value, datetime):
            data_dict[key] = value.isoformat()
    return data_dict


# ==========================================================
# 1️⃣ FARMER REGISTRATION
# ==========================================================
@router.post("/register")
def register_farmer(data: FarmerRegistration):
    existing = supabase.table("farmer_registration").select("*").eq("email", data.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered. Please login instead.")

    data_dict = data.dict()
    
    data_dict = convert_datetime_to_iso(data_dict)

    result = supabase.table("farmer_registration").insert(data_dict).execute()
    return {"message": "Farmer registered successfully", "data": result.data}


# ==========================================================
# 3️⃣ UPDATE FARMER PROFILE
# ==========================================================
# @router.put("/update_profile/{email}")
# def update_farmer_profile(email: str, updates: FarmerUpdate):
#     existing = supabase.table("farmer_registration").select("*").eq("email", email).execute()
#     if not existing.data:
#         raise HTTPException(status_code=404, detail="Farmer not found.")

#     update_data = updates.dict(exclude_unset=True)
#     update_data = convert_datetime_to_iso(update_data)

#     supabase.table("farmer_registration").update(update_data).eq("email", email).execute()

#     updated = supabase.table("farmer_registration").select("*").eq("email", email).execute()
#     return {"message": "Profile updated successfully.", "updated_profile": updated.data[0]}

@router.put("/update_profile/{id}")
def update_farmer_profile(id: str, updates: FarmerUpdate):
    existing = supabase.table("farmer_registration").select("*").eq("id", id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Farmer not found.")

    update_data = updates.dict(exclude_unset=True)
    update_data.pop("email", None)  # ✅ Prevent updating email
    update_data = convert_datetime_to_iso(update_data)

    supabase.table("farmer_registration").update(update_data).eq("id", id).execute()
    print("Received update data:", update_data)

    updated = supabase.table("farmer_registration").select("*").eq("id", id).execute()

    # # ✅ Add Base64 image handling
    # if updated.data[0].get("profile_picture"):
    #     updated.data[0]["profile_picture"] = f"data:image/jpeg;base64,{updated.data[0]['profile_picture']}"
    # print("Updated profile data:", updated.data[0])
    # ✅ Hide email
    updated.data[0].pop("email", None)
     
    return {"message": "Profile updated successfully.", "updated_profile": updated.data[0]}

# @router.get("/profile/{id}")

# def get_farmer_profile(id: str):    
#     print("Fetching profile for farmer ID:", id)
#     farmer = supabase.table("farmer_registration").select("*").eq("id", id).execute()
#     print(farmer) 
#     if not farmer.data:
#         raise HTTPException(status_code=404, detail="Farmer not found.")
#     return farmer.data[0]
@router.get("/profile/{id}")
def get_farmer_profile(id: str):
    print("Fetching profile for farmer ID:", id)
    farmer = supabase.table("farmer_registration").select("*").eq("id", id).execute()

    if not farmer.data:
        raise HTTPException(status_code=404, detail="Farmer not found.")

    profile = farmer.data[0]

    # ✅ Convert Base64 string to data URL for frontend display
    # if profile.get("profile_picture"):
    #     profile["profile_picture"] = f"data:image/jpeg;base64,{profile['profile_picture']}"

    # ✅ Do not return email (hide from frontend)
    if "email" in profile:
        del profile["email"]

    return profile

# ==========================================================
# 4️⃣ POST JOB
# ==========================================================
@router.post("/post_job")
def post_job(job: JobListings):
    
    farmer_check = supabase.table("farmer_registration").select("*").eq("id", job.farmer_id).execute()

    if not farmer_check.data:
        raise HTTPException(status_code=404, detail="Farmer not found.")

    job_data = job.dict()
    job_data.pop("job_id", None)
    job_data["created_at"] = datetime.now().isoformat()

    result = supabase.table("job_listings").insert(job_data).execute()
    return {"message": "Job posted successfully.", "data": result.data}

# ==========================================================
# 5️⃣ VIEW ALL WORKERS
# ==========================================================
@router.get("/all_workers")
def get_all_workers():
    workers = supabase.table("worker_registration").select("*").execute()
    if not workers.data:
        return {"workers": []}
    return {"workers": workers.data}

# ==========================================================
# 5️⃣ VIEW JOBS BY FARMER
# ==========================================================
@router.get("/jobs/{farmer_id}")
def get_farmer_jobs(farmer_id: str):
    jobs = supabase.table("job_listings").select("*").eq("farmer_id", farmer_id).execute()
    return {"jobs": jobs.data} 




@router.delete("/delete_job/{job_id}")
def delete_job(job_id: int):
    existing = supabase.table("job_listings").select("*").eq("job_id", job_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Job not found.")

    supabase.table("job_listings").delete().eq("job_id", job_id).execute()
    return {"message": "Job deleted successfully."}

# @router.view("/job/{job_id}")
# def get_job_details(job_id: int):
#     job = supabase.table("job_listings").select("*").eq("job_id", job_id).execute()
#     if not job.data:
#         raise HTTPException(status_code=404, detail="Job not found.")
#     return job.data[0] 

# ==========================================================
# 6️⃣ SEND REQUEST (Farmer → Worker)
# ==========================================================
# ==========================================================
# 🔧 Helper: safely serialize datetimes before insert/update
# ==========================================================
def serialize_datetimes(data: dict):
    for key, value in data.items():
        if isinstance(value, datetime):
            data[key] = value.isoformat()
    return data

@router.post("/send_request")
def send_request(data: Collaboration):
    """Farmer sends a work request to a worker for a specific job."""

    # ✅ Use user_id instead of farmer_id/worker_id
    farmer = supabase.table("farmer_registration").select("*").eq("id", data.farmer_id).execute()
    if not farmer.data:
        raise HTTPException(status_code=404, detail="Farmer not found.")

    worker = supabase.table("worker_registration").select("*").eq("id", data.worker_id).execute()
    if not worker.data:
        raise HTTPException(status_code=404, detail="Worker not found.")

    job = supabase.table("job_listings").select("*").eq("job_id", data.job_id).execute()
    if not job.data:
        raise HTTPException(status_code=404, detail="Job not found.")

    existing = (
        supabase.table("collaborations")
        .select("*")
        .eq("farmer_id", data.farmer_id)
        .eq("worker_id", data.worker_id)
        .eq("job_id", data.job_id)
        .execute()
    )

    if existing.data:
        raise HTTPException(status_code=400, detail="Request already sent for this job.")

    data_dict = data.dict()
    data_dict.pop("collaboration_id", None)
    data_dict["status"] = "Pending"
    data_dict["accepted_by_farmer"] = True
    data_dict["requested_at"] = datetime.utcnow()
    data_dict = serialize_datetimes(data_dict)

    result = supabase.table("collaborations").insert(data_dict).execute()
    return {"message": "Request sent successfully to worker.", "data": result.data}

# ==========================================================
# 7️⃣ VIEW SENT REQUESTS (Farmer)
# ==========================================================
# ==========================================================
@router.get("/sent_requests/{farmer_id}")
def view_sent_requests(farmer_id: str):

    # Fetch only farmer-sent requests
    requests = (
        supabase.table("collaborations")
        .select("*")
        .eq("farmer_id", farmer_id)
        .eq("accepted_by_farmer", True)  
        .eq("accepted_by_worker", False) # farmer has sent request

        .execute()
    )

    if not requests.data:
        return {"sent_requests": []}

    enriched = []

    for req in requests.data:

        worker = (
            supabase.table("worker_registration")
            .select("name, job_expertise, city, state")
            .eq("id", req["worker_id"])
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
            "worker_details": worker.data[0] if worker.data else {},
            "job_details": job.data[0] if job.data else {},
            "status": req["status"],
            "accepted_by_farmer": req["accepted_by_farmer"],
            "accepted_by_worker": req["accepted_by_worker"],
            "requested_at": req["requested_at"]
        })

    return {"sent_requests": enriched}


# ==========================================================
@router.get("/received_requests/{farmer_id}")
def view_received_requests(farmer_id: str):

    # Fetch all pending collaboration requests sent TO the farmer
    requests = (
        supabase.table("collaborations")
        .select("*")
        .eq("farmer_id", farmer_id)
        .eq("status", "Pending")            # farmer has not accepted yet
        .eq("accepted_by_farmer", False)     # must show in received section
        .execute()
    )

    if not requests.data:
        return {"received_requests": []}

    enriched = []

    for req in requests.data:

        # Fetch worker details
        worker = (
            supabase.table("worker_registration")
            .select("name, job_expertise, city, state")
            .eq("id", req["worker_id"])
            .execute()
        )

        # Fetch job details
        job = (
            supabase.table("job_listings")
            .select("job_title, job_description")
            .eq("job_id", req["job_id"])
            .execute()
        )

        enriched.append({
            "collaboration_id": req["collaboration_id"],
            "worker_details": worker.data[0] if worker.data else {},
            "job_details": job.data[0] if job.data else {},
            "status": req["status"],
            "requested_at": req["requested_at"]
        })

    return {"received_requests": enriched}


# ==========================================================
# 8️⃣ UPDATE REQUEST STATUS (Farmer accepts/rejects)
# ==========================================================
@router.put("/update_request_status")
def update_request_status(data: UpdateRequestStatus):
    req = supabase.table("collaborations").select("*").eq("collaboration_id", data.collaboration_id).execute()
    if not req.data:
        raise HTTPException(status_code=404, detail="Collaboration not found.")

    collaboration = req.data[0]
    update_data = {"status": data.status}

    if data.status == "Accepted":
        update_data["accepted_by_farmer"] = True
        if collaboration["accepted_by_worker"]:
            update_data["status"] = "Active"
            update_data["started_at"] = datetime.now().isoformat()

    elif data.status == "Rejected":
         update_data["ended_at"] = datetime.now().isoformat()

    result = supabase.table("collaborations").update(update_data).eq("collaboration_id", data.collaboration_id).execute()
    return {"message": f"Request {data.status.lower()} successfully.", "data": result.data}


#------------------Get Active Collaborations for Farmer---------------------#
@router.get("/active_collaborations/{farmer_id}")
def get_active_collaborations(farmer_id: str):
    """Get all active collaborations for a farmer."""
    collaborations = (
        supabase.table("collaborations")
        .select("*")
        .eq("farmer_id", farmer_id)
        .in_("status", ["Accepted", "Active"])
        .execute()
    )
    if not collaborations.data:
        return {"active_collaborations": []}
    enriched = []
    for collab in collaborations.data:
        worker = (
            supabase.table("worker_registration")
            .select("name, city, state")
            .eq("id", collab["worker_id"])
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
            "worker_details": worker.data[0] if worker.data else {},
            "job_details": job.data[0] if job.data else {},
            "status": collab["status"],
            "started_at": collab.get("started_at"),
        })
    return {"active_collaborations": enriched}

# ==========================================================
# 🔟 END COLLABORATION
# ==========================================================
@router.put("/end_collaboration/{collaboration_id}")
def end_collaboration(collaboration_id: int):
    req = supabase.table("collaborations").select("*").eq("collaboration_id", collaboration_id).execute()
    if not req.data:
        raise HTTPException(status_code=404, detail="Collaboration not found.")

    supabase.table("collaborations").update({
        "status": "Completed",
        "ended_at": datetime.now().isoformat()
    }).eq("collaboration_id", collaboration_id).execute()

    return {"message": "Collaboration ended successfully. Awaiting feedback."}


# ==========================================================
# 1️⃣1️⃣ ADD FEEDBACK (Farmer → Worker)
# ==========================================================
@router.post("/add_feedback")
def add_feedback(data: FeedbackModel):
    req = supabase.table("collaborations").select("*").eq("collaboration_id", data.collaboration_id).execute()
    if not req.data:
        raise HTTPException(status_code=404, detail="Collaboration not found.")

    if req.data[0]["status"] != "Completed":
        raise HTTPException(status_code=400, detail="Feedback can only be added after completion.")

    if not (1 <= data.rating <= 5):
        raise HTTPException(status_code=400, detail="Rating must be an integer between 1 and 5.")

    feedback_data = {
        "collaboration_id": data.collaboration_id,
        "given_by": data.given_by,
        "farmer_id": data.farmer_id,
        "worker_id": data.worker_id,
        "rating": data.rating,
        "review": data.review,
        "created_at": datetime.now().isoformat()
    }

    result = supabase.table("feedback").insert(feedback_data).execute()
    return {"message": f"Feedback by {data.given_by} added successfully.", "data": result.data}





