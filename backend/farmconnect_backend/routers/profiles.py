from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.dependencies import get_db, get_current_user
# from .. import schemas, crud
from app import schemas, crud
from app.schemas import ListingType, EquipmentCondition, Period

router = APIRouter(prefix="/api/profiles", tags=["profiles"])

@router.get("/{user_id}", response_model=schemas.ProfileResponse)
def read_profile(user_id: str, current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    profile = crud.get_profile(db, user_id)
    if profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.put("/{user_id}", response_model=schemas.ProfileResponse)
def update_profile(user_id: str, profile_update: schemas.ProfileUpdate, current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return crud.update_profile(db, user_id, profile_update)