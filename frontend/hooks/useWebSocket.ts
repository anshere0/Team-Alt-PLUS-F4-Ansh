import { useEffect, useRef } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { useAuthStore } from '../store/authStore';
import { useGISStore } from '../store/gisStore';
import { GridAlert } from '../types/alert';

const BASE_WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/api/v1/ws/stream';

export function useWebSocket() {
  const { addAlert, setWsConnected } = useNotificationStore();
  const { token } = useAuthStore();
  const updateNodePrediction = useGISStore((s) => s.updateNodePrediction);
  
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  useEffect(() => {
    // Wait until token is available
    if (!token) return;

    let ws: WebSocket | null = null;
    const wsUrl = `${BASE_WS_URL}?token=${token}`;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setWsConnected(true);
          reconnectAttemptsRef.current = 0;
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            
            // Handle Alerts
            if (message.type === 'NEW_ALERT' || message.event_type === 'ALERT_TRIGGERED' || message.event_type === 'THEFT_SIMULATED') {
              const newAlert: GridAlert = {
                alert_id: message.data?.alert_id || `alt-${Date.now()}`,
                meter_id: message.data?.meter_id || message.data?.target_meter_id || 'MTR-SIMULATED',
                transformer_id: message.data?.transformer_id || 'TR-SIMULATED',
                feeder_id: 'FDR-04',
                substation_id: 'SUB-01',
                severity: message.data?.severity || 'CRITICAL',
                anomaly_type: message.data?.scenario || message.data?.anomaly_type || 'PARTIAL_BYPASS',
                risk_score: message.data?.new_risk_score || message.data?.risk_score || 0.95,
                financial_loss_estimate: message.data?.financial_loss_estimate || 45000,
                message: message.data?.message || message.data?.shap_summary || 'Live anomaly detected!',
                timestamp: new Date().toISOString(),
                is_acknowledged: false,
              };
              addAlert(newAlert);
            }
            
            // Handle AI Predictions for GIS Heatmap
            if (message.type === 'PREDICTION_UPDATE') {
              const data = message.data;
              if (data && data.meter_id) {
                updateNodePrediction(
                  data.meter_id, 
                  data.risk_score, 
                  data.anomaly_type, 
                  data.financial_loss
                );
              }
            }
            
          } catch {
            // Ignore malformed JSON
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
          // Exponential backoff reconnect
          const backoff = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 16000);
          reconnectAttemptsRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(connect, backoff);
        };

        ws.onerror = () => {
          ws?.close();
        };
      } catch {
        setWsConnected(false);
      }
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (ws) ws.close();
    };
  }, [token, addAlert, setWsConnected, updateNodePrediction]);
}
