from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class AlertResponse(BaseModel):
    id: str
    equipment_type: str
    equipment_id: str
    severity: str
    message: str
    is_resolved: bool
    created_at: datetime
    resolved_at: Optional[datetime] = None

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
    risk_score: Optional[float] = None
    anomaly_type: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)
