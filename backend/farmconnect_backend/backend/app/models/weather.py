"""
Database model for weather alerts.
"""
from sqlalchemy import Column, String, Text, DateTime, Enum as SQLEnum, Float
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid
import enum
from ..db.base import Base


class AlertSeverity(str, enum.Enum):
    """Alert severity levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class WeatherAlert(Base):
    """Weather alert model."""
    __tablename__ = "weather_alerts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    location = Column(String(255), nullable=False, index=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    severity = Column(SQLEnum(AlertSeverity), nullable=False, default=AlertSeverity.LOW)
    
    message_en = Column(Text, nullable=False)
    message_hi = Column(Text, nullable=True)
    message_gu = Column(Text, nullable=True)
    
    alert_type = Column(String(100), nullable=True)  # e.g., rain, wind, temperature, storm
    icon = Column(String(50), nullable=True)
    
    temperature = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    wind_speed = Column(Float, nullable=True)
    rainfall = Column(Float, nullable=True)
    
    weather_metadata = Column(JSONB, nullable=True)  # Renamed from 'metadata' (reserved); additional weather data
    
    valid_from = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    valid_until = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<WeatherAlert {self.location} - {self.severity}>"