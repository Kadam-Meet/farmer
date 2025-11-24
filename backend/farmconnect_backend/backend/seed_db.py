"""
Script to seed the database with initial data.
"""
import asyncio
from app.db.base import AsyncSessionLocal
from app.db.seed_data import seed_all
from app.core.logging import log


async def main():
    """Run database seeding."""
    async with AsyncSessionLocal() as db:
        try:
            await seed_all(db)
            log.info("✅ Database seeded successfully!")
        except Exception as e:
            log.error(f"❌ Error seeding database: {e}")
            raise


if __name__ == "__main__":
    asyncio.run(main())
