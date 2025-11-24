# from sqlalchemy import (
#     Boolean, Column, Date, DateTime, Enum, Float, ForeignKey, Integer, String, Text, Time, func
# )
# from sqlalchemy.dialects.postgresql import UUID
# from sqlalchemy.orm import relationship
# from ..database import Base
# import enum
# from datetime import datetime

# class AppRole(str, enum.Enum):
#     admin = "admin"
#     user = "user"

# class ListingType(str, enum.Enum):
#     equipment = "equipment"
#     land = "land"

# class EquipmentCondition(str, enum.Enum):
#     excellent = "excellent"
#     good = "good"
#     fair = "fair"

# class BookingStatus(str, enum.Enum):
#     pending = "pending"
#     accepted = "accepted"
#     rejected = "rejected"
#     completed = "completed"
#     cancelled = "cancelled"

# class Profile(Base):
#     __tablename__ = "profiles"

#     id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
#     user_id = Column(UUID(as_uuid=True), ForeignKey("auth.users.id"), unique=True)
#     full_name = Column(String)
#     phone = Column(String)
#     pincode = Column(String)
#     address = Column(Text)
#     city = Column(String)
#     state = Column(String)
#     avatar_url = Column(String)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

# class UserRole(Base):
#     __tablename__ = "user_roles"

#     id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
#     user_id = Column(UUID(as_uuid=True), ForeignKey("auth.users.id"))
#     role = Column(Enum(AppRole))
#     created_at = Column(DateTime(timezone=True), server_default=func.now())

# class Listing(Base):
#     __tablename__ = "listings"

#     id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
#     owner_id = Column(UUID(as_uuid=True), ForeignKey("auth.users.id"))
#     type = Column(Enum(ListingType))
#     title = Column(String, nullable=False)
#     description = Column(Text)
#     category = Column(String, nullable=False)
#     brand = Column(String)
#     price_per_day = Column(Float, nullable=False)
#     price_per_week = Column(Float)
#     price_per_month = Column(Float)
#     price_per_hour = Column(Float)
#     period = Column(Enum(Period), default=Period.day)
#     location = Column(String, nullable=False)
#     pincode = Column(String)
#     city = Column(String)
#     state = Column(String)
#     latitude = Column(Float)
#     longitude = Column(Float)
#     image_url = Column(String)
#     condition = Column(Enum(EquipmentCondition))
#     area = Column(Float)
#     available = Column(Boolean, default=True)
#     rating = Column(Float, default=0.0)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

#     owner = relationship("Profile", foreign_keys=[owner_id])

# class Booking(Base):
#     __tablename__ = "bookings"

#     id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
#     listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id"))
#     renter_id = Column(UUID(as_uuid=True), ForeignKey("auth.users.id"))
#     owner_id = Column(UUID(as_uuid=True), ForeignKey("auth.users.id"))
#     start_date = Column(Date, nullable=False)
#     end_date = Column(Date, nullable=False)
#     total_price = Column(Float, nullable=False)
#     status = Column(Enum(BookingStatus), default=BookingStatus.pending)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

#     listing = relationship("Listing")

# class Message(Base):
#     __tablename__ = "messages"

#     id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
#     listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id"))
#     sender_id = Column(UUID(as_uuid=True))
#     receiver_id = Column(UUID(as_uuid=True))
#     content = Column(Text, nullable=False)
#     read = Column(Boolean, default=False)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

# class Favorite(Base):
#     __tablename__ = "favorites"

#     id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
#     user_id = Column(UUID(as_uuid=True), ForeignKey("auth.users.id"))
#     listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id"))
#     created_at = Column(DateTime(timezone=True), server_default=func.now())

# class Review(Base):
#     __tablename__ = "reviews"

#     id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
#     listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id"))
#     user_id = Column(UUID(as_uuid=True), ForeignKey("auth.users.id"))
#     rating = Column(Integer)
#     comment = Column(Text)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())



from sqlalchemy import (
    Boolean, Column, Date, DateTime, Enum, Float, ForeignKey, Integer, String, Text, Time, func
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import enum
from datetime import datetime

class AppRole(str, enum.Enum):
    admin = "admin"
    user = "user"

class ListingType(str, enum.Enum):
    equipment = "equipment"
    land = "land"

class EquipmentCondition(str, enum.Enum):
    excellent = "excellent"
    good = "good"
    fair = "fair"

class BookingStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    completed = "completed"
    cancelled = "cancelled"

class Period(str, enum.Enum):
    hour = "hour"
    day = "day"
    week = "week"
    month = "month"

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    user_id = Column(UUID(as_uuid=True), ForeignKey("auth.users.id"), unique=True)
    full_name = Column(String)
    phone = Column(String)
    pincode = Column(String)
    address = Column(Text)
    city = Column(String)
    state = Column(String)
    avatar_url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
# Dummy model for Supabase auth.users (for FK resolution only, not created)
class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "auth"}  # Supabase's auth schema

    id = Column(UUID(as_uuid=True), primary_key=True)
    # Minimal—add more fields if needed for queries
class UserRole(Base):
    __tablename__ = "user_roles"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    user_id = Column(UUID(as_uuid=True), ForeignKey("auth.users.id"))
    role = Column(Enum(AppRole))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# class Listing(Base):
#     __tablename__ = "listings"

#     id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
#     owner_id = Column(UUID(as_uuid=True), ForeignKey("auth.users.id"))
#     type = Column(Enum(ListingType))
#     title = Column(String, nullable=False)
#     description = Column(Text)
#     category = Column(String, nullable=False)
#     brand = Column(String)
#     price_per_day = Column(Float, nullable=False)
#     price_per_week = Column(Float)
#     price_per_month = Column(Float)
#     price_per_hour = Column(Float)
#     period = Column(Enum(Period), default=Period.day)
#     location = Column(String, nullable=False)
#     pincode = Column(String)
#     city = Column(String)
#     state = Column(String)
#     latitude = Column(Float)
#     longitude = Column(Float)
#     image_url = Column(String)
#     condition = Column(Enum(EquipmentCondition))
#     area = Column(Float)
#     available = Column(Boolean, default=True)
#     rating = Column(Float, default=0.0)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

#     owner = relationship("Profile", foreign_keys=[owner_id])

class Listing(Base):
    __tablename__ = "listings"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    owner_id = Column(UUID(as_uuid=True), ForeignKey("auth.users.id"))
    type = Column(Enum(ListingType))
    title = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String, nullable=False)
    brand = Column(String)
    price_per_day = Column(Float, nullable=False)
    price_per_week = Column(Float)
    price_per_month = Column(Float)
    price_per_hour = Column(Float)
    period = Column(Enum(Period), default=Period.day)
    location = Column(String, nullable=False)
    pincode = Column(String)
    city = Column(String)
    state = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    image_url = Column(String)
    condition = Column(Enum(EquipmentCondition))
    area = Column(Float)
    available = Column(Boolean, default=True)
    rating = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Explicit relationship to fix join
    owner = relationship("Profile", primaryjoin="Listing.owner_id == foreign(Profile.user_id)")

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id"))
    renter_id = Column(UUID(as_uuid=True), ForeignKey("auth.users.id"))
    owner_id = Column(UUID(as_uuid=True), ForeignKey("auth.users.id"))
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    total_price = Column(Float, nullable=False)
    status = Column(Enum(BookingStatus), default=BookingStatus.pending)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    listing = relationship("Listing")

class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id"))
    sender_id = Column(UUID(as_uuid=True))
    receiver_id = Column(UUID(as_uuid=True))
    content = Column(Text, nullable=False)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    user_id = Column(UUID(as_uuid=True), ForeignKey("auth.users.id"))
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Review(Base):
    __tablename__ = "reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("auth.users.id"))
    rating = Column(Integer)
    comment = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())