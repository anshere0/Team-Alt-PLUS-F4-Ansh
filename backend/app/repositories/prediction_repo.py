from typing import List, Optional
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.repositories.base import BaseRepository
from app.db.models.prediction import Prediction

class PredictionCreate(BaseModel):
    meter_id: str
    timestamp: datetime
    predicted_load_kw: Optional[float] = None
    risk_score: Optional[float] = None
    confidence: Optional[float] = None
    anomaly_type: Optional[str] = None
    financial_loss_estimate: Optional[float] = None

class PredictionUpdate(BaseModel):
    pass

class PredictionRepository(BaseRepository[Prediction, PredictionCreate, PredictionUpdate]):
    def __init__(self):
        super().__init__(Prediction)
        
    async def get_by_meter_id(self, db: AsyncSession, meter_id: str) -> List[Prediction]:
        query = select(Prediction).where(Prediction.meter_id == meter_id).order_by(Prediction.timestamp.desc())
        result = await db.execute(query)
        return list(result.scalars().all())

prediction_repo = PredictionRepository()
