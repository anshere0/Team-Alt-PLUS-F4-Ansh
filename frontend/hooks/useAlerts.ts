import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { alertService } from '../services/alertService';
import { useNotificationStore } from '../store/notificationStore';

export function useAlerts() {
  const { alerts, addAlert, acknowledgeAlert, clearAlerts } = useNotificationStore();
  const seeded = useRef(false);

  const query = useQuery({
    queryKey: ['grid-alerts'],
    queryFn: alertService.getAlerts,
    staleTime: 5000,
  });

  useEffect(() => {
    // Seed backend alerts on first successful fetch, replacing any WS-generated placeholder alerts
    if (query.data && query.data.length > 0 && !seeded.current) {
      seeded.current = true;
      clearAlerts();
      query.data.forEach((alert) => addAlert(alert));
    }
  }, [query.data, addAlert, clearAlerts]);

  return {
    alerts,
    isLoading: query.isLoading,
    acknowledgeAlert: async (alertId: string) => {
      // Optimistic update
      acknowledgeAlert(alertId);
      try {
        await alertService.acknowledgeAlert(alertId);
      } catch (error) {
        // Revert could go here if we had an un-acknowledge action
        console.error("Failed to acknowledge on server", error);
      }
    },
  };
}
