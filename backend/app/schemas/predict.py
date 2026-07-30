from typing import Any

from pydantic import BaseModel


class PredictRiskRequest(BaseModel):
    currentLoad: float
    temperature: float
    humidity: float

class PredictLoadRequest(BaseModel):
    currentLoad: float
    temperature: float
    humidity: float

class PredictionResponse(BaseModel):
    prediction: float | str
    confidence: float | None = None
    details: dict[str, Any] = {}
