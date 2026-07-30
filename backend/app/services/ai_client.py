import httpx
import logging
from datetime import datetime
from pydantic import BaseModel

logger = logging.getLogger(__name__)

# Base URL of the AI microservice
AI_SERVICE_URL = "http://localhost:8001"

class PredictRequest(BaseModel):
    gridId: str
    currentLoad: float
    temperature: float
    humidity: float
    timestamp: datetime

class PredictionResponse(BaseModel):
    prediction: float
    confidence: float
    riskLevel: str
    modelVersion: str
    explanation: list[str]

async def get_risk_prediction(meter_id: str, current_load: float, timestamp: datetime) -> PredictionResponse | None:
    request_data = PredictRequest(
        gridId=meter_id,
        currentLoad=current_load,
        temperature=35.0, # Defaulting for now if not available
        humidity=40.0,
        timestamp=timestamp
    )
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(f"{AI_SERVICE_URL}/predict/risk", json=request_data.model_dump(mode='json'))
            if response.status_code == 200:
                return PredictionResponse(**response.json())
            else:
                logger.error(f"AI Service error (Risk): {response.status_code} - {response.text}")
                return None
    except Exception as e:
        logger.error(f"Failed to connect to AI Service (Risk): {e}")
        return None

async def get_load_prediction(meter_id: str, current_load: float, timestamp: datetime) -> PredictionResponse | None:
    request_data = PredictRequest(
        gridId=meter_id,
        currentLoad=current_load,
        temperature=35.0,
        humidity=40.0,
        timestamp=timestamp
    )
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(f"{AI_SERVICE_URL}/predict/load", json=request_data.model_dump(mode='json'))
            if response.status_code == 200:
                return PredictionResponse(**response.json())
            else:
                logger.error(f"AI Service error (Load): {response.status_code} - {response.text}")
                return None
    except Exception as e:
        logger.error(f"Failed to connect to AI Service (Load): {e}")
        return None
