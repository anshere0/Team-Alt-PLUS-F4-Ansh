from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class PredictLoadRequest(BaseModel):
    gridId: str
    currentLoad: float
    temperature: float
    humidity: float
    timestamp: datetime

class PredictRiskRequest(BaseModel):
    gridId: str
    currentLoad: float
    temperature: float
    humidity: float
    timestamp: datetime

class PredictionResponse(BaseModel):
    prediction: float
    confidence: float = Field(..., ge=0.0, le=1.0)
    riskLevel: str
    modelVersion: str
    explanation: List[str]
