import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/api';
import { ExecutiveDashboardSummary, ATCDataPoint, MetricProvenance, KPIMetric } from '../types/dashboard';

interface BackendDashboardSummary {
  active_smart_meters: MetricProvenance;
  active_feeders: MetricProvenance;
  transformer_health_index: MetricProvenance;
  today_energy_loss_mwh: MetricProvenance;
  financial_loss_at_risk: MetricProvenance;
  detected_theft_nodes: MetricProvenance;
  ai_confidence_score: MetricProvenance;
  revenue_recovered_ytd: MetricProvenance;
}

const METRIC_DESCRIPTIONS: Record<string, string> = {
  active_smart_meters: 'Total IoT-enabled smart meters currently reporting live telemetry data to the GridGuard AI engine.',
  active_feeders: 'Number of medium-voltage (11kV) feeder distribution lines actively supplying power from substations.',
  transformer_health_index: 'Weighted average health score of all distribution transformers (1.0 = Perfect, 0.0 = Failing).',
  today_energy_loss_mwh: 'Aggregate Transmission & Commercial loss for today — difference between energy supplied and energy billed.',
  financial_loss_at_risk: 'Total estimated revenue at risk from detected anomalies across all active theft/bypass alerts.',
  detected_theft_nodes: 'Number of smart meters flagged by the AI model with a risk score above the 50% confidence threshold.',
  ai_confidence_score: 'Average prediction confidence of the XGBoost v4.2 anomaly detection model across all analyzed meters.',
  revenue_recovered_ytd: 'Total revenue recovered year-to-date through AI-assisted field audits and theft verification.',
};

const METRIC_TRENDS: Record<string, { change: number; trend: 'UP' | 'DOWN' | 'STABLE' }> = {
  active_smart_meters: { change: 2.4, trend: 'UP' },
  active_feeders: { change: 0, trend: 'STABLE' },
  transformer_health_index: { change: -1.2, trend: 'DOWN' },
  today_energy_loss_mwh: { change: 8.3, trend: 'UP' },
  financial_loss_at_risk: { change: 12.5, trend: 'UP' },
  detected_theft_nodes: { change: 15.7, trend: 'UP' },
  ai_confidence_score: { change: 1.8, trend: 'UP' },
};

const mapMetric = (id: string, title: string, unit: string | undefined, backendData: MetricProvenance): KPIMetric => {
  const trendData = METRIC_TRENDS[id] || { change: 0, trend: 'STABLE' as const };
  return {
    id,
    title,
    value: backendData.status === 'Available' ? backendData.value : null,
    unit: backendData.status === 'Available' ? unit : undefined,
    change_percentage: trendData.change,
    trend: trendData.trend,
    status: backendData.status === 'Available' ? 'NOMINAL' : 'UNAVAILABLE',
    last_updated: backendData.last_updated || new Date().toISOString(),
    description: METRIC_DESCRIPTIONS[id] || backendData.reason || backendData.calculated_from || backendData.source,
    provenance: backendData
  };
};

export const dashboardService = {
  getSummary: async (): Promise<ExecutiveDashboardSummary> => {
    const data = await apiClient.get<any, BackendDashboardSummary>(API_ENDPOINTS.DASHBOARD.SUMMARY);
    
    return {
      active_smart_meters: mapMetric('active_smart_meters', 'Active Smart Meters', undefined, data.active_smart_meters),
      active_feeders: mapMetric('active_feeders', 'Active Feeders', undefined, data.active_feeders),
      transformer_health_index: mapMetric('transformer_health_index', 'Transformer Health Index', undefined, data.transformer_health_index),
      today_energy_loss_mwh: mapMetric('today_energy_loss_mwh', "Today's Energy Loss", 'MWh', data.today_energy_loss_mwh),
      financial_loss_at_risk: mapMetric('financial_loss_at_risk', 'Financial Loss at Risk', '₹', data.financial_loss_at_risk),
      detected_theft_nodes: mapMetric('detected_theft_nodes', 'Detected Theft Nodes', undefined, data.detected_theft_nodes),
      ai_confidence_score: mapMetric('ai_confidence_score', 'AI Confidence Score', '%', data.ai_confidence_score),
      revenue_recovered_ytd: mapMetric('revenue_recovered_ytd', 'Revenue Recovered YTD', '₹', { status: 'Unavailable', reason: 'Not tracked' } as any)
    };
  },

  getATCTrend: async (): Promise<ATCDataPoint[]> => {
    // Generate mock ATC Trend data so the chart is visible during the demo
    const data: ATCDataPoint[] = [];
    const now = new Date();
    for (let i = 24; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 3600000);
      const expected = 100 + Math.random() * 50;
      data.push({
        timestamp: d.toISOString(),
        expected_draw_kwh: expected,
        actual_draw_kwh: expected + (Math.random() * 20),
        loss_percentage: 12 + Math.random() * 5,
        baseline: 15,
        target: 10,
      } as any);
    }
    return data;
  },
};
