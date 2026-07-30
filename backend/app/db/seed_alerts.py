import asyncio
import os
import sys
from datetime import datetime, timezone, timedelta
import random
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.db.models.alert import Alert
from app.db.models.meter import SmartMeter
from app.db.models.prediction import Prediction

async def seed_alerts(db):
    meters = (await db.execute(select(SmartMeter))).scalars().all()
    if not meters:
        print('No meters found')
        return
    
    alerts_data = [
        ('DIRECT_HOOKING', 120000, 0.96),
        ('PARTIAL_BYPASS', 84500, 0.94),
        ('METER_FREEZE', 45000, 0.88),
        ('PHASE_IMBALANCE', 30000, 0.75),
        ('DIRECT_HOOKING', 150000, 0.98)
    ]
    
    for i, (atype, loss, conf) in enumerate(alerts_data):
        m = random.choice(meters)
        now = datetime.now(timezone.utc) - timedelta(hours=i)
        # Create prediction
        pred = Prediction(meter_id=m.id, timestamp=now, risk_score=conf, confidence=conf, financial_loss_estimate=loss)
        db.add(pred)
        
        alert = Alert(meter_id=m.id, transformer_id=m.transformer_id, risk_score=conf, financial_loss_estimate=loss, anomaly_type=atype, severity='CRITICAL', message=f'{atype} detected on {m.consumer_name}', status='ACTIVE', created_at=now)
        db.add(alert)
    await db.commit()
    print('Alerts and predictions seeded.')

async def main():
    async with AsyncSessionLocal() as db:
        await seed_alerts(db)

if __name__ == '__main__':
    asyncio.run(main())
