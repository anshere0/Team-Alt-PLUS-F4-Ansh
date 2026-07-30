import { useEffect, useRef } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { GridAlert } from '../types/alert';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/alerts';

export function useWebSocket() {
  const { addAlert, setWsConnected } = useNotificationStore();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  useEffect(() => {
    let ws: WebSocket | null = null;

    const connect = () => {
      try {
        ws = new WebSocket(WS_URL);

        ws.onopen = () => {
          setWsConnected(true);
          reconnectAttemptsRef.current = 0;
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.event_type === 'ALERT_TRIGGERED' || message.event_type === 'THEFT_SIMULATED') {
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
  }, [addAlert, setWsConnected]);
}
