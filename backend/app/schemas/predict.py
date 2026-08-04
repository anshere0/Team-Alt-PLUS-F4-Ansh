from typing import Any
from datetime import datetime

from pydantic import BaseModel


class PredictRiskRequest(BaseModel):
    gridId: str
    timestamp: datetime
    currentLoad: float
    temperature: float
    humidity: float
    voltage_v: float = 230.0
    current_a: float = 10.0
    power_factor: float = 0.95

class PredictLoadRequest(BaseModel):
    gridId: str
    timestamp: datetime
    currentLoad: float
    temperature: float
    humidity: float

class PredictionResponse(BaseModel):
    prediction: float | str
    confidence: float | None = None
    riskLevel: str | None = None
    modelVersion: str | None = None
    explanation: list[str] = []
    details: dict[str, Any] = {}
