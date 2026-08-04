from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.grid import Feeder, Substation, Transformer
from app.db.models.meter import SmartMeter
from app.repositories.grid_repo import substation_repo, feeder_repo, transformer_repo
from app.repositories.meter_repo import meter_repo

async def get_all_substations(db: AsyncSession, skip: int = 0, limit: int = 100) -> list[Substation]:
    return await substation_repo.get_all_ordered(db, skip=skip, limit=limit)

async def get_feeders(db: AsyncSession, substation_id: str | None = None, skip: int = 0, limit: int = 100) -> list[Feeder]:
    if substation_id:
        return await feeder_repo.get_by_substation_id(db, substation_id, skip=skip, limit=limit)
    return await feeder_repo.get_all_ordered(db, skip=skip, limit=limit)

async def get_transformers(db: AsyncSession, feeder_id: str | None = None, skip: int = 0, limit: int = 100) -> list[Transformer]:
    if feeder_id:
        return await transformer_repo.get_by_feeder_id(db, feeder_id, skip=skip, limit=limit)
    return await transformer_repo.get_all_ordered(db, skip=skip, limit=limit)

async def get_smart_meters(db: AsyncSession, transformer_id: str | None = None, skip: int = 0, limit: int = 100) -> list[SmartMeter]:
    if transformer_id:
        return await meter_repo.get_by_transformer_id(db, transformer_id, skip=skip, limit=limit)
    return await meter_repo.get_all_ordered(db, skip=skip, limit=limit)
