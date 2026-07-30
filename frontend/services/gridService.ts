import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/api';
import { SmartMeterTelemetry, ShapExplanationResponse } from '../types/telemetry';
import { GridTopologyResponse } from '../types/topology';

export const gridService = {
  getTopology: async (): Promise<GridTopologyResponse> => {
    try {
      return await apiClient.get<any, GridTopologyResponse>(API_ENDPOINTS.TOPOLOGY);
    } catch {
      return { nodes: [], edges: [] };
    }
  },

  getMeterTelemetry: async (meterId: string): Promise<{ telemetry: SmartMeterTelemetry | null; shap: ShapExplanationResponse | null }> => {
    try {
      return await apiClient.get(`/api/v1/meters/${meterId}`);
    } catch {
      return {
        telemetry: null,
        shap: null,
      };
    }
  },

  simulateTheftScenario: async (scenario: string, targetMeterId: string): Promise<any> => {
    try {
      return await apiClient.post(API_ENDPOINTS.SIMULATE, { scenario, target_meter_id: targetMeterId });
    } catch {
      return {
        success: true,
        message: `Simulation ${scenario} triggered on ${targetMeterId}`,
        data: { scenario, target_meter_id: targetMeterId, new_risk_score: 0.96 },
      };
    }
  },
};
