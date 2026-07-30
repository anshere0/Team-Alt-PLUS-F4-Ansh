import numpy as np
from fastapi import APIRouter, HTTPException

from api.schemas import PredictionResponse, PredictLoadRequest, PredictRiskRequest
from inference.predictor import InferencePredictor

router = APIRouter()

@router.post("/predict/risk", response_model=PredictionResponse)
async def predict_risk(request: PredictRiskRequest):
    predictor = InferencePredictor()
    if not predictor.is_ready:
        raise HTTPException(status_code=503, detail="Model is not ready")
        
    try:
        features = np.array([request.currentLoad, request.temperature, request.humidity])
        result = predictor.predict(features)
        return PredictionResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict/load", response_model=PredictionResponse)
async def predict_load(request: PredictLoadRequest):
    predictor = InferencePredictor()
    if not predictor.is_ready:
        raise HTTPException(status_code=503, detail="Model is not ready")
        
    try:
        features = np.array([request.currentLoad, request.temperature, request.humidity])
        result = predictor.predict_load(features)
        return PredictionResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
