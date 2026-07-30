from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total_substations: int
    total_feeders: int
    total_transformers: int
    total_smart_meters: int
    total_power_load_kw: float
    active_critical_alerts: int
    system_health_index: float
