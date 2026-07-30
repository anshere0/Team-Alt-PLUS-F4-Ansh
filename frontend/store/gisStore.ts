import { create } from 'zustand';
import { SmartMeterResponse } from '../types/grid';

export interface GISNode extends SmartMeterResponse {
  current_risk_score?: number;
  current_anomaly_type?: string;
  current_financial_loss?: number;
}

interface GISStore {
  nodes: Record<string, GISNode>;
  selectedNodeId: string | null;
  setNodes: (meters: SmartMeterResponse[]) => void;
  updateNodePrediction: (
    meterId: string, 
    riskScore: number, 
    anomalyType: string, 
    financialLoss: number
  ) => void;
  setSelectedNode: (id: string | null) => void;
}

export const useGISStore = create<GISStore>((set) => ({
  nodes: {},
  selectedNodeId: null,
  
  setNodes: (meters) => set(() => {
    const newNodes: Record<string, GISNode> = {};
    meters.forEach((m) => {
      newNodes[m.id] = { ...m };
    });
    return { nodes: newNodes };
  }),
  
  updateNodePrediction: (meterId, riskScore, anomalyType, financialLoss) => set((state) => {
    if (!state.nodes[meterId]) return state; // Ignore if node doesn't exist
    return {
      nodes: {
        ...state.nodes,
        [meterId]: {
          ...state.nodes[meterId],
          current_risk_score: riskScore,
          current_anomaly_type: anomalyType,
          current_financial_loss: financialLoss,
        }
      }
    };
  }),

  setSelectedNode: (id) => set({ selectedNodeId: id }),
}));
