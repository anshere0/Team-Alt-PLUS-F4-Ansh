import { create } from 'zustand';
import { GridAlert } from '../types/alert';

const MAX_ALERTS = 100;

interface NotificationState {
  alerts: GridAlert[];
  isWsConnected: boolean;
  addAlert: (alert: GridAlert) => void;
  setWsConnected: (status: boolean) => void;
  acknowledgeAlert: (alertId: string) => void;
  clearAlerts: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  alerts: [],
  isWsConnected: false,
  addAlert: (alert: GridAlert) =>
    set((state) => {
      // Ring buffer eviction protocol: keep max 100 alerts
      const updated = [alert, ...state.alerts];
      if (updated.length > MAX_ALERTS) {
        updated.pop();
      }
      return { alerts: updated };
    }),
  setWsConnected: (isWsConnected: boolean) => set({ isWsConnected }),
  acknowledgeAlert: (alertId: string) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.alert_id === alertId ? { ...a, is_acknowledged: true } : a)),
    })),
  clearAlerts: () => set({ alerts: [] }),
}));
