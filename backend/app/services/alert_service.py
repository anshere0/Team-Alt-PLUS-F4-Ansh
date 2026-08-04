from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.alert import AlertStatus
from app.repositories.alert_repo import alert_repo

async def get_active_alerts(db: AsyncSession, skip: int = 0, limit: int = 50):
    result = await alert_repo.get_active_alerts_with_relations(db, skip, limit)
    
    alerts = []
    for alert, meter, transformer, feeder, substation in result:
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
