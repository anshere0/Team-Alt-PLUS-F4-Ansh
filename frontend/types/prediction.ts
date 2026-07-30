export interface PredictionRequest {
  target_id: string; // meter_id or feeder_id
  time_window: string;
}

export interface PredictionResponse {
  job_id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  target_id: string;
  predicted_risk_score: number;
  predicted_loss_kwh: number;
  confidence: number;
  estimated_completion_time?: string;
  summary: string;
}
