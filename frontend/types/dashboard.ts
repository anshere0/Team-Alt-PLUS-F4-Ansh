export interface KPIMetric {
  id: string;
  title: string;
  value: string | number;
  unit?: string;
  change_percentage: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  status: 'NOMINAL' | 'WARNING' | 'CRITICAL' | 'INFO';
  last_updated: string;
  description?: string;
}

export interface ExecutiveDashboardSummary {
  active_smart_meters: KPIMetric;
  active_feeders: KPIMetric;
  transformer_health_index: KPIMetric;
  today_energy_loss_mwh: KPIMetric;
  financial_loss_at_risk: KPIMetric;
  detected_theft_nodes: KPIMetric;
  ai_confidence_score: KPIMetric;
  revenue_recovered_ytd: KPIMetric;
}

export interface ATCDataPoint {
  timestamp: string;
  expected_draw_kwh: number;
  actual_draw_kwh: number;
  loss_percentage: number;
  unaccounted_kwh: number;
}
