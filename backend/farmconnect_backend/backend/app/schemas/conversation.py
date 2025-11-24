"""
Pydantic schemas for conversation and chat.
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import UUID


class MessageCreate(BaseModel):
    """Schema for creating a message."""
    role: str = Field(..., description="Message role: user, assistant, or system")
    content: str = Field(..., description="Message content")


class MessageResponse(BaseModel):
    """Schema for message response."""
    id: UUID
    conversation_id: UUID
    role: str
    content: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class ConversationCreate(BaseModel):
    """Schema for creating a conversation."""
    user_id: str = Field(..., description="User identifier")
    title: Optional[str] = Field(None, description="Conversation title")
    language: str = Field(default="en", description="Language code (en, hi, gu)")


class ConversationResponse(BaseModel):
    """Schema for conversation response."""
    id: UUID
    user_id: str
    title: Optional[str]
    language: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []
    
    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    """Schema for chat request."""
    message: str = Field(..., description="User message", min_length=1, max_length=5000)
    conversation_id: Optional[UUID] = Field(None, description="Existing conversation ID")
    user_id: str = Field(default="demo-user", description="User identifier")
    language: str = Field(default="en", description="Language code (en, hi, gu)")


class ChatResponse(BaseModel):
    """Schema for chat response."""
    conversation_id: UUID
    message: str
    role: str = "assistant"
    created_at: datetime
    
    class Config:
        from_attributes = True
