import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { alertService } from '../services/alertService';
import { useNotificationStore } from '../store/notificationStore';

export function useAlerts() {
  const { alerts, addAlert, acknowledgeAlert } = useNotificationStore();

  const query = useQuery({
    queryKey: ['grid-alerts'],
    queryFn: alertService.getAlerts,
    staleTime: 5000,
  });

  useEffect(() => {
    if (query.data && query.data.length > 0 && alerts.length === 0) {
      query.data.forEach((alert) => addAlert(alert));
    }
  }, [query.data, alerts.length, addAlert]);

  return {
    alerts,
    isLoading: query.isLoading,
    acknowledgeAlert: (alertId: string) => {
      acknowledgeAlert(alertId);
      alertService.acknowledgeAlert(alertId);
    },
  };
}
