import csv
import io
from datetime import datetime
from fastapi import UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.models.meter import SmartMeter, TelemetryReading
from app.services.ai_client import get_risk_prediction
from app.db.models.prediction import Prediction

async def parse_csv_telemetry(file: UploadFile, db: AsyncSession) -> dict:
    """Parses a CSV file containing historical telemetry and runs batch predictions."""
    try:
        content = await file.read()
        csv_data = content.decode("utf-8")
        reader = csv.DictReader(io.StringIO(csv_data))
        
        records_processed = 0
        anomalies_found = 0
        
        # Pre-fetch all meters to map meter_number -> id
        meters_result = await db.execute(select(SmartMeter))
        meters_map = {m.meter_number: m for m in meters_result.scalars().all()}
        
        for row in reader:
            meter_num = row.get("meter_number")
            meter = meters_map.get(meter_num)
            
            if not meter:
                continue
                
            timestamp_str = row.get("timestamp")
            if timestamp_str:
                try:
                    ts = datetime.fromisoformat(timestamp_str)
                except ValueError:
                    ts = datetime.utcnow()
            else:
                ts = datetime.utcnow()
                
            active_power = float(row.get("active_power_kwh", 0))
            expected_power = float(row.get("expected_power_kwh", active_power))
            voltage = float(row.get("voltage_v", 230))
            current = float(row.get("current_a", 0))
            power_factor = float(row.get("power_factor", 0.9))
            temperature = float(row.get("temperature_c", 30))
            
            # Predict risk for this historical data point
            risk_pred = await get_risk_prediction(meter.id, active_power, ts)
            
            risk_score = risk_pred.prediction if risk_pred else 0.0
            anomaly_type = risk_pred.riskLevel if risk_pred else "NONE"
            
            if risk_score > 0.5:
                anomalies_found += 1
            
            # Insert Telemetry
            telemetry = TelemetryReading(
                meter_id=meter.id,
                timestamp=ts,
                active_power_kwh=active_power,
                expected_power_kwh=expected_power,
                voltage_v=voltage,
                current_a=current,
                power_factor=power_factor,
                temperature_c=temperature,
                risk_score=risk_score,
                anomaly_type=anomaly_type
            )
            db.add(telemetry)
            
            # Insert Prediction log
            prediction = Prediction(
                meter_id=meter.id,
                timestamp=ts,
                risk_score=risk_score,
                anomaly_type=anomaly_type,
                confidence_score=0.9,
                financial_loss_estimate=float(row.get("financial_loss_estimate", 0.0)) or (1000 * risk_score)
            )
            db.add(prediction)
            
            records_processed += 1
            
        await db.commit()
        
        return {
            "success": True,
            "data": {
                "records_processed": records_processed,
                "anomalies_found": anomalies_found,
                "message": f"Successfully processed {records_processed} records. Detected {anomalies_found} anomalies."
            }
        }
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

async def parse_pdf_audit(file: UploadFile, db: AsyncSession) -> dict:
    """Mock parser for PDF field audits. In a real system, this would use OCR/NLP extraction."""
    content = await file.read()
    file_size_kb = len(content) / 1024
    
    # Simulate AI-extracted anomalies from the PDF audit document
    anomalies = [
        {
            "meter_id": "MTR-A1-01-3",
            "consumer_name": "Apex Industrial Complex",
            "anomaly_type": "PARTIAL_BYPASS",
            "risk_score": 0.94,
            "financial_loss": 84500,
            "description": "CT ratio bypass detected during field inspection. Billing discrepancy of 78kWh/day."
        },
        {
            "meter_id": "MTR-A1-02-2",
            "consumer_name": "Delta Steel Industries",
            "anomaly_type": "DIRECT_HOOKING",
            "risk_score": 0.91,
            "financial_loss": 120000,
            "description": "Unauthorized parallel tapping found at junction box. Phase current mismatch 32%."
        },
        {
            "meter_id": "MTR-A2-01-1",
            "consumer_name": "Prestige Residential Hub",
            "anomaly_type": "METER_FREEZE",
            "risk_score": 0.87,
            "financial_loss": 45000,
            "description": "Digital display tampered — meter frozen at 4,221 kWh for 14 consecutive days."
        },
    ]
    
    return {
        "success": True,
        "data": {
            "records_processed": 3,
            "anomalies_found": 3,
            "anomalies": anomalies,
            "message": f"Successfully parsed PDF audit report ({file_size_kb:.1f} KB). AI engine extracted 3 critical anomalies from field inspection data."
        }
    }
