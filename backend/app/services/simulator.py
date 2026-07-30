import asyncio
import random
import logging
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.db.models.grid import Transformer
from app.db.models.meter import SmartMeter, TelemetryReading
from app.db.models.alert import Alert
from app.services.ws_manager import manager
from app.schemas.alert import TelemetryResponse

logger = logging.getLogger(__name__)

SIMULATION_INTERVAL = 5  # Run every 5 seconds

async def generate_telemetry_for_meter(meter: SmartMeter, db: AsyncSession):
    # Base logic: voltage revolves around 230V, current depends on random load
    voltage = random.uniform(225.0, 235.0)
    current = random.uniform(10.0, 50.0)
    
    # Simulate a random anomaly 5% of the time
    anomaly = None
    risk_score = 0.1
    severity = "INFO"
    
    rand_event = random.random()
    if rand_event < 0.05:
        # Voltage drop
        voltage = random.uniform(180.0, 200.0)
        anomaly = "UNDER_VOLTAGE"
        risk_score = 0.8
        severity = "CRITICAL"
    elif rand_event < 0.10:
        # Current spike
        current = random.uniform(80.0, 100.0)
        anomaly = "OVER_CURRENT"
        risk_score = 0.9
        severity = "CRITICAL"

    active_power = (voltage * current * 0.9) / 1000.0 # kWh proxy (instantaneous kW actually)
    
    reading = TelemetryReading(
        meter_id=meter.id,
        timestamp=datetime.now(timezone.utc),
        active_power_kwh=active_power,
        expected_power_kwh=active_power * 0.95,
        voltage_v=voltage,
        current_a=current,
        power_factor=0.9,
        temperature_c=random.uniform(30.0, 60.0),
        risk_score=risk_score,
        anomaly_type=anomaly
    )
    
    db.add(reading)
    
    if anomaly:
        # Create alert
        alert = Alert(
            meter_id=meter.id,
            transformer_id=meter.transformer_id,
            severity=severity,
            risk_score=risk_score,
            anomaly_type=anomaly,
            message=f"Meter {meter.meter_number} reported {anomaly}",
            financial_loss_estimate=random.uniform(100.0, 5000.0),
            status="ACTIVE"
        )
        db.add(alert)
        await db.commit() # Commit to get alert ID
        
        # Broadcast alert via WS
        await manager.broadcast({
            "type": "NEW_ALERT",
            "data": {
                "meter_id": alert.meter_id,
                "severity": alert.severity,
                "message": alert.message
            }
        })
    else:
        await db.commit()
    
    await db.refresh(reading)
    
    # Broadcast telemetry reading
    try:
        response_model = TelemetryResponse.model_validate(reading)
        await manager.broadcast({
            "type": "TELEMETRY_UPDATE",
            "data": response_model.model_dump(mode='json')
        })
    except Exception as e:
        logger.error(f"Error broadcasting telemetry: {e}")

async def run_simulation():
    logger.info("Simulation engine started.")
    try:
        while True:
            async with AsyncSessionLocal() as db:
                # Fetch all meters
                result = await db.execute(select(SmartMeter))
                meters = result.scalars().all()
                
                if meters:
                    # Randomly pick a few meters to update this cycle to prevent overwhelming the DB
                    sampled_meters = random.sample(list(meters), min(len(meters), 3))
                    for meter in sampled_meters:
                        await generate_telemetry_for_meter(meter, db)
                        
            await asyncio.sleep(SIMULATION_INTERVAL)
    except asyncio.CancelledError:
        logger.info("Simulation engine stopped.")
    except Exception as e:
        logger.error(f"Simulation engine error: {e}")
