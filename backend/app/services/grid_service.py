
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.grid import Feeder, Substation, Transformer
from app.db.models.meter import SmartMeter


async def get_all_substations(db: AsyncSession) -> list[Substation]:
    result = await db.execute(select(Substation).order_by(Substation.code))
    return list(result.scalars().all())

async def get_feeders(db: AsyncSession, substation_id: str | None = None) -> list[Feeder]:
    query = select(Feeder).order_by(Feeder.code)
    if substation_id:
        query = query.where(Feeder.substation_id == substation_id)
    result = await db.execute(query)
    return list(result.scalars().all())

async def get_transformers(db: AsyncSession, feeder_id: str | None = None) -> list[Transformer]:
    query = select(Transformer).order_by(Transformer.code)
    if feeder_id:
        query = query.where(Transformer.feeder_id == feeder_id)
    result = await db.execute(query)
    return list(result.scalars().all())

async def get_smart_meters(db: AsyncSession, transformer_id: str | None = None) -> list[SmartMeter]:
    query = select(SmartMeter).order_by(SmartMeter.meter_number)
    if transformer_id:
        query = query.where(SmartMeter.transformer_id == transformer_id)
    result = await db.execute(query)
    return list(result.scalars().all())
