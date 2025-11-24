"""
Main FastAPI application.
"""
from fastapi import FastAPI, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .core.logging import log
from .db.base import init_db, close_db
from .api.v1 import api_router
from .api.v1.endpoints import mandi as mandi_router
from .middleware import (
    error_handler_middleware,
    validation_exception_handler,
    database_exception_handler
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    log.info("Starting application...")
    log.info(f"Environment: {settings.ENVIRONMENT}")
    log.info(f"AI Provider: {settings.AI_PROVIDER}")
    
    # Initialize database
    await init_db()
    log.info("Database initialized")
    
    yield
    
    # Shutdown
    log.info("Shutting down application...")
    await close_db()
    log.info("Application shutdown complete")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    🌾 **Farmer Chatbot API** - AI-powered farming assistant
    
    This API provides:
    - 🤖 **AI Chat**: Intelligent farming advice and support
    - 🌦️ **Weather**: Real-time weather alerts and forecasts
    - 📋 **Schemes**: Government schemes and subsidies
    - 💡 **Tips**: Farming tips and best practices
    - 💰 **Mandi Prices**: Live market prices from data.gov.in
    
    Features:
    - Multilingual support (English, Hindi, Gujarati)
    - Real-time weather integration
    - Scalable and production-ready
    - Comprehensive error handling
    """,
    docs_url=settings.DOCS_URL,
    redoc_url=settings.REDOC_URL,
    openapi_url=settings.OPENAPI_URL,
    lifespan=lifespan
)

# Setup Native CORS (uses .env settings)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,  # ["http://localhost:5173", "http://localhost:8080"]
    allow_credentials=settings.ALLOWED_CREDENTIALS,
    allow_methods=settings.ALLOWED_METHODS,
    allow_headers=settings.ALLOWED_HEADERS,
)

# Add middleware
app.middleware("http")(error_handler_middleware)

# Add exception handlers
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(SQLAlchemyError, database_exception_handler)

# Include API routers
app.include_router(api_router, prefix=settings.API_V1_PREFIX)
app.include_router(mandi_router.router, prefix=settings.API_V1_PREFIX, tags=["Mandi"])  # Integrated mandi with tags

@app.get("/", tags=["Health"])
async def root():
    """Root endpoint - API information."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "environment": settings.ENVIRONMENT,
        "docs": settings.DOCS_URL,
        "api_prefix": settings.API_V1_PREFIX
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT
    }


@app.get("/api/v1/health", tags=["Health"])
async def api_health_check():
    """API health check endpoint."""
    return {
        "status": "healthy",
        "api_version": "v1",
        "services": {
            "database": "connected",
            "ai": settings.AI_PROVIDER,
            "weather": "available" if settings.WEATHER_API_KEY else "mock",
            "mandi": "available" if settings.DATA_GOV_API_KEY else "mock"
        }
    }


if __name__ == "__main__":
    import uvicorn
    
    log.info(f"Starting server on {settings.HOST}:{settings.PORT}")
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.RELOAD,
        log_level=settings.LOG_LEVEL.lower()
    )