import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Prediction(Base):
    __tablename__ = "predictions"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    meter_id: Mapped[str] = mapped_column(String, ForeignKey("smart_meters.id"))
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    
    # Load Prediction
    predicted_load_kw: Mapped[float] = mapped_column(Float, nullable=True)
    
    # Risk Prediction
    risk_score: Mapped[float] = mapped_column(Float, nullable=True)
    confidence: Mapped[float] = mapped_column(Float, nullable=True)
    anomaly_type: Mapped[str] = mapped_column(String, nullable=True)
    
    # Financial Impact
    financial_loss_estimate: Mapped[float] = mapped_column(Float, nullable=True)
    
    meter: Mapped["SmartMeter"] = relationship("SmartMeter", back_populates="predictions")
