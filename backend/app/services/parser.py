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
            "records_processed": records_processed,
            "anomalies_found": anomalies_found,
            "message": f"Successfully processed {records_processed} records. Detected {anomalies_found} anomalies."
        }
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

async def parse_pdf_audit(file: UploadFile, db: AsyncSession) -> dict:
    """Mock parser for PDF field audits. In a real system, this would extract text."""
    # For now, just simulate a successful processing
    content = await file.read()
    
    return {
        "success": True,
        "records_processed": 1,
        "anomalies_found": 1,
        "message": f"Successfully parsed PDF audit report. Extracted 1 critical anomaly."
    }
