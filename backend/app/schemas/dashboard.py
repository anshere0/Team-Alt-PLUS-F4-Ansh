from typing import Optional, Any
from pydantic import BaseModel
from datetime import datetime

class MetricProvenance(BaseModel):
    value: Any
    status: str
    source: str
    table: Optional[str] = None
    calculated_from: Optional[str] = None
    last_updated: Optional[str] = None
    reason: Optional[str] = None

class DashboardSummary(BaseModel):
    active_smart_meters: MetricProvenance
    active_feeders: MetricProvenance
    transformer_health_index: MetricProvenance
    today_energy_loss_mwh: MetricProvenance
    financial_loss_at_risk: MetricProvenance
    detected_theft_nodes: MetricProvenance
    ai_confidence_score: MetricProvenance
    revenue_recovered_ytd: MetricProvenance

