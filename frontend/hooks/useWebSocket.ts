import { useEffect, useRef } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { useGISStore } from '../store/gisStore';
import { useTopologyStore } from '../store/topologyStore';
import { GridAlert } from '../types/alert';

const BASE_WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/api/v1/ws/stream';

export function useWebSocket() {
  const { addAlert, setWsConnected } = useNotificationStore();
  const updateNodePredictionGIS = useGISStore((s) => s.updateNodePrediction);
  const updateNodePredictionTopology = useTopologyStore((s) => s.updateNodePrediction);
  
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  useEffect(() => {
    let ws: WebSocket | null = null;
    const wsUrl = `${BASE_WS_URL}?token=mock_token`;

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
              // Map simulation scenarios to realistic consumer data
              const CONSUMER_MAP: Record<string, { meter: string; consumer: string; transformer: string; feeder: string; loss: number }> = {
                'PARTIAL_BYPASS': { meter: 'MTR-A1-01-3', consumer: 'Apex Industrial Complex', transformer: 'TX-A1-01', feeder: 'FDR-A1', loss: 84500 },
                'METER_FREEZE': { meter: 'MTR-A2-01-1', consumer: 'Prestige Residential Hub', transformer: 'TX-A2-01', feeder: 'FDR-A2', loss: 45000 },
                'DIRECT_HOOKING': { meter: 'MTR-A1-02-2', consumer: 'Delta Steel Industries', transformer: 'TX-A1-02', feeder: 'FDR-A1', loss: 120000 },
              };
              const scenario = message.data?.scenario || message.data?.anomaly_type || 'PARTIAL_BYPASS';
              const mapped = CONSUMER_MAP[scenario] || CONSUMER_MAP['PARTIAL_BYPASS'];

              const newAlert: GridAlert = {
                alert_id: message.data?.alert_id || `alt-${Date.now()}`,
                meter_id: mapped.meter,
                consumer_name: mapped.consumer,
                transformer_id: mapped.transformer,
                feeder_id: mapped.feeder,
                substation_id: 'SUB-01',
                severity: message.data?.severity || 'CRITICAL',
                anomaly_type: scenario,
                risk_score: message.data?.new_risk_score || message.data?.risk_score || 0.95,
                financial_loss_estimate: message.data?.financial_loss_estimate || mapped.loss,
                message: message.data?.message || message.data?.shap_summary || `AI Detected ${scenario.replace(/_/g, ' ')} anomaly on ${mapped.consumer}`,
                timestamp: new Date().toISOString(),
                is_acknowledged: false,
              };
              addAlert(newAlert);
            }
            
            // Handle AI Predictions for GIS Heatmap & Topology
            if (message.type === 'PREDICTION_UPDATE') {
              const data = message.data;
              if (data && data.meter_id) {
                updateNodePredictionGIS(
                  data.meter_id, 
                  data.risk_score, 
                  data.anomaly_type, 
                  data.financial_loss
                );
                updateNodePredictionTopology(
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
  }, [addAlert, setWsConnected, updateNodePredictionGIS, updateNodePredictionTopology]);
}
