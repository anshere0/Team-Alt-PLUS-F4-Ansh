from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.repositories.base import BaseRepository
from app.db.models.meter import SmartMeter, TelemetryReading

class SmartMeterCreate(BaseModel):
    transformer_id: str
    meter_number: str
    consumer_name: str
    address: str
    latitude: float
    longitude: float
    status: str = "ACTIVE"

class SmartMeterUpdate(BaseModel):
    transformer_id: Optional[str] = None
    meter_number: Optional[str] = None
    consumer_name: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: Optional[str] = None

class MeterRepository(BaseRepository[SmartMeter, SmartMeterCreate, SmartMeterUpdate]):
    def __init__(self):
        super().__init__(SmartMeter)

    async def get_by_transformer_id(self, db: AsyncSession, transformer_id: str, skip: int = 0, limit: int = 100) -> List[SmartMeter]:
        query = select(SmartMeter).where(SmartMeter.transformer_id == transformer_id).order_by(SmartMeter.meter_number).offset(skip).limit(limit)
        result = await db.execute(query)
        return list(result.scalars().all())

    async def get_all_ordered(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[SmartMeter]:
        query = select(SmartMeter).order_by(SmartMeter.meter_number).offset(skip).limit(limit)
        result = await db.execute(query)
        return list(result.scalars().all())

meter_repo = MeterRepository()
