import asyncio
import logging
import random
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.db.models.alert import Alert
from app.db.models.meter import SmartMeter, TelemetryReading
from app.db.models.prediction import Prediction
from app.schemas.alert import TelemetryResponse
from app.services.prediction_service import prediction_service
from app.schemas.predict import PredictRiskRequest, PredictLoadRequest
from app.services.ws_manager import manager

logger = logging.getLogger(__name__)

SIMULATION_INTERVAL = 5  # Run every 5 seconds

# Fixed tariff for financial loss calculation (₹ per kWh)
TARIFF_RATE = 8.5

async def generate_telemetry_for_meter(meter: SmartMeter, db: AsyncSession):
    # 1. Base telemetry generation (normal bounds)
    voltage = random.uniform(225.0, 235.0)
    current = random.uniform(10.0, 50.0)
    power_factor = 0.95
    
    # Optional: We can still introduce some random anomalous base readings 
    # to test the AI's detection, but the AI will actually score it.
    rand_event = random.random()
    if rand_event < 0.05:
        # Voltage drop (anomalous)
        voltage = random.uniform(180.0, 200.0)
    elif rand_event < 0.10:
        # Power factor drop
        power_factor = random.uniform(0.60, 0.75)

    active_power = (voltage * current * power_factor) / 1000.0 
    timestamp = datetime.now(timezone.utc)

    reading = TelemetryReading(
        meter_id=meter.id,
        timestamp=timestamp,
        active_power_kwh=active_power,
        expected_power_kwh=active_power * 0.95,
        voltage_v=voltage,
        current_a=current,
        power_factor=power_factor,
        temperature_c=random.uniform(30.0, 60.0),
        risk_score=0.0, # Will be updated by AI later or kept if AI fails
        anomaly_type=None
    )
    
    db.add(reading)
    await db.flush() # Flush to get reading in DB session
    
    # 2. Call true AI Service
    risk_req = PredictRiskRequest(
        gridId=meter.id, timestamp=timestamp, currentLoad=active_power,
        temperature=35.0, humidity=40.0, voltage_v=voltage, current_a=current, power_factor=power_factor
    )
    load_req = PredictLoadRequest(gridId=meter.id, timestamp=timestamp, currentLoad=active_power, temperature=35.0, humidity=40.0)
    
    risk_pred = await prediction_service.predict_risk(risk_req, db)
    load_pred = await prediction_service.predict_load(load_req, db)
    
    risk_score = risk_pred.prediction if risk_pred else 0.1
    confidence = risk_pred.confidence if risk_pred else 0.9
    anomaly = risk_pred.riskLevel if risk_pred else "NORMAL"
    
    pred_load = load_pred.prediction if load_pred else active_power * 0.95
    
    # Financial impact calculation: (Actual - Predicted) * Rate if Actual > Predicted
    financial_loss = 0.0
    if active_power > pred_load and risk_score > 0.5:
        financial_loss = (active_power - pred_load) * TARIFF_RATE
        
    # Create Prediction record
    prediction = Prediction(
        meter_id=meter.id,
        timestamp=timestamp,
        predicted_load_kw=pred_load,
        risk_score=risk_score,
        confidence=confidence,
        anomaly_type=anomaly,
        financial_loss_estimate=financial_loss
    )
    db.add(prediction)
    
    # Update reading with AI results
    reading.risk_score = risk_score
    reading.anomaly_type = anomaly
    
    # 3. Alert Generation
    if risk_score > 0.75:
        severity = "CRITICAL" if risk_score > 0.9 else "WARNING"
        alert = Alert(
            meter_id=meter.id,
            transformer_id=meter.transformer_id,
            severity=severity,
            risk_score=risk_score,
            anomaly_type=anomaly,
            message=f"AI Detected {anomaly} with {risk_score*100:.1f}% risk (Confidence: {confidence*100:.1f}%)",
            financial_loss_estimate=financial_loss,
            status="ACTIVE"
        )
        db.add(alert)
        await db.commit() # Commit to get alert ID
        
        # Broadcast fully hydrated alert via WS
        await manager.broadcast({
            "type": "NEW_ALERT",
            "data": {
                "alert_id": alert.id,
                "meter_id": alert.meter_id,
                "consumer_name": meter.consumer_name,
                "transformer_id": meter.transformer_id,
                "severity": alert.severity,
                "anomaly_type": anomaly,
                "risk_score": risk_score,
                "financial_loss_estimate": financial_loss,
                "message": alert.message
            }
        })
    else:
        await db.commit()
    
    await db.refresh(reading)
    
    # 4. Broadcast Telemetry & Prediction
    try:
        response_model = TelemetryResponse.model_validate(reading)
        await manager.broadcast({
            "type": "TELEMETRY_UPDATE",
            "data": response_model.model_dump(mode='json')
        })
        
        await manager.broadcast({
            "type": "PREDICTION_UPDATE",
            "data": {
                "meter_id": meter.id,
                "risk_score": risk_score,
                "confidence": confidence,
                "predicted_load": pred_load,
                "anomaly_type": anomaly,
                "financial_loss": financial_loss
            }
        })
    except Exception as e:
        logger.error(f"Error broadcasting updates: {e}")

async def run_simulation():
    logger.info("Simulation engine started with AI Integration.")
    try:
        while True:
            async with AsyncSessionLocal() as db:
                # Fetch all meters
                result = await db.execute(select(SmartMeter))
                meters = result.scalars().all()
                
                if meters:
                    sampled_meters = random.sample(list(meters), min(len(meters), 3))
                    for meter in sampled_meters:
                        await generate_telemetry_for_meter(meter, db)
                        
            await asyncio.sleep(SIMULATION_INTERVAL)
    except asyncio.CancelledError:
        logger.info("Simulation engine stopped.")
    except Exception as e:
        logger.error(f"Simulation engine error: {e}")
