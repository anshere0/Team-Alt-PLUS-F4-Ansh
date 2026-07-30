
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.alert import Alert


async def get_active_alerts(db: AsyncSession, limit: int = 50) -> list[Alert]:
    query = (
        select(Alert)
        .where(Alert.is_resolved == False)
        .order_by(desc(Alert.created_at))
        .limit(limit)
    )
    result = await db.execute(query)
    return list(result.scalars().all())
