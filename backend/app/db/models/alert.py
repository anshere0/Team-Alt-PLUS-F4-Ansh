import uuid
from datetime import datetime, timezone
from enum import Enum

from sqlalchemy import DateTime, Float, ForeignKey, String
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AlertStatus(str, Enum):
    ACTIVE = "ACTIVE"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    RESOLVED = "RESOLVED"

class InspectionStatus(str, Enum):
    PENDING = "PENDING"
    DISPATCHED = "DISPATCHED"
    AUDITED = "AUDITED"

class Alert(Base):
    __tablename__ = "alerts"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    meter_id: Mapped[str] = mapped_column(String, ForeignKey("smart_meters.id"))
    transformer_id: Mapped[str] = mapped_column(String, ForeignKey("transformers.id"))
    severity: Mapped[str] = mapped_column(String)
    risk_score: Mapped[float] = mapped_column(Float)
    anomaly_type: Mapped[str] = mapped_column(String)
    message: Mapped[str] = mapped_column(String)
    financial_loss_estimate: Mapped[float] = mapped_column(Float)
    status: Mapped[AlertStatus] = mapped_column(SQLEnum(AlertStatus), default=AlertStatus.ACTIVE)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class Inspection(Base):
    __tablename__ = "inspections"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    meter_id: Mapped[str] = mapped_column(String, ForeignKey("smart_meters.id"))
    assigned_inspector_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=True)
    priority: Mapped[str] = mapped_column(String)
    status: Mapped[InspectionStatus] = mapped_column(SQLEnum(InspectionStatus), default=InspectionStatus.PENDING)
    financial_loss_estimate: Mapped[float] = mapped_column(Float)
    audit_notes: Mapped[str] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    action: Mapped[str] = mapped_column(String)
    actor_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    target_entity: Mapped[str] = mapped_column(String)
    target_id: Mapped[str] = mapped_column(String)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    details: Mapped[dict] = mapped_column(JSONB, nullable=True)
