export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    PROFILE: '/api/v1/auth/profile',
  },
  GRID: {
    STATUS: '/api/v1/grid/status',
    HISTORY: '/api/v1/grid/history',
    REGIONS: '/api/v1/grid/regions',
  },
  PREDICTIONS: {
    LOAD: '/api/v1/predictions/load',
    OUTAGE: '/api/v1/predictions/outage',
    RISK: '/api/v1/predictions/risk',
    JOB: (jobId: string) => `/api/v1/jobs/${jobId}`,
  },
  ALERTS: {
    LIST: '/api/v1/alerts',
    CREATE: '/api/v1/alerts',
    UPDATE: (alertId: string) => `/api/v1/alerts/${alertId}`,
    RESOLVE: (alertId: string) => `/api/v1/alerts/${alertId}/resolve`,
  },
  DASHBOARD: {
    SUMMARY: '/api/v1/dashboard/summary',
    STATISTICS: '/api/v1/dashboard/statistics',
    KPIS: '/api/v1/kpis',
  },
  TOPOLOGY: '/api/v1/topology',
  SIMULATE: '/api/v1/simulate',
} as const;
