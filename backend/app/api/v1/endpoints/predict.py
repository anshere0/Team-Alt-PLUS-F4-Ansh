from fastapi import APIRouter

from app.schemas.predict import (
    PredictionResponse,
    PredictLoadRequest,
    PredictRiskRequest,
)
from app.services.prediction_service import prediction_service

router = APIRouter()

@router.post("/risk", response_model=PredictionResponse)
async def predict_risk(request: PredictRiskRequest):
    return await prediction_service.predict_risk(request)

@router.post("/load", response_model=PredictionResponse)
async def predict_load(request: PredictLoadRequest):
    return await prediction_service.predict_load(request)
