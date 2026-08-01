import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';

export function useDashboard() {
  const summaryQuery = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardService.getSummary,
    staleTime: 5000,
    refetchInterval: 10000,
    retry: 1,
  });

  const atcQuery = useQuery({
    queryKey: ['dashboard-atc-trend'],
    queryFn: dashboardService.getATCTrend,
    staleTime: 10000,
    retry: 1,
  });

  return {
    summary: summaryQuery.data,
    atcTrend: atcQuery.data || [],
    isLoading: summaryQuery.isLoading || atcQuery.isLoading,
    isError: summaryQuery.isError || atcQuery.isError,
    refetch: () => {
      summaryQuery.refetch();
      atcQuery.refetch();
    },
  };
}
