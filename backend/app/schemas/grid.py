from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SubstationResponse(BaseModel):
    id: str
    code: str
    name: str
    capacity_mva: float
    latitude: float
    longitude: float
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class FeederResponse(BaseModel):
    id: str
    substation_id: str
    code: str
    name: str | None = None
    nominal_voltage_kv: float
    current_load_kw: float

    model_config = ConfigDict(from_attributes=True)

class TransformerResponse(BaseModel):
    id: str
    feeder_id: str
    code: str
    name: str | None = None
    capacity_kva: float
    phase_count: int
    health_index: float

    model_config = ConfigDict(from_attributes=True)

class SmartMeterResponse(BaseModel):
    id: str
    transformer_id: str
    meter_number: str
    consumer_name: str | None = None
    address: str | None = None
    latitude: float
    longitude: float
    status: str

    model_config = ConfigDict(from_attributes=True)
