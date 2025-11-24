from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.dependencies import get_db, get_current_user
# from .. import schemas, crud
from app import schemas, crud
from app.schemas import ListingType, EquipmentCondition, Period

router = APIRouter(prefix="/api/bookings", tags=["bookings"])

@router.post("/", response_model=schemas.BookingResponse)
def create_booking(booking: schemas.BookingCreate, current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        return crud.create_booking(db=db, booking=booking, renter_id=current_user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[schemas.BookingResponse])
def read_bookings(filters: schemas.BookingFilter = Depends(), current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_bookings(db=db, user_id=current_user_id, filters=filters)

@router.patch("/{booking_id}/status", response_model=schemas.BookingResponse)
def update_status(booking_id: UUID, status_update: schemas.BookingStatusUpdate, current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        return crud.update_booking_status(db, booking_id, status_update.status, current_user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))