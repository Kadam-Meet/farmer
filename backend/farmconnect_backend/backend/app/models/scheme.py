"""
Database model for government schemes.
"""
from sqlalchemy import Column, String, Text, DateTime, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid
from ..db.base import Base


class Scheme(Base):
    """Government scheme model."""
    __tablename__ = "schemes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name_en = Column(String(255), nullable=False)
    name_hi = Column(String(255), nullable=True)
    name_gu = Column(String(255), nullable=True)
    
    description_en = Column(Text, nullable=False)
    description_hi = Column(Text, nullable=True)
    description_gu = Column(Text, nullable=True)
    
    eligibility_en = Column(Text, nullable=True)
    eligibility_hi = Column(Text, nullable=True)
    eligibility_gu = Column(Text, nullable=True)
    
    benefits_en = Column(Text, nullable=True)
    benefits_hi = Column(Text, nullable=True)
    benefits_gu = Column(Text, nullable=True)
    
    application_url = Column(String(500), nullable=True)
    category = Column(String(100), nullable=True)  # e.g., subsidy, insurance, loan
    is_active = Column(Boolean, default=True, nullable=False)
    priority = Column(Integer, default=0)  # For ordering
    
    scheme_metadata = Column(JSONB, nullable=True)  # Renamed from 'metadata' (reserved); for additional flexible data
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<Scheme {self.name_en}>"