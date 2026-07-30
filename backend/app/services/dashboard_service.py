from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.models.grid import Substation, Feeder, Transformer
from app.db.models.meter import SmartMeter
from app.db.models.alert import Alert
from app.schemas.dashboard import DashboardSummary

async def get_dashboard_summary(db: AsyncSession) -> DashboardSummary:
    # Counts
    sub_count = (await db.execute(select(func.count(Substation.id)))).scalar() or 0
    feeder_count = (await db.execute(select(func.count(Feeder.id)))).scalar() or 0
    tx_count = (await db.execute(select(func.count(Transformer.id)))).scalar() or 0
    meter_count = (await db.execute(select(func.count(SmartMeter.id)))).scalar() or 0
    
    # Active critical alerts
    critical_alerts = (await db.execute(
        select(func.count(Alert.id)).where(Alert.status != "RESOLVED", Alert.severity == "CRITICAL")
    )).scalar() or 0
    
    # Total power load (sum of current_load_kw from all feeders)
    total_load = (await db.execute(select(func.sum(Feeder.current_load_kw)))).scalar() or 0.0
    
    # System health index (average of all transformers health_index)
    avg_health = (await db.execute(select(func.avg(Transformer.health_index)))).scalar() or 1.0
    
    return DashboardSummary(
        total_substations=sub_count,
        total_feeders=feeder_count,
        total_transformers=tx_count,
        total_smart_meters=meter_count,
        total_power_load_kw=float(total_load),
        active_critical_alerts=critical_alerts,
        system_health_index=float(avg_health)
    )
