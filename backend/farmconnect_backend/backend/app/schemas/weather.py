"""
Pydantic schemas for weather.
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID


class WeatherRequest(BaseModel):
    """Schema for weather request."""
    location: str = Field(default="Delhi,IN", description="Location (city,country_code)")
    language: str = Field(default="en", description="Language code (en, hi, gu)")


class WeatherAlertResponse(BaseModel):
    """Schema for weather alert response."""
    id: Optional[UUID] = None
    location: str
    severity: str
    message_en: str
    message_hi: Optional[str] = None
    message_gu: Optional[str] = None
    alert_type: Optional[str] = None
    icon: Optional[str] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    wind_speed: Optional[float] = None
    rainfall: Optional[float] = None
    metadata: Optional[Dict[str, Any]] = None
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class CurrentWeatherResponse(BaseModel):
    """Schema for current weather response."""
    location: str
    temperature: float
    feels_like: float
    humidity: float
    wind_speed: float
    description: str
    icon: str
    alerts: List[WeatherAlertResponse] = []
