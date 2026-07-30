import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Substation(Base):
    __tablename__ = "substations"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String)
    code: Mapped[str] = mapped_column(String, unique=True, index=True)
    capacity_mva: Mapped[float] = mapped_column(Float)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    feeders: Mapped[list["Feeder"]] = relationship("Feeder", back_populates="substation", cascade="all, delete-orphan")

class Feeder(Base):
    __tablename__ = "feeders"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    substation_id: Mapped[str] = mapped_column(String, ForeignKey("substations.id"))
    code: Mapped[str] = mapped_column(String, unique=True, index=True)
    nominal_voltage_kv: Mapped[float] = mapped_column(Float)
    current_load_kw: Mapped[float] = mapped_column(Float)
    
    substation: Mapped["Substation"] = relationship("Substation", back_populates="feeders")
    transformers: Mapped[list["Transformer"]] = relationship("Transformer", back_populates="feeder", cascade="all, delete-orphan")

class Transformer(Base):
    __tablename__ = "transformers"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    feeder_id: Mapped[str] = mapped_column(String, ForeignKey("feeders.id"))
    code: Mapped[str] = mapped_column(String, unique=True, index=True)
    capacity_kva: Mapped[float] = mapped_column(Float)
    phase_count: Mapped[int] = mapped_column(Integer)
    health_index: Mapped[float] = mapped_column(Float) # 0.0 - 1.0
    
    feeder: Mapped["Feeder"] = relationship("Feeder", back_populates="transformers")
