from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.alert import Alert, AlertStatus
from app.db.models.meter import SmartMeter
from app.db.models.grid import Transformer, Feeder, Substation

async def get_active_alerts(db: AsyncSession, limit: int = 50):
    query = (
        select(Alert, SmartMeter, Transformer, Feeder, Substation)
        .join(SmartMeter, Alert.meter_id == SmartMeter.id)
        .join(Transformer, SmartMeter.transformer_id == Transformer.id)
        .join(Feeder, Transformer.feeder_id == Feeder.id)
        .join(Substation, Feeder.substation_id == Substation.id)
        .where(Alert.status != AlertStatus.RESOLVED)
        .order_by(desc(Alert.created_at))
        .limit(limit)
    )
    result = await db.execute(query)
    
    alerts = []
    for alert, meter, transformer, feeder, substation in result.all():
        alerts.append({
            'alert_id': alert.id,
            'meter_id': meter.meter_number,
            'consumer_name': meter.consumer_name,
            'transformer_id': transformer.code,
            'feeder_id': feeder.code,
            'substation_id': substation.code,
            'severity': alert.severity,
            'anomaly_type': alert.anomaly_type,
            'risk_score': alert.risk_score,
            'financial_loss_estimate': alert.financial_loss_estimate,
            'message': alert.message,
            'timestamp': alert.created_at.isoformat() if alert.created_at else None,
            'is_acknowledged': alert.status == AlertStatus.ACKNOWLEDGED
        })
    return alerts
