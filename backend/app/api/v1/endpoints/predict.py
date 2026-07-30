from fastapi import APIRouter, Request

from app.schemas.predict import (
    PredictionResponse,
    PredictLoadRequest,
    PredictRiskRequest,
)
from app.services.prediction_service import prediction_service
from app.core.rate_limit import limiter

router = APIRouter()

@router.post("/risk", response_model=PredictionResponse)
@limiter.limit("20/minute")
async def predict_risk(request: Request, payload: PredictRiskRequest):
    return await prediction_service.predict_risk(payload)

@router.post("/load", response_model=PredictionResponse)
@limiter.limit("20/minute")
async def predict_load(request: Request, payload: PredictLoadRequest):
    return await prediction_service.predict_load(payload)
