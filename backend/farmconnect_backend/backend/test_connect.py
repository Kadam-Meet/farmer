import asyncio
import asyncpg
from app.core.config import settings

async def test():
    try:
        # Strip +asyncpg for direct asyncpg.connect
        clean_url = settings.DATABASE_URL.replace('+asyncpg', '')
        conn = await asyncpg.connect(clean_url)
        print("✅ Async connection success!")
        await conn.close()
    except Exception as e:
        print(f"❌ Error: {e}")

asyncio.run(test())