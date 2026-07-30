import asyncio
from backend.app.core.database import AsyncSessionLocal
from backend.app.db.models.user import User
from sqlalchemy import select
async def run():
    db = AsyncSessionLocal()
    result = await db.execute(select(User))
    print([(u.username, u.role) for u in result.scalars().all()])
    await db.close()
asyncio.run(run())
