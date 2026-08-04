from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AlertResponse(BaseModel):
    id: str
    equipment_type: str
    equipment_id: str
    severity: str
    message: str
    is_resolved: bool
    created_at: datetime
    resolved_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
    
class TelemetryResponse(BaseModel):
    id: str
    meter_id: str
    timestamp: datetime
    active_power_kwh: float
    expected_power_kwh: float
    voltage_v: float
    current_a: float
    power_factor: float
    temperature_c: float
    risk_score: float | None = None
    anomaly_type: str | None = None
    
    model_config = ConfigDict(from_attributes=True)

class ResolveAlertRequest(BaseModel):
    notes: str = ""

class AuditLogResponse(BaseModel):
    id: str
    action: str
    actor_id: str
    target_entity: str
    target_id: str
    timestamp: datetime
    details: dict | None = None

    model_config = ConfigDict(from_attributes=True)
