from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Tuple

from app.db.models.alert import Alert
from app.db.models.grid import Feeder, Transformer
from app.db.models.meter import SmartMeter, TelemetryReading
from app.db.models.prediction import Prediction

class DashboardRepository:
    
    async def get_active_smart_meters_count(self, db: AsyncSession) -> int:
        return (await db.execute(select(func.count(SmartMeter.id)))).scalar() or 0
        
    async def get_active_feeders_count(self, db: AsyncSession) -> int:
        return (await db.execute(select(func.count(Feeder.id)))).scalar() or 0
        
    async def get_average_transformer_health(self, db: AsyncSession) -> float:
        return (await db.execute(select(func.avg(Transformer.health_index)))).scalar() or 1.0
        
    async def get_active_alerts_count(self, db: AsyncSession) -> int:
        return (await db.execute(select(func.count(Alert.id)).where(Alert.status != "RESOLVED"))).scalar() or 0
        
    async def get_financial_loss_at_risk(self, db: AsyncSession) -> float:
        return (await db.execute(select(func.sum(Prediction.financial_loss_estimate)))).scalar() or 0.0
        
    async def get_average_ai_confidence(self, db: AsyncSession) -> float:
        return (await db.execute(select(func.avg(Prediction.confidence)))).scalar() or 0.0
        
    async def get_energy_loss_kwh(self, db: AsyncSession) -> float:
        return (await db.execute(
            select(func.sum(TelemetryReading.active_power_kwh - TelemetryReading.expected_power_kwh))
            .where(TelemetryReading.active_power_kwh > TelemetryReading.expected_power_kwh)
        )).scalar() or 0.0
        
    async def get_resolved_revenue(self, db: AsyncSession) -> float:
        return (await db.execute(
            select(func.sum(Alert.financial_loss_estimate)).where(Alert.status == "RESOLVED")
        )).scalar() or 0.0

dashboard_repo = DashboardRepository()
