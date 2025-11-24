from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.dependencies import get_db, get_current_user
# from .. import schemas, crud
from app import schemas, crud
from app.schemas import ListingType, EquipmentCondition, Period

router = APIRouter(prefix="/api/reviews", tags=["reviews"])

@router.post("/{listing_id}", response_model=schemas.ReviewResponse, status_code=201)
def add_review(listing_id: UUID, review: schemas.ReviewCreate, current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        return crud.create_review(db, review, listing_id, current_user_id)
    except ValueError:
        raise HTTPException(status_code=409, detail="Review already exists")