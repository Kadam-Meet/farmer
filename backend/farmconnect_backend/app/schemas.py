from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum
from uuid import UUID
from datetime import date, datetime
from .models import ListingType, EquipmentCondition, BookingStatus




class ProfileBase(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    pincode: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    avatar_url: Optional[str] = None

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# class ListingBase(BaseModel):
#     type: ListingType
#     title: str
#     description: Optional[str] = None
#     category: str
#     brand: Optional[str] = None
#     price_per_day: float
#     price_per_week: Optional[float] = None
#     price_per_month: Optional[float] = None
#     price_per_hour: Optional[float] = None
#     location: str
#     pincode: Optional[str] = None
#     city: Optional[str] = None
#     state: Optional[str] = None
#     latitude: Optional[float] = None
#     longitude: Optional[float] = None
#     image_url: Optional[str] = None
#     condition: Optional[EquipmentCondition] = None
#     area: Optional[float] = None

class Period(str, Enum):
    hour = "hour"
    day = "day"
    week = "week"
    month = "month"
    
class ListingBase(BaseModel):
    type: ListingType
    title: str
    description: Optional[str] = None
    category: str
    brand: Optional[str] = None
    period: Optional[Period] = Field("day", description="Default pricing period")
    price_per_hour: Optional[float] = None
    price_per_day: Optional[float] = None
    price_per_week: Optional[float] = None
    price_per_month: Optional[float] = None
    location: str
    pincode: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None
    condition: Optional[EquipmentCondition] = None
    area: Optional[float] = None

# class ListingCreate(ListingBase):
#     pass

class ListingCreate(BaseModel):
    type: ListingType = Field(..., description="equipment or land")
    title: str = Field(..., min_length=1)
    description: Optional[str] = None
    category: str = Field(..., min_length=1)
    brand: Optional[str] = None
    period: Period = Field("day")
    price_per_hour: Optional[float] = Field(None, ge=0)
    price_per_day: Optional[float] = Field(None, ge=0)
    price_per_week: Optional[float] = Field(None, ge=0)
    price_per_month: Optional[float] = Field(None, ge=0)
    location: str = Field(..., min_length=1)
    pincode: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    condition: Optional[EquipmentCondition] = None
    area: Optional[float] = None

class ListingResponse(ListingBase):
    id: UUID
    owner_id: UUID
    available: bool
    rating: float
    created_at: datetime
    updated_at: datetime
    owner: Optional[ProfileResponse] = None
# class ListingFilter(BaseModel):
#     q: Optional[str] = None
#     type: Optional[ListingType] = None
#     category: Optional[str] = None
#     brand: Optional[str] = None
#     condition: Optional[EquipmentCondition] = None
#     # Period-specific prices
#     price_min_hour: Optional[float] = None
#     price_max_hour: Optional[float] = None
#     price_min_day: Optional[float] = None
#     price_max_day: Optional[float] = None
#     price_min_week: Optional[float] = None
#     price_max_week: Optional[float] = None
#     price_min_month: Optional[float] = None
#     price_max_month: Optional[float] = None
#     location: Optional[str] = None
#     pincode: Optional[str] = None
#     available: Optional[bool] = None
#     user_lat: Optional[float] = None  # For distance filter
#     user_long: Optional[float] = None
#     distance_km: Optional[float] = 100.0
#     limit: int = 20
#     offset: int = 0
    
#     class Config:
#         from_attributes = True

class BookingBase(BaseModel):
    listing_id: UUID
    start_date: date
    end_date: date
    total_price: Optional[float] = None  # Auto-calculated

class BookingCreate(BookingBase):
    pass

class BookingResponse(BookingBase):
    id: UUID
    renter_id: UUID
    owner_id: UUID
    status: BookingStatus
    created_at: datetime
    updated_at: datetime
    listing: ListingResponse

    class Config:
        from_attributes = True

class BookingStatusUpdate(BaseModel):
    status: BookingStatus


class MessageBase(BaseModel):
    listing_id: UUID
    receiver_id: UUID
    content: str

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    id: UUID
    sender_id: UUID
    read: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class FavoriteBase(BaseModel):
    listing_id: UUID

class FavoriteCreate(FavoriteBase):
    pass

class FavoriteResponse(BaseModel):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: UUID
    listing_id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Filter schemas for queries
# class ListingFilter(BaseModel):
#     q: Optional[str] = None  # Search query
#     type: Optional[ListingType] = None
#     category: Optional[str] = None
#     brand: Optional[str] = None
#     condition: Optional[EquipmentCondition] = None
#     price_min: Optional[float] = None
#     price_max: Optional[float] = None
#     location: Optional[str] = None
#     pincode: Optional[str] = None
#     available: Optional[bool] = None
#     limit: int = 20
#     offset: int = 0
class ListingFilter(BaseModel):
    q: Optional[str] = None
    type: Optional[ListingType] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    condition: Optional[EquipmentCondition] = None
    # Period-specific price fields (this fixes the AttributeError)
    price_min_hour: Optional[float] = None
    price_max_hour: Optional[float] = None
    price_min_day: Optional[float] = None
    price_max_day: Optional[float] = None
    price_min_week: Optional[float] = None
    price_max_week: Optional[float] = None
    price_min_month: Optional[float] = None
    price_max_month: Optional[float] = None
    location: Optional[str] = None
    pincode: Optional[str] = None
    available: Optional[bool] = None
    user_lat: Optional[float] = None
    user_long: Optional[float] = None
    distance_km: Optional[float] = 100.0
    limit: int = 20
    offset: int = 0
    
class BookingFilter(BaseModel):
    role: str = "all"  # all, owner, renter
    status: Optional[BookingStatus] = None
    limit: int = 50
    offset: int = 0

    