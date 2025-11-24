"""
Pydantic schemas for government schemes.
"""
from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID


class SchemeBase(BaseModel):
    """Base schema for scheme."""
    name_en: str = Field(..., description="Scheme name in English")
    name_hi: Optional[str] = Field(None, description="Scheme name in Hindi")
    name_gu: Optional[str] = Field(None, description="Scheme name in Gujarati")
    
    description_en: str = Field(..., description="Scheme description in English")
    description_hi: Optional[str] = Field(None, description="Scheme description in Hindi")
    description_gu: Optional[str] = Field(None, description="Scheme description in Gujarati")
    
    eligibility_en: Optional[str] = Field(None, description="Eligibility criteria in English")
    eligibility_hi: Optional[str] = Field(None, description="Eligibility criteria in Hindi")
    eligibility_gu: Optional[str] = Field(None, description="Eligibility criteria in Gujarati")
    
    benefits_en: Optional[str] = Field(None, description="Benefits in English")
    benefits_hi: Optional[str] = Field(None, description="Benefits in Hindi")
    benefits_gu: Optional[str] = Field(None, description="Benefits in Gujarati")
    
    application_url: Optional[str] = Field(None, description="Application URL")
    category: Optional[str] = Field(None, description="Scheme category")
    is_active: bool = Field(default=True, description="Is scheme active")
    priority: int = Field(default=0, description="Display priority")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")


class SchemeCreate(SchemeBase):
    """Schema for creating a scheme."""
    pass


class SchemeUpdate(BaseModel):
    """Schema for updating a scheme."""
    name_en: Optional[str] = None
    name_hi: Optional[str] = None
    name_gu: Optional[str] = None
    description_en: Optional[str] = None
    description_hi: Optional[str] = None
    description_gu: Optional[str] = None
    eligibility_en: Optional[str] = None
    eligibility_hi: Optional[str] = None
    eligibility_gu: Optional[str] = None
    benefits_en: Optional[str] = None
    benefits_hi: Optional[str] = None
    benefits_gu: Optional[str] = None
    application_url: Optional[str] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None
    priority: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None


class SchemeResponse(SchemeBase):
    """Schema for scheme response."""
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
