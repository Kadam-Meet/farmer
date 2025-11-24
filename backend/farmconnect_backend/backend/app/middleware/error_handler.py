"""
Global error handling middleware.
"""
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from ..core.config import settings
from ..core.logging import log


async def error_handler_middleware(request: Request, call_next):
    """Global error handler middleware."""
    try:
        response = await call_next(request)
        return response
    except Exception as exc:
        log.error(f"Unhandled exception: {exc}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "detail": "Internal server error",
                "error": str(exc) if settings.DEBUG else "An unexpected error occurred"
            }
        )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors."""
    log.warning(f"Validation error: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation error",
            "errors": exc.errors()
        }
    )


async def database_exception_handler(request: Request, exc: SQLAlchemyError):
    """Handle database errors."""
    log.error(f"Database error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Database error",
            "error": str(exc) if settings.DEBUG else "A database error occurred"
        }
    )
