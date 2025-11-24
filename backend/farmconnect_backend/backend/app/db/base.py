"""
Database configuration and session management.
"""
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from typing import AsyncGenerator
from ..core.config import settings
from ..core.logging import log

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DB_ECHO,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_pre_ping=True,
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Create declarative base
Base = declarative_base()

# Register models to Base.metadata for migrations and init_db
from app.models.scheme import Scheme
from app.models.tip import Tip
from app.models.weather import WeatherAlert
from app.models.conversation import Conversation, Message
# --- 1. THIS IS THE NEW LINE YOU MUST ADD ---
from app.models.mandi_price import MandiPriceCache


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for getting async database sessions.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            # --- 2. THIS IS THE CRITICAL FIX ---
            # We do not commit here. The API endpoint (e.g., chat.py)
            # is responsible for the commit.
            # await session.commit() # <-- This line is removed.
        except Exception as e:
            await session.rollback()
            log.error(f"Database session error: {e}")
            raise
        finally:
            await session.close()


async def init_db():
    """Initialize database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        log.info("Database tables created successfully")


async def close_db():
    """Close database connections."""
    await engine.dispose()
    log.info("Database connections closed")

