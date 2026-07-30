import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class SmartMeter(Base):
    __tablename__ = "smart_meters"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    transformer_id: Mapped[str] = mapped_column(String, ForeignKey("transformers.id"))
    meter_number: Mapped[str] = mapped_column(String, unique=True, index=True)
    consumer_name: Mapped[str] = mapped_column(String)
    address: Mapped[str] = mapped_column(String)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String, default="ACTIVE")
    
    telemetry_readings: Mapped[list["TelemetryReading"]] = relationship("TelemetryReading", back_populates="meter", cascade="all, delete-orphan")
    predictions: Mapped[list["Prediction"]] = relationship("Prediction", back_populates="meter", cascade="all, delete-orphan")

class TelemetryReading(Base):
    __tablename__ = "telemetry_readings"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    meter_id: Mapped[str] = mapped_column(String, ForeignKey("smart_meters.id"))
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    active_power_kwh: Mapped[float] = mapped_column(Float)
    expected_power_kwh: Mapped[float] = mapped_column(Float)
    voltage_v: Mapped[float] = mapped_column(Float)
    current_a: Mapped[float] = mapped_column(Float)
    power_factor: Mapped[float] = mapped_column(Float)
    temperature_c: Mapped[float] = mapped_column(Float)
    risk_score: Mapped[float] = mapped_column(Float, nullable=True)
    anomaly_type: Mapped[str] = mapped_column(String, nullable=True)
    
    meter: Mapped["SmartMeter"] = relationship("SmartMeter", back_populates="telemetry_readings")
