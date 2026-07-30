import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/api';
import { GridAlert } from '../types/alert';
import { MOCK_ALERTS } from './mockData';

export const alertService = {
  getAlerts: async (): Promise<GridAlert[]> => {
    try {
      return await apiClient.get<any, GridAlert[]>(API_ENDPOINTS.ALERTS.LIST);
    } catch {
      return MOCK_ALERTS;
    }
  },

  acknowledgeAlert: async (alertId: string): Promise<boolean> => {
    try {
      await apiClient.patch(API_ENDPOINTS.ALERTS.UPDATE(alertId), { is_acknowledged: true });
      return true;
    } catch {
      return true;
    }
  },
};
