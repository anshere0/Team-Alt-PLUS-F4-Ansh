from typing import List, Optional, Tuple
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.repositories.base import BaseRepository
from app.db.models.alert import Alert, AlertStatus
from app.db.models.meter import SmartMeter
from app.db.models.grid import Transformer, Feeder, Substation

class AlertCreate(BaseModel):
    meter_id: str
    transformer_id: str
    severity: str
    risk_score: float
    anomaly_type: str
    message: str
    financial_loss_estimate: float
    status: Optional[str] = "ACTIVE"

class AlertUpdate(BaseModel):
    status: Optional[str] = None
    message: Optional[str] = None

class AlertRepository(BaseRepository[Alert, AlertCreate, AlertUpdate]):
    def __init__(self):
        super().__init__(Alert)

    async def get_active_alerts(self, db: AsyncSession) -> List[Alert]:
        query = select(Alert).where(Alert.status != "RESOLVED").order_by(Alert.created_at.desc())
        result = await db.execute(query)
        return list(result.scalars().all())
        
    async def get_alerts_by_meter(self, db: AsyncSession, meter_id: str) -> List[Alert]:
        query = select(Alert).where(Alert.meter_id == meter_id).order_by(Alert.created_at.desc())
        result = await db.execute(query)
        return list(result.scalars().all())
        
    async def get_active_alerts_with_relations(self, db: AsyncSession, skip: int = 0, limit: int = 50) -> List[Tuple]:
        query = (
            select(Alert, SmartMeter, Transformer, Feeder, Substation)
            .join(SmartMeter, Alert.meter_id == SmartMeter.id)
            .join(Transformer, SmartMeter.transformer_id == Transformer.id)
            .join(Feeder, Transformer.feeder_id == Feeder.id)
            .join(Substation, Feeder.substation_id == Substation.id)
            .where(Alert.status != AlertStatus.RESOLVED)
            .order_by(desc(Alert.created_at))
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return list(result.all())

alert_repo = AlertRepository()
