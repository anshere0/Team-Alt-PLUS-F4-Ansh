import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/api';
import { GridAlert } from '../types/alert';

export const alertService = {
  getAlerts: async (): Promise<GridAlert[]> => {
    try {
      return await apiClient.get<any, GridAlert[]>(API_ENDPOINTS.ALERTS.LIST);
    } catch {
      return [];
    }
  },

  acknowledgeAlert: async (alertId: string): Promise<boolean> => {
    try {
      await apiClient.put(API_ENDPOINTS.ALERTS.RESOLVE(alertId), { notes: "Resolved via dashboard" });
      return true;
    } catch (error) {
      console.error("Failed to resolve alert:", error);
      throw error;
    }
  },
};
