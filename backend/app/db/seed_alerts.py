import asyncio
import os
import sys
from datetime import datetime, timezone, timedelta
import random
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from sqlalchemy import select, delete
from app.core.database import AsyncSessionLocal
from app.db.models.alert import Alert
from app.db.models.meter import SmartMeter
from app.db.models.prediction import Prediction

async def seed_alerts(db):
    meters = (await db.execute(select(SmartMeter))).scalars().all()
    if not meters:
        print('No meters found')
        return
    
    # Clear existing alerts to avoid duplicates
    await db.execute(delete(Alert))
    await db.commit()
    
    alerts_data = [
        ('DIRECT_HOOKING', 120000, 0.96, 'CRITICAL', 'Unauthorized parallel connection detected via phase current mismatch analysis.'),
        ('PARTIAL_BYPASS', 84500, 0.94, 'CRITICAL', 'Sudden 78% drop in active draw during peak hours without corresponding load shift.'),
        ('METER_FREEZE', 45000, 0.88, 'HIGH', 'Meter reading flatlined for 72h while downstream load remained active.'),
        ('PHASE_IMBALANCE', 30000, 0.75, 'HIGH', 'Phase voltage imbalance exceeding 12% threshold during night hours.'),
        ('DIRECT_HOOKING', 150000, 0.98, 'CRITICAL', 'Multiple unauthorized taps detected on feeder line with 43% energy loss.'),
        ('PARTIAL_BYPASS', 56000, 0.82, 'HIGH', 'CT ratio bypass detected. Billing discrepancy of 56kWh/day.'),
        ('METER_TAMPER', 22000, 0.68, 'MEDIUM', 'Seal integrity compromised - physical tamper signature detected.'),
        ('DIRECT_HOOKING', 98000, 0.91, 'CRITICAL', 'Direct hooking with load diversion from adjacent feeder line.'),
    ]
    
    # Assign alerts to different meters to get variety
    for i, (atype, loss, conf, sev, msg) in enumerate(alerts_data):
        m = meters[i % len(meters)]
        now = datetime.now(timezone.utc) - timedelta(hours=i * 2)
        
        # Create prediction
        pred = Prediction(meter_id=m.id, timestamp=now, risk_score=conf, confidence=conf, financial_loss_estimate=loss)
        db.add(pred)
        
        alert = Alert(
            meter_id=m.id, 
            transformer_id=m.transformer_id, 
            risk_score=conf, 
            financial_loss_estimate=loss, 
            anomaly_type=atype, 
            severity=sev, 
            message=f'{msg} Consumer: {m.consumer_name}', 
            status='ACTIVE', 
            created_at=now
        )
        db.add(alert)
    await db.commit()
    print(f'Seeded {len(alerts_data)} alerts across {len(meters)} meters.')

async def main():
    async with AsyncSessionLocal() as db:
        await seed_alerts(db)

if __name__ == '__main__':
    asyncio.run(main())
