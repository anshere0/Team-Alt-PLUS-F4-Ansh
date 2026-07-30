import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/api';
import { SmartMeterTelemetry, ShapExplanationResponse } from '../types/telemetry';
import { GridTopologyResponse } from '../types/topology';
import { MOCK_TELEMETRY, MOCK_SHAP_EXPLANATION, MOCK_TOPOLOGY_DATA } from './mockData';

export const gridService = {
  getTopology: async (): Promise<GridTopologyResponse> => {
    try {
      return await apiClient.get<any, GridTopologyResponse>(API_ENDPOINTS.TOPOLOGY);
    } catch {
      return MOCK_TOPOLOGY_DATA;
    }
  },

  getMeterTelemetry: async (meterId: string): Promise<{ telemetry: SmartMeterTelemetry; shap: ShapExplanationResponse }> => {
    try {
      return await apiClient.get(`/api/v1/meters/${meterId}`);
    } catch {
      return {
        telemetry: { ...MOCK_TELEMETRY, meter_id: meterId },
        shap: MOCK_SHAP_EXPLANATION,
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
