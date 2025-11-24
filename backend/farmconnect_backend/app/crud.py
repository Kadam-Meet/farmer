# from sqlalchemy.orm import Session
# from sqlalchemy import and_, or_, func, text
# from typing import List, Optional
# from typing import List
# from fastapi import UploadFile
# from uuid import UUID
# from datetime import date
# from .utils import geocode_address, haversine
# from . import models, schemas
# from .models import ListingType, EquipmentCondition, BookingStatus
# import math

# def get_profile(db: Session, user_id: str) -> Optional[models.Profile]:
#     return db.query(models.Profile).filter(models.Profile.user_id == user_id).first()

# def create_profile(db: Session, profile: schemas.ProfileCreate, user_id: str) -> models.Profile:
#     db_profile = models.Profile(**profile.dict(), user_id=user_id)
#     db.add(db_profile)
#     db.commit()
#     db.refresh(db_profile)
#     return db_profile

# def update_profile(db: Session, user_id: str, profile_update: schemas.ProfileUpdate) -> models.Profile:
#     profile = get_profile(db, user_id)
#     if not profile:
#         raise ValueError("Profile not found")
#     update_data = profile_update.dict(exclude_unset=True)
#     for field, value in update_data.items():
#         setattr(profile, field, value)
#     db.commit()
#     db.refresh(profile)
#     return profile

# # Listings CRUD
# def create_listing(db: Session, listing: schemas.ListingCreate, owner_id: str) -> models.Listing:
#     image_url = upload_images(files)
#     listing_dict = listing_data.copy()
#     listing_dict['image_url'] = image_url

#     if not listing_dict.get('latitude') or not listing_dict.get('longitude'):
#         coords = geocode_address(
#             listing_dict['location'],
#             listing_dict.get('city'),
#             listing_dict.get('state'),
#             listing_dict.get('pincode')
#         )
#         if coords:
#             listing_dict['latitude'], listing_dict['longitude'] = coords
#     # db_listing = models.Listing(**listing.dict(), owner_id=owner_id)
#     # db.add(db_listing)
#     # db.commit()
#     # db.refresh(db_listing)
    
#     # return db_listing

#     db_listing = models.Listing(**listing_dict, owner_id=owner_id)
#     db.add(db_listing)
#     db.commit()
#     db.refresh(db_listing)
#     return db_listing

# # def get_listings(db: Session, filters: schemas.ListingFilter) -> List[models.Listing]:
# #     query = db.query(models.Listing)

# def get_listings(db: Session, filters: schemas.ListingFilter) -> List[models.Listing]:
#     query = db.query(models.Listing).filter(models.Listing.available == True)
    
#     if filters.q:
#         search = f"%{filters.q}%"
#         query = query.filter(or_(models.Listing.title.ilike(search), models.Listing.description.ilike(search)))
    
#     if filters.type:
#         query = query.filter(models.Listing.type == filters.type)
    
#     if filters.category:
#         query = query.filter(models.Listing.category.ilike(f"%{filters.category}%"))
    
#     if filters.brand:
#         query = query.filter(models.Listing.brand.ilike(f"%{filters.brand}%"))
    
#     if filters.condition:
#         query = query.filter(models.Listing.condition == filters.condition)
    
#     if filters.price_min is not None:
#         query = query.filter(models.Listing.price_per_day >= filters.price_min)
    
#     if filters.price_max is not None:
#         query = query.filter(models.Listing.price_per_day <= filters.price_max)
    
#     if filters.location:
#         query = query.filter(models.Listing.location.ilike(f"%{filters.location}%"))
    
#     if filters.pincode:
#         query = query.filter(models.Listing.pincode == filters.pincode)
    
#     if filters.available is not None:
#         query = query.filter(models.Listing.available == filters.available)
    
#     # Distance filter (if lat/long provided in filters, but for simplicity, assume user lat/long passed separately)
#     # To add: if user_lat, user_long: use haversine formula via raw SQL

#     # Enhanced price filters by period
#     if filters.price_min_day is not None:
#         query = query.filter(models.Listing.price_per_day >= filters.price_min_day)
#     if filters.price_max_day is not None:
#         query = query.filter(models.Listing.price_per_day <= filters.price_max_day)
#     # Similarly for hour, week, month...
#     if filters.price_min_week is not None:
#         query = query.filter(models.Listing.price_per_week >= filters.price_min_week)
#     if filters.price_max_week is not None:
#         query = query.filter(models.Listing.price_per_week <= filters.price_max_week)
#     # Add for month/hour if needed
    
#     # Distance filter
#     if filters.user_lat is not None and filters.user_long is not None and filters.distance_km:
#         # Subquery or post-filter for distance (SQLAlchemy raw for efficiency)
#         from sqlalchemy import case
#         query = query.filter(
#             func.sqrt(
#                 (models.Listing.latitude - filters.user_lat) ** 2 + (models.Listing.longitude - filters.user_long) ** 2
#             ) * 111.32 <= filters.distance_km  # Approx km conversion (simple Euclidean; use Haversine for precision)
#         )  # Note: For exact, use raw SQL with haversine, but this is fast approx.
    
#     query = query.order_by(models.Listing.created_at.desc()).limit(filters.limit).offset(filters.offset)
#     return query.all()

# def get_listing(db: Session, listing_id: UUID) -> Optional[models.Listing]:
#     return db.query(models.Listing).filter(models.Listing.id == listing_id).first()

# def update_listing(db: Session, listing_id: UUID, listing_update: dict) -> models.Listing:
#     listing = get_listing(db, listing_id)
#     if not listing:
#         raise ValueError("Listing not found")
#     for field, value in listing_update.items():
#         setattr(listing, field, value)
#     db.commit()
#     db.refresh(listing)
#     return listing

# # Bookings CRUD
# def create_booking(db: Session, booking: schemas.BookingCreate, renter_id: str) -> models.Booking:
#     listing = get_listing(db, booking.listing_id)
#     if not listing or not listing.available:
#         raise ValueError("Listing not available")
    
#     # Auto-set owner_id and total_price (simple: price_per_day * days; extend for period)
#     # days = (booking.end_date - booking.start_date).days
#     # total_price = listing.price_per_day * days

#     days = (booking.end_date - booking.start_date).days or 1
#     # Enhanced: Use period to calc rate
#     if listing.period == Period.week:
#         daily_rate = listing.price_per_week / 7 if listing.price_per_week else listing.price_per_day or 0
#     elif listing.period == Period.month:
#         daily_rate = listing.price_per_month / 30 if listing.price_per_month else listing.price_per_day or 0
#     elif listing.period == Period.hour:
#         daily_rate = (listing.price_per_hour * 24) if listing.price_per_hour else listing.price_per_day or 0
#     else:
#         daily_rate = listing.price_per_day or 0
    
#     total_price = daily_rate * days
    
#     db_booking = models.Booking(
#         **booking.dict(),
#         renter_id=renter_id,
#         owner_id=listing.owner_id,
#         total_price=total_price
#     )
#     db.add(db_booking)
#     listing.available = False  # Mark as unavailable
#     db.commit()
#     db.refresh(db_booking)
#     return db_booking

# def get_bookings(db: Session, user_id: str, filters: schemas.BookingFilter) -> List[models.Booking]:
#     query = db.query(models.Booking).join(models.Listing)
    
#     if filters.status:
#         query = query.filter(models.Booking.status == filters.status)
    
#     if filters.role == "owner":
#         query = query.filter(models.Booking.owner_id == user_id)
#     elif filters.role == "renter":
#         query = query.filter(models.Booking.renter_id == user_id)
#     # else: all (both owner or renter)
#     else:
#         query = query.filter(or_(models.Booking.owner_id == user_id, models.Booking.renter_id == user_id))
    
#     query = query.order_by(models.Booking.created_at.desc()).limit(filters.limit).offset(filters.offset)
#     return query.all()

# def update_booking_status(db: Session, booking_id: UUID, status: BookingStatus, user_id: str) -> models.Booking:
#     booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
#     if not booking:
#         raise ValueError("Booking not found")
#     if booking.owner_id != user_id and booking.renter_id != user_id:
#         raise ValueError("Unauthorized to update")
#     booking.status = status
#     db.commit()
#     db.refresh(booking)
#     return booking

# # Messages CRUD
# def create_message(db: Session, message: schemas.MessageCreate, sender_id: str) -> models.Message:
#     db_message = models.Message(**message.dict(), sender_id=sender_id)
#     db.add(db_message)
#     db.commit()
#     db.refresh(db_message)
#     return db_message

# def get_messages(db: Session, listing_id: UUID, user_id: str, limit: int = 50) -> List[models.Message]:
#     query = db.query(models.Message).filter(
#         models.Message.listing_id == listing_id,
#         or_(models.Message.sender_id == user_id, models.Message.receiver_id == user_id)
#     ).order_by(models.Message.created_at.asc())
#     return query.limit(limit).all()

# # Favorites CRUD
# def create_favorite(db: Session, favorite: schemas.FavoriteCreate, user_id: str) -> models.Favorite:
#     # Check if exists
#     existing = db.query(models.Favorite).filter(models.Favorite.user_id == user_id, models.Favorite.listing_id == favorite.listing_id).first()
#     if existing:
#         raise ValueError("Favorite already exists")
#     db_favorite = models.Favorite(**favorite.dict(), user_id=user_id)
#     db.add(db_favorite)
#     db.commit()
#     db.refresh(db_favorite)
#     return db_favorite

# def delete_favorite(db: Session, listing_id: UUID, user_id: str) -> bool:
#     favorite = db.query(models.Favorite).filter(models.Favorite.user_id == user_id, models.Favorite.listing_id == listing_id).first()
#     if not favorite:
#         raise ValueError("Favorite not found")
#     db.delete(favorite)
#     db.commit()
#     return True

# # Reviews CRUD
# def create_review(db: Session, review: schemas.ReviewCreate, listing_id: UUID, user_id: str) -> models.Review:
#     # Check if user already reviewed
#     existing = db.query(models.Review).filter(models.Review.listing_id == listing_id, models.Review.user_id == user_id).first()
#     if existing:
#         raise ValueError("Review already exists")
#     db_review = models.Review(**review.dict(), listing_id=listing_id, user_id=user_id)
#     db.add(db_review)
#     db.commit()
#     db.refresh(db_review)
    
#     # Update listing rating (average)
#     avg_rating = db.query(func.avg(models.Review.rating)).filter(models.Review.listing_id == listing_id).scalar() or 0
#     listing = get_listing(db, listing_id)
#     listing.rating = round(avg_rating, 2)
#     db.commit()
#     return db_review




from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, text
from typing import List, Optional
from uuid import UUID
from datetime import date
from app import models, schemas
from app.models import ListingType, EquipmentCondition, BookingStatus, Period
from app.utils import upload_images
from fastapi import UploadFile
import math

def get_profile(db: Session, user_id: str) -> Optional[models.Profile]:
    return db.query(models.Profile).filter(models.Profile.user_id == user_id).first()

def create_profile(db: Session, profile: schemas.ProfileCreate, user_id: str) -> models.Profile:
    db_profile = models.Profile(**profile.dict(), user_id=user_id)
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

def update_profile(db: Session, user_id: str, profile_update: schemas.ProfileUpdate) -> models.Profile:
    profile = get_profile(db, user_id)
    if not profile:
        raise ValueError("Profile not found")
    update_data = profile_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile

# Listings CRUD
def create_listing(db: Session, listing_data: dict, owner_id: str, files: List[UploadFile]) -> models.Listing:
    # Upload images first
    image_url = upload_images(files)
    listing_dict = listing_data.copy()
    listing_dict['image_url'] = image_url
    
    # Geocode if lat/long not provided
    from app.utils import geocode_address
    if not listing_dict.get('latitude') or not listing_dict.get('longitude'):
        coords = geocode_address(
            listing_dict['location'],
            listing_dict.get('city'),
            listing_dict.get('state'),
            listing_dict.get('pincode')
        )
        if coords:
            listing_dict['latitude'], listing_dict['longitude'] = coords
    
    db_listing = models.Listing(**listing_dict, owner_id=owner_id)
    db.add(db_listing)
    db.commit()
    db.refresh(db_listing)
    return db_listing

def get_listings(db: Session, filters: schemas.ListingFilter) -> List[models.Listing]:
    query = db.query(models.Listing)
    
    if filters.q:
        search = f"%{filters.q}%"
        query = query.filter(or_(models.Listing.title.ilike(search), models.Listing.description.ilike(search)))
    
    if filters.type:
        query = query.filter(models.Listing.type == filters.type)
    
    if filters.category:
        query = query.filter(models.Listing.category.ilike(f"%{filters.category}%"))
    
    if filters.brand:
        query = query.filter(models.Listing.brand.ilike(f"%{filters.brand}%"))
    
    if filters.condition:
        query = query.filter(models.Listing.condition == filters.condition)
    
    if filters.price_min_day is not None:
        query = query.filter(models.Listing.price_per_day >= filters.price_min_day)
    
    if filters.price_max_day is not None:
        query = query.filter(models.Listing.price_per_day <= filters.price_max_day)
    
    if filters.price_min_week is not None:
        query = query.filter(models.Listing.price_per_week >= filters.price_min_week)
    
    if filters.price_max_week is not None:
        query = query.filter(models.Listing.price_per_week <= filters.price_max_week)
    
    if filters.location:
        query = query.filter(models.Listing.location.ilike(f"%{filters.location}%"))
    
    if filters.pincode:
        query = query.filter(models.Listing.pincode == filters.pincode)
    
    if filters.available is not None:
        query = query.filter(models.Listing.available == filters.available)
    
    # Distance filter (if user_lat/long provided)
    if filters.user_lat is not None and filters.user_long is not None:
        # Simple Euclidean approx for filtering (use haversine post-query for exact if needed)
        from app.utils import haversine
        # For SQL efficiency, use raw SQL haversine or approx
        query = query.filter(
            func.sqrt(
                func.pow(models.Listing.latitude - filters.user_lat, 2) + 
                func.pow(models.Listing.longitude - filters.user_long, 2)
            ) * 111.32 <= filters.distance_km  # Rough km conversion
        )
    
    query = query.order_by(models.Listing.created_at.desc()).limit(filters.limit).offset(filters.offset)
    return query.all()

def get_listing(db: Session, listing_id: UUID) -> Optional[models.Listing]:
    return db.query(models.Listing).filter(models.Listing.id == listing_id).first()

def update_listing(db: Session, listing_id: UUID, listing_update: dict) -> models.Listing:
    listing = get_listing(db, listing_id)
    if not listing:
        raise ValueError("Listing not found")
    for field, value in listing_update.items():
        setattr(listing, field, value)
    db.commit()
    db.refresh(listing)
    return listing

# Bookings CRUD
def create_booking(db: Session, booking: schemas.BookingCreate, renter_id: str) -> models.Booking:
    listing = get_listing(db, booking.listing_id)
    if not listing or not listing.available:
        raise ValueError("Listing not available")
    
    days = (booking.end_date - booking.start_date).days or 1
    # Enhanced: Use period to calc rate
    if listing.period == Period.week:
        daily_rate = listing.price_per_week / 7 if listing.price_per_week else listing.price_per_day or 0
    elif listing.period == Period.month:
        daily_rate = listing.price_per_month / 30 if listing.price_per_month else listing.price_per_day or 0
    elif listing.period == Period.hour:
        daily_rate = (listing.price_per_hour * 24) if listing.price_per_hour else listing.price_per_day or 0
    else:
        daily_rate = listing.price_per_day or 0
    
    total_price = daily_rate * days
    
    db_booking = models.Booking(
        **booking.dict(),
        renter_id=renter_id,
        owner_id=listing.owner_id,
        total_price=total_price
    )
    db.add(db_booking)
    listing.available = False  # Mark as unavailable
    db.commit()
    db.refresh(db_booking)
    return db_booking

def get_bookings(db: Session, user_id: str, filters: schemas.BookingFilter) -> List[models.Booking]:
    query = db.query(models.Booking).join(models.Listing)
    
    if filters.status:
        query = query.filter(models.Booking.status == filters.status)
    
    if filters.role == "owner":
        query = query.filter(models.Booking.owner_id == user_id)
    elif filters.role == "renter":
        query = query.filter(models.Booking.renter_id == user_id)
    else:
        query = query.filter(or_(models.Booking.owner_id == user_id, models.Booking.renter_id == user_id))
    
    query = query.order_by(models.Booking.created_at.desc()).limit(filters.limit).offset(filters.offset)
    return query.all()

def update_booking_status(db: Session, booking_id: UUID, status: BookingStatus, user_id: str) -> models.Booking:
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise ValueError("Booking not found")
    if booking.owner_id != user_id and booking.renter_id != user_id:
        raise ValueError("Unauthorized to update")
    booking.status = status
    db.commit()
    db.refresh(booking)
    return booking

# Messages CRUD
def create_message(db: Session, message: schemas.MessageCreate, sender_id: str) -> models.Message:
    db_message = models.Message(**message.dict(), sender_id=sender_id)
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

def get_messages(db: Session, listing_id: UUID, user_id: str, limit: int = 50) -> List[models.Message]:
    query = db.query(models.Message).filter(
        models.Message.listing_id == listing_id,
        or_(models.Message.sender_id == user_id, models.Message.receiver_id == user_id)
    ).order_by(models.Message.created_at.asc())
    return query.limit(limit).all()

# Favorites CRUD
def create_favorite(db: Session, favorite: schemas.FavoriteCreate, user_id: str) -> models.Favorite:
    # Check if exists
    existing = db.query(models.Favorite).filter(models.Favorite.user_id == user_id, models.Favorite.listing_id == favorite.listing_id).first()
    if existing:
        raise ValueError("Favorite already exists")
    db_favorite = models.Favorite(**favorite.dict(), user_id=user_id)
    db.add(db_favorite)
    db.commit()
    db.refresh(db_favorite)
    return db_favorite

def delete_favorite(db: Session, listing_id: UUID, user_id: str) -> bool:
    favorite = db.query(models.Favorite).filter(models.Favorite.user_id == user_id, models.Favorite.listing_id == listing_id).first()
    if not favorite:
        raise ValueError("Favorite not found")
    db.delete(favorite)
    db.commit()
    return True

# Reviews CRUD
def create_review(db: Session, review: schemas.ReviewCreate, listing_id: UUID, user_id: str) -> models.Review:
    # Check if user already reviewed
    existing = db.query(models.Review).filter(models.Review.listing_id == listing_id, models.Review.user_id == user_id).first()
    if existing:
        raise ValueError("Review already exists")
    db_review = models.Review(**review.dict(), listing_id=listing_id, user_id=user_id)
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    
    # Update listing rating (average)
    avg_rating = db.query(func.avg(models.Review.rating)).filter(models.Review.listing_id == listing_id).scalar() or 0
    listing = get_listing(db, listing_id)
    listing.rating = round(avg_rating, 2)
    db.commit()
    return db_review