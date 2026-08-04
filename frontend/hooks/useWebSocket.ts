import { useEffect, useRef } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { useGISStore } from '../store/gisStore';
import { useTopologyStore } from '../store/topologyStore';
import { GridAlert } from '../types/alert';
import { getMockToken, WS_BASE_URL } from '../services/apiClient';

export function useWebSocket() {
  const { addAlert, setWsConnected } = useNotificationStore();
  const updateNodePredictionGIS = useGISStore((s) => s.updateNodePrediction);
  const updateNodePredictionTopology = useTopologyStore((s) => s.updateNodePrediction);
  
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let isMounted = true;

    const connect = async () => {
      const token = await getMockToken();
      if (!isMounted) return;
      
      const wsUrl = `${WS_BASE_URL}?token=${token}`;
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
            if (message.type === 'NEW_ALERT' || message.event_type === 'ALERT_TRIGGERED') {
              const newAlert: GridAlert = {
                alert_id: message.data?.alert_id || `alt-${Date.now()}`,
                meter_id: message.data?.meter_id || 'UNKNOWN_METER',
                consumer_name: message.data?.consumer_name || 'Unknown Consumer',
                transformer_id: message.data?.transformer_id || 'UNKNOWN_TX',
                feeder_id: message.data?.feeder_id || 'UNKNOWN_FDR',
                substation_id: message.data?.substation_id || 'SUB-01',
                severity: message.data?.severity || 'CRITICAL',
                anomaly_type: message.data?.anomaly_type || 'UNKNOWN_ANOMALY',
                risk_score: message.data?.risk_score || 0.90,
                financial_loss_estimate: message.data?.financial_loss_estimate || 0.0,
                message: message.data?.message || 'AI detected an anomaly.',
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
      isMounted = false;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (ws) ws.close();
    };
  }, [addAlert, setWsConnected, updateNodePredictionGIS, updateNodePredictionTopology]);
}
