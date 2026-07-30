import logging

import httpx
from fastapi import HTTPException

from app.core.config import settings
from app.schemas.predict import (
    PredictionResponse,
    PredictLoadRequest,
    PredictRiskRequest,
)

logger = logging.getLogger(__name__)

class PredictionService:
    def __init__(self):
        self.base_url = settings.AI_SERVICE_URL
        self.timeout = 10.0

    async def predict_risk(self, request: PredictRiskRequest) -> PredictionResponse:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/predict/risk",
                    json=request.model_dump()
                )
                response.raise_for_status()
                return PredictionResponse(**response.json())
            except httpx.RequestError as e:
                logger.error(f"Error communicating with AI Service: {e}")
                raise HTTPException(status_code=503, detail="AI Service is unreachable")
            except httpx.HTTPStatusError as e:
                logger.error(f"AI Service returned an error: {e}")
                raise HTTPException(status_code=e.response.status_code, detail=f"AI Service Error: {e.response.text}")

    async def predict_load(self, request: PredictLoadRequest) -> PredictionResponse:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/predict/load",
                    json=request.model_dump()
                )
                response.raise_for_status()
                return PredictionResponse(**response.json())
            except httpx.RequestError as e:
                logger.error(f"Error communicating with AI Service: {e}")
                raise HTTPException(status_code=503, detail="AI Service is unreachable")
            except httpx.HTTPStatusError as e:
                logger.error(f"AI Service returned an error: {e}")
                raise HTTPException(status_code=e.response.status_code, detail=f"AI Service Error: {e.response.text}")

prediction_service = PredictionService()
