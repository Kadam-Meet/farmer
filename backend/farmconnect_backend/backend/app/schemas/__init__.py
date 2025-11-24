"""
Pydantic schemas for API request/response validation.
"""
from .conversation import (
    ConversationCreate,
    ConversationResponse,
    MessageCreate,
    MessageResponse,
    ChatRequest,
    ChatResponse,
)
from .scheme import SchemeCreate, SchemeUpdate, SchemeResponse
from .tip import TipCreate, TipUpdate, TipResponse
from .weather import WeatherAlertResponse, WeatherRequest

__all__ = [
    "ConversationCreate",
    "ConversationResponse",
    "MessageCreate",
    "MessageResponse",
    "ChatRequest",
    "ChatResponse",
    "SchemeCreate",
    "SchemeUpdate",
    "SchemeResponse",
    "TipCreate",
    "TipUpdate",
    "TipResponse",
    "WeatherAlertResponse",
    "WeatherRequest",
]
