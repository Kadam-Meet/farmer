"""
Database model for farming tips.
"""
from sqlalchemy import Column, String, Text, DateTime, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid
from ..db.base import Base


class Tip(Base):
    """Farming tip model."""
    __tablename__ = "tips"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    title_en = Column(String(255), nullable=False)
    title_hi = Column(String(255), nullable=True)
    title_gu = Column(String(255), nullable=True)
    
    description_en = Column(Text, nullable=False)
    description_hi = Column(Text, nullable=True)
    description_gu = Column(Text, nullable=True)
    
    content_en = Column(Text, nullable=True)
    content_hi = Column(Text, nullable=True)
    content_gu = Column(Text, nullable=True)
    
    category = Column(String(100), nullable=True)  # e.g., irrigation, pest_control, crop_rotation
    icon = Column(String(50), nullable=True)  # Icon name for frontend
    is_active = Column(Boolean, default=True, nullable=False)
    priority = Column(Integer, default=0)  # For ordering
    season = Column(String(50), nullable=True)  # e.g., summer, winter, monsoon, all
    
    tags = Column(JSONB, nullable=True)  # Array of tags
    tip_metadata = Column(JSONB, nullable=True)  # Renamed from 'metadata' (reserved); for additional flexible data
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<Tip {self.title_en}>"