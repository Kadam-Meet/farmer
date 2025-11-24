from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.dependencies import get_db, get_current_user
# from .. import schemas, crud
from app import schemas, crud
from app.schemas import ListingType, EquipmentCondition, Period

router = APIRouter(prefix="/api/messages", tags=["messages"])

@router.post("/", response_model=schemas.MessageResponse)
def create_message(message: schemas.MessageCreate, current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.create_message(db=db, message=message, sender_id=current_user_id)

@router.get("/{listing_id}", response_model=List[schemas.MessageResponse])
def read_messages(listing_id: UUID, limit: int = 50, current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_messages(db=db, listing_id=listing_id, user_id=current_user_id, limit=limit)