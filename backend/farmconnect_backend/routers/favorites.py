from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.dependencies import get_db, get_current_user
# from .. import schemas, crud
from app import schemas, crud
from app.schemas import ListingType, EquipmentCondition, Period

router = APIRouter(prefix="/api/favorites", tags=["favorites"])

@router.post("/{listing_id}", response_model=schemas.FavoriteResponse, status_code=201)
def add_favorite(listing_id: UUID, current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        return crud.create_favorite(db, schemas.FavoriteCreate(listing_id=listing_id), current_user_id)
    except ValueError:
        raise HTTPException(status_code=409, detail="Favorite already exists")

@router.delete("/{listing_id}", status_code=204)
def remove_favorite(listing_id: UUID, current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        crud.delete_favorite(db, listing_id, current_user_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Favorite not found")