from typing import List, Optional, Tuple
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.repositories.base import BaseRepository
from app.db.models.alert import Alert, AlertStatus, AuditLog
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
    async def resolve_alert(self, db: AsyncSession, alert_id: str, user_id: str, notes: str = "") -> Alert | None:
        query = select(Alert).where(Alert.id == alert_id)
        result = await db.execute(query)
        alert = result.scalar_one_or_none()
        if not alert:
            return None
        
        # Update alert
        alert.status = AlertStatus.RESOLVED
        
        # Create audit log
        audit = AuditLog(
            action="RESOLVE_ALERT",
            actor_id=user_id,
            target_entity="Alert",
            target_id=alert_id,
            details={"notes": notes, "financial_loss_estimate": alert.financial_loss_estimate}
        )
        db.add(audit)
        
        await db.commit()
        await db.refresh(alert)
        return alert

    async def get_audit_logs(self, db: AsyncSession, skip: int = 0, limit: int = 50) -> List[AuditLog]:
        query = select(AuditLog).order_by(desc(AuditLog.timestamp)).offset(skip).limit(limit)
        result = await db.execute(query)
        return list(result.scalars().all())

alert_repo = AlertRepository()
