import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/api';
import { ExecutiveDashboardSummary, ATCDataPoint } from '../types/dashboard';
import { MOCK_DASHBOARD_SUMMARY, MOCK_ATC_TREND } from './mockData';

export const dashboardService = {
  getSummary: async (): Promise<ExecutiveDashboardSummary> => {
    try {
      return await apiClient.get<any, ExecutiveDashboardSummary>(API_ENDPOINTS.DASHBOARD.SUMMARY);
    } catch {
      return MOCK_DASHBOARD_SUMMARY;
    }
  },

  getATCTrend: async (): Promise<ATCDataPoint[]> => {
    try {
      return await apiClient.get<any, ATCDataPoint[]>(API_ENDPOINTS.DASHBOARD.STATISTICS);
    } catch {
      return MOCK_ATC_TREND;
    }
  },
};
