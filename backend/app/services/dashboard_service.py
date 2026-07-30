from datetime import datetime, timezone
import logging
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.alert import Alert
from app.db.models.grid import Feeder, Substation, Transformer
from app.db.models.meter import SmartMeter
from app.schemas.dashboard import DashboardSummary, MetricProvenance

logger = logging.getLogger(__name__)

async def get_dashboard_summary(db: AsyncSession) -> DashboardSummary:
    now_iso = datetime.now(timezone.utc).isoformat()

    # Active Smart Meters
    meter_count = (await db.execute(select(func.count(SmartMeter.id)))).scalar() or 0
    active_smart_meters = MetricProvenance(
        value=meter_count,
        status="Available",
        source="database",
        table="smart_meters",
        calculated_from="COUNT(*)",
        last_updated=now_iso
    )

    # Active Feeders
    feeder_count = (await db.execute(select(func.count(Feeder.id)))).scalar() or 0
    active_feeders = MetricProvenance(
        value=feeder_count,
        status="Available",
        source="database",
        table="feeders",
        calculated_from="COUNT(*)",
        last_updated=now_iso
    )

    # Transformer Health Index
    avg_health = (await db.execute(select(func.avg(Transformer.health_index)))).scalar()
    transformer_health_index = MetricProvenance(
        value=round(float(avg_health), 2) if avg_health else 1.0,
        status="Available",
        source="database",
        table="transformers",
        calculated_from="AVG(health_index)",
        last_updated=now_iso
    )

    # Detected Theft Nodes (Active alerts)
    theft_count = (await db.execute(
        select(func.count(Alert.id)).where(Alert.status != "RESOLVED")
    )).scalar() or 0
    detected_theft_nodes = MetricProvenance(
        value=theft_count,
        status="Available",
        source="database",
        table="alerts",
        calculated_from="COUNT(id) WHERE status != 'RESOLVED'",
        last_updated=now_iso
    )

    # --- Missing Metrics Pending Future Phases ---
    
    logger.info("Dashboard Service: today_energy_loss_mwh is missing backend support. Deferred to Phase 2.")
    today_energy_loss_mwh = MetricProvenance(
        value=None,
        status="Unavailable",
        source="Not Implemented Yet",
        reason="Awaiting Prediction Engine (Phase 2)",
        last_updated=now_iso
    )

    logger.info("Dashboard Service: financial_loss_at_risk is missing backend support. Deferred to Phase 2.")
    financial_loss_at_risk = MetricProvenance(
        value=None,
        status="Unavailable",
        source="Not Implemented Yet",
        reason="Awaiting Prediction Engine (Phase 2)",
        last_updated=now_iso
    )

    logger.info("Dashboard Service: ai_confidence_score is missing backend support. Deferred to Phase 3.")
    ai_confidence_score = MetricProvenance(
        value=None,
        status="Unavailable",
        source="Not Implemented Yet",
        reason="Awaiting AI Integration (Phase 3)",
        last_updated=now_iso
    )

    logger.info("Dashboard Service: revenue_recovered_ytd is missing backend support. Deferred to Phase 2.")
    revenue_recovered_ytd = MetricProvenance(
        value=None,
        status="Unavailable",
        source="Not Implemented Yet",
        reason="Awaiting Financials (Phase 2)",
        last_updated=now_iso
    )

    return DashboardSummary(
        active_smart_meters=active_smart_meters,
        active_feeders=active_feeders,
        transformer_health_index=transformer_health_index,
        today_energy_loss_mwh=today_energy_loss_mwh,
        financial_loss_at_risk=financial_loss_at_risk,
        detected_theft_nodes=detected_theft_nodes,
        ai_confidence_score=ai_confidence_score,
        revenue_recovered_ytd=revenue_recovered_ytd
    )

