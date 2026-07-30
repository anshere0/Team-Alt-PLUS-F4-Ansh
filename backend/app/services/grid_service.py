from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from app.db.models.grid import Substation, Feeder, Transformer
from app.db.models.meter import SmartMeter

async def get_all_substations(db: AsyncSession) -> List[Substation]:
    result = await db.execute(select(Substation).order_by(Substation.code))
    return list(result.scalars().all())

async def get_feeders(db: AsyncSession, substation_id: Optional[str] = None) -> List[Feeder]:
    query = select(Feeder).order_by(Feeder.code)
    if substation_id:
        query = query.where(Feeder.substation_id == substation_id)
    result = await db.execute(query)
    return list(result.scalars().all())

async def get_transformers(db: AsyncSession, feeder_id: Optional[str] = None) -> List[Transformer]:
    query = select(Transformer).order_by(Transformer.code)
    if feeder_id:
        query = query.where(Transformer.feeder_id == feeder_id)
    result = await db.execute(query)
    return list(result.scalars().all())

async def get_smart_meters(db: AsyncSession, transformer_id: Optional[str] = None) -> List[SmartMeter]:
    query = select(SmartMeter).order_by(SmartMeter.meter_number)
    if transformer_id:
        query = query.where(SmartMeter.transformer_id == transformer_id)
    result = await db.execute(query)
    return list(result.scalars().all())
