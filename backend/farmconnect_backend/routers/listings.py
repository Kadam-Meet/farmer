# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from typing import List
# from uuid import UUID
# from ..dependencies import get_db, get_current_user
# from .. import schemas, crud
# from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File
# from typing import List

# router = APIRouter(prefix="/api/listings", tags=["listings"])

# # @router.post("/", response_model=schemas.ListingResponse)
# # def create_listing(listing: schemas.ListingCreate, current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
# #     return crud.create_listing(db=db, listing=listing, owner_id=current_user_id)

# # @router.get("/", response_model=List[schemas.ListingResponse])
# # def read_listings(filters: schemas.ListingFilter = Depends(), db: Session = Depends(get_db)):
# #     # Public endpoint - no auth needed
# #     return crud.get_listings(db=db, filters=filters)

# # @router.get("/{listing_id}", response_model=schemas.ListingResponse)
# # def read_listing(listing_id: UUID, db: Session = Depends(get_db)):
# #     db_listing = crud.get_listing(db, listing_id)
# #     if db_listing is None:
# #         raise HTTPException(status_code=404, detail="Listing not found")
# #     return db_listing

# @router.post("/", response_model=schemas.ListingResponse)
# def create_listing(
#     type: ListingType = Form(...),
#     title: str = Form(...),
#     description: Optional[str] = Form(None),
#     category: str = Form(...),
#     brand: Optional[str] = Form(None),
#     period: Period = Form("day"),
#     price_per_hour: Optional[float] = Form(None),
#     price_per_day: Optional[float] = Form(None),
#     price_per_week: Optional[float] = Form(None),
#     price_per_month: Optional[float] = Form(None),
#     location: str = Form(...),
#     pincode: Optional[str] = Form(None),
#     city: Optional[str] = Form(None),
#     state: Optional[str] = Form(None),
#     condition: Optional[EquipmentCondition] = Form(None),
#     area: Optional[float] = Form(None),
#     images: List[UploadFile] = File(...),  # Multiple files
#     current_user_id: str = Depends(get_current_user),
#     db: Session = Depends(get_db)
# ):
#     listing_data = {
#         "type": type,
#         "title": title,
#         "description": description,
#         "category": category,
#         "brand": brand,
#         "period": period,
#         "price_per_hour": price_per_hour,
#         "price_per_day": price_per_day,
#         "price_per_week": price_per_week,
#         "price_per_month": price_per_month,
#         "location": location,
#         "pincode": pincode,
#         "city": city,
#         "state": state,
#         "condition": condition,
#         "area": area,
#     }
#     try:
#         return crud.create_listing(db=db, listing_data=listing_data, owner_id=current_user_id, files=images)
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Creation failed: {str(e)}")
    
# @router.get("/", response_model=List[schemas.ListingResponse])
# def read_listings(
#     q: Optional[str] = None,
#     type: Optional[ListingType] = None,
#     category: Optional[str] = None,
#     brand: Optional[str] = None,
#     condition: Optional[EquipmentCondition] = None,
#     price_min_day: Optional[float] = None,
#     price_max_day: Optional[float] = None,
#     price_min_week: Optional[float] = None,
#     price_max_week: Optional[float] = None,
#     # ... add other price params ...
#     location: Optional[str] = None,
#     pincode: Optional[str] = None,
#     available: Optional[bool] = None,
#     user_lat: Optional[float] = None,
#     user_long: Optional[float] = None,
#     distance_km: Optional[float] = 100.0,
#     limit: int = Query(20, ge=1, le=100),
#     offset: int = 0,
#     db: Session = Depends(get_db)
# ):
#     filters = schemas.ListingFilter(
#         q=q, type=type, category=category, brand=brand, condition=condition,
#         price_min_day=price_min_day, price_max_day=price_max_day,
#         price_min_week=price_min_week, price_max_week=price_max_week,
#         # ... map others ...
#         location=location, pincode=pincode, available=available,
#         user_lat=user_lat, user_long=user_long, distance_km=distance_km,
#         limit=limit, offset=offset
#     )
#     return crud.get_listings(db=db, filters=filters)

# @router.put("/{listing_id}", response_model=schemas.ListingResponse)
# def update_listing(listing_id: UUID, listing_update: schemas.ListingBase, current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
#     db_listing = crud.get_listing(db, listing_id)
#     if db_listing is None or db_listing.owner_id != current_user_id:
#         raise HTTPException(status_code=404, detail="Listing not found")
#     return crud.update_listing(db, listing_id, listing_update.dict(exclude_unset=True))







from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.dependencies import get_db, get_current_user
# from .. import schemas, crud
# from ..schemas import ListingType, EquipmentCondition, Period
from app import schemas, crud
from app.schemas import ListingType, EquipmentCondition, Period

router = APIRouter(prefix="/api/listings", tags=["listings"])

@router.post("/", response_model=schemas.ListingResponse)
def create_listing(
    type: ListingType = Form(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    category: str = Form(...),
    brand: Optional[str] = Form(None),
    period: Period = Form(Period.day),
    price_per_hour: Optional[float] = Form(None),
    price_per_day: Optional[float] = Form(None),
    price_per_week: Optional[float] = Form(None),
    price_per_month: Optional[float] = Form(None),
    location: str = Form(...),
    pincode: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    state: Optional[str] = Form(None),
    condition: Optional[EquipmentCondition] = Form(None),
    area: Optional[float] = Form(None),
    images: List[UploadFile] = File(...),  # Multiple files
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    listing_data = {
        "type": type,
        "title": title,
        "description": description,
        "category": category,
        "brand": brand,
        "period": period,
        "price_per_hour": price_per_hour,
        "price_per_day": price_per_day,
        "price_per_week": price_per_week,
        "price_per_month": price_per_month,
        "location": location,
        "pincode": pincode,
        "city": city,
        "state": state,
        "condition": condition,
        "area": area,
    }
    try:
        return crud.create_listing(db=db, listing_data=listing_data, owner_id=current_user_id, files=images)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Creation failed: {str(e)}")
    
@router.get("/", response_model=List[schemas.ListingResponse])
def read_listings(
    q: Optional[str] = Query(None),
    type: Optional[ListingType] = Query(None),
    category: Optional[str] = Query(None),
    brand: Optional[str] = Query(None),
    condition: Optional[EquipmentCondition] = Query(None),
    price_min_day: Optional[float] = Query(None),
    price_max_day: Optional[float] = Query(None),
    price_min_week: Optional[float] = Query(None),
    price_max_week: Optional[float] = Query(None),
    # ... add other price params ...
    location: Optional[str] = Query(None),
    pincode: Optional[str] = Query(None),
    available: Optional[bool] = Query(None),
    user_lat: Optional[float] = Query(None),
    user_long: Optional[float] = Query(None),
    distance_km: Optional[float] = Query(100.0),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0),
    db: Session = Depends(get_db)
):
    filters = schemas.ListingFilter(
        q=q, type=type, category=category, brand=brand, condition=condition,
        price_min_day=price_min_day, price_max_day=price_max_day,
        price_min_week=price_min_week, price_max_week=price_max_week,
        # ... map others ...
        location=location, pincode=pincode, available=available,
        user_lat=user_lat, user_long=user_long, distance_km=distance_km,
        limit=limit, offset=offset
    )
    return crud.get_listings(db=db, filters=filters)

@router.get("/{listing_id}", response_model=schemas.ListingResponse)
def read_listing(listing_id: UUID, db: Session = Depends(get_db)):
    db_listing = crud.get_listing(db, listing_id)
    if db_listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    return db_listing

@router.put("/{listing_id}", response_model=schemas.ListingResponse)
def update_listing(listing_id: UUID, listing_update: schemas.ListingBase, current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    db_listing = crud.get_listing(db, listing_id)
    if db_listing is None or db_listing.owner_id != current_user_id:
        raise HTTPException(status_code=404, detail="Listing not found")
    return crud.update_listing(db, listing_id, listing_update.dict(exclude_unset=True))