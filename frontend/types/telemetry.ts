export interface SmartMeterTelemetry {
  meter_id: string;
  consumer_name: string;
  substation_id: string;
  feeder_id: string;
  transformer_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  active_power_kwh: number;
  expected_power_kwh: number;
  voltage_v: number;
  current_a: number;
  power_factor: number;
  temperature_c: number;
  risk_score: number;
  anomaly_type: 'NORMAL' | 'PARTIAL_BYPASS' | 'METER_FREEZE' | 'DIRECT_HOOKING' | 'PHASE_IMBALANCE';
}

export interface ShapContribution {
  feature_name: string;
  feature_value: string | number;
  shap_score: number; // positive = pushes risk higher, negative = lowers risk
  description: string;
}

export interface ShapExplanationResponse {
  meter_id: string;
  overall_risk_score: number;
  ai_summary: string;
  contributions: ShapContribution[];
}
