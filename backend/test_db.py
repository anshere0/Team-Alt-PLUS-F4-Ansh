import asyncio
from app.core.database import AsyncSessionLocal
from app.services.dashboard_service import get_dashboard_summary

async def test():
    db = AsyncSessionLocal()
    try:
        res = await get_dashboard_summary(db)
        print("Success! Dashboard summary:")
        print(res.model_dump_json(indent=2))
    finally:
        await db.close()

if __name__ == "__main__":
    asyncio.run(test())
