"""
Pydantic schemas for farming tips.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


class TipBase(BaseModel):
    """Base schema for tip."""
    title_en: str = Field(..., description="Tip title in English")
    title_hi: Optional[str] = Field(None, description="Tip title in Hindi")
    title_gu: Optional[str] = Field(None, description="Tip title in Gujarati")
    
    description_en: str = Field(..., description="Tip description in English")
    description_hi: Optional[str] = Field(None, description="Tip description in Hindi")
    description_gu: Optional[str] = Field(None, description="Tip description in Gujarati")
    
    content_en: Optional[str] = Field(None, description="Full content in English")
    content_hi: Optional[str] = Field(None, description="Full content in Hindi")
    content_gu: Optional[str] = Field(None, description="Full content in Gujarati")
    
    category: Optional[str] = Field(None, description="Tip category")
    icon: Optional[str] = Field(None, description="Icon name")
    is_active: bool = Field(default=True, description="Is tip active")
    priority: int = Field(default=0, description="Display priority")
    season: Optional[str] = Field(None, description="Applicable season")
    tags: Optional[List[str]] = Field(None, description="Tags")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")


class TipCreate(TipBase):
    """Schema for creating a tip."""
    pass


class TipUpdate(BaseModel):
    """Schema for updating a tip."""
    title_en: Optional[str] = None
    title_hi: Optional[str] = None
    title_gu: Optional[str] = None
    description_en: Optional[str] = None
    description_hi: Optional[str] = None
    description_gu: Optional[str] = None
    content_en: Optional[str] = None
    content_hi: Optional[str] = None
    content_gu: Optional[str] = None
    category: Optional[str] = None
    icon: Optional[str] = None
    is_active: Optional[bool] = None
    priority: Optional[int] = None
    season: Optional[str] = None
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None


class TipResponse(TipBase):
    """Schema for tip response."""
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
