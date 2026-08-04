from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.repositories.base import BaseRepository
from app.db.models.grid import Feeder, Substation, Transformer

class SubstationCreate(BaseModel):
    code: str
    name: str
    capacity_mva: float
    latitude: float
    longitude: float

class SubstationUpdate(BaseModel):
    name: Optional[str] = None
    capacity_mva: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class FeederCreate(BaseModel):
    substation_id: str
    code: str
    name: Optional[str] = None
    nominal_voltage_kv: float
    current_load_kw: float

class FeederUpdate(BaseModel):
    name: Optional[str] = None
    nominal_voltage_kv: Optional[float] = None
    current_load_kw: Optional[float] = None

class TransformerCreate(BaseModel):
    feeder_id: str
    code: str
    name: Optional[str] = None
    capacity_kva: float
    phase_count: int
    health_index: float

class TransformerUpdate(BaseModel):
    name: Optional[str] = None
    capacity_kva: Optional[float] = None
    phase_count: Optional[int] = None
    health_index: Optional[float] = None

class SubstationRepository(BaseRepository[Substation, SubstationCreate, SubstationUpdate]):
    def __init__(self):
        super().__init__(Substation)
        
    async def get_all_ordered(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Substation]:
        result = await db.execute(select(Substation).order_by(Substation.code).offset(skip).limit(limit))
        return list(result.scalars().all())

class FeederRepository(BaseRepository[Feeder, FeederCreate, FeederUpdate]):
    def __init__(self):
        super().__init__(Feeder)
        
    async def get_by_substation_id(self, db: AsyncSession, substation_id: str, skip: int = 0, limit: int = 100) -> List[Feeder]:
        query = select(Feeder).where(Feeder.substation_id == substation_id).order_by(Feeder.code).offset(skip).limit(limit)
        result = await db.execute(query)
        return list(result.scalars().all())

    async def get_all_ordered(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Feeder]:
        result = await db.execute(select(Feeder).order_by(Feeder.code).offset(skip).limit(limit))
        return list(result.scalars().all())

class TransformerRepository(BaseRepository[Transformer, TransformerCreate, TransformerUpdate]):
    def __init__(self):
        super().__init__(Transformer)
        
    async def get_by_feeder_id(self, db: AsyncSession, feeder_id: str, skip: int = 0, limit: int = 100) -> List[Transformer]:
        query = select(Transformer).where(Transformer.feeder_id == feeder_id).order_by(Transformer.code).offset(skip).limit(limit)
        result = await db.execute(query)
        return list(result.scalars().all())

    async def get_all_ordered(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Transformer]:
        result = await db.execute(select(Transformer).order_by(Transformer.code).offset(skip).limit(limit))
        return list(result.scalars().all())

substation_repo = SubstationRepository()
feeder_repo = FeederRepository()
transformer_repo = TransformerRepository()
