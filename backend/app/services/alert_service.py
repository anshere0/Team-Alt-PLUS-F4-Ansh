from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List
from app.db.models.alert import Alert

async def get_active_alerts(db: AsyncSession, limit: int = 50) -> List[Alert]:
    query = (
        select(Alert)
        .where(Alert.is_resolved == False)
        .order_by(desc(Alert.created_at))
        .limit(limit)
    )
    result = await db.execute(query)
    return list(result.scalars().all())
