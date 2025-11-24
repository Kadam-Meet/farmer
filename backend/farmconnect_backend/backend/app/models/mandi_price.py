"""
SQLAlchemy model for Mandi Price Cache.
"""
from sqlalchemy import Column, String, Integer, DateTime, func
from ..db.base import Base  # <-- Imports Base from your new base.py
import uuid
from sqlalchemy.dialects.postgresql import UUID

class MandiPriceCache(Base):
    __tablename__ = "mandi_price_cache"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    market = Column(String, index=True, nullable=False)
    commodity = Column(String, index=True, nullable=False)
    state = Column(String, index=True, nullable=False)
    district = Column(String, index=True, nullable=False)
    min_price = Column(Integer)
    max_price = Column(Integer)
    modal_price = Column(Integer, nullable=False)
    date = Column(String)
    
    # This is the timestamp of when *we* fetched it
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
