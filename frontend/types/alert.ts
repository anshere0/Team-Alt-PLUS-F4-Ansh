export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AnomalyType = 'PARTIAL_BYPASS' | 'METER_FREEZE' | 'DIRECT_HOOKING' | 'PHASE_IMBALANCE' | 'METER_TAMPER';

export interface GridAlert {
  alert_id: string;
  meter_id: string;
  consumer_name?: string;
  transformer_id: string;
  feeder_id: string;
  substation_id: string;
  severity: AlertSeverity;
  anomaly_type: AnomalyType;
  risk_score: number; // 0.00 to 1.00
  financial_loss_estimate: number;
  message: string;
  timestamp: string; // ISO 8601 UTC
  is_acknowledged: boolean;
}
