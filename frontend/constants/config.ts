export const UI_CONFIG = {
  refreshIntervalMs: 30000, // 30 seconds
  defaultCurrency: 'INR',
  thresholds: {
    healthIndexWarning: 0.7,
    healthIndexCritical: 0.4,
    riskScoreHigh: 80,
    riskScoreMedium: 50,
  }
};

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  timeoutMs: 10000,
};
