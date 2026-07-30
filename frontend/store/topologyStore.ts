import { create } from 'zustand';
import { TopologyNode, TopologyEdge, GridTopologyResponse } from '../types/topology';

interface TopologyStore {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
  selectedNodeId: string | null;
  setTopology: (topology: GridTopologyResponse) => void;
  updateNodePrediction: (
    meterId: string, 
    riskScore: number, 
    anomalyType: string, 
    financialLoss: number
  ) => void;
  setSelectedNode: (id: string | null) => void;
}

export const useTopologyStore = create<TopologyStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,

  setTopology: (topology) => set({
    nodes: topology.nodes,
    edges: topology.edges
  }),

  updateNodePrediction: (meterId, riskScore, anomalyType, financialLoss) => set((state) => {
    // Determine status based on riskScore
    let newStatus: 'nominal' | 'warning' | 'critical' = 'nominal';
    if (riskScore >= 0.75) newStatus = 'critical';
    else if (riskScore >= 0.5) newStatus = 'warning';

    // Highlight path logic: If critical, trace edges back to Substation
    let edgesToHighlight = new Set<string>();
    
    if (newStatus === 'critical') {
      // Very naive path tracing: Meter -> Transformer -> Feeder
      const meterEdge = state.edges.find(e => e.target === meterId);
      if (meterEdge) {
        edgesToHighlight.add(meterEdge.id);
        const transformerId = meterEdge.source;
        
        const transformerEdge = state.edges.find(e => e.target === transformerId);
        if (transformerEdge) {
          edgesToHighlight.add(transformerEdge.id);
          const feederId = transformerEdge.source;
          
          const feederEdge = state.edges.find(e => e.target === feederId);
          if (feederEdge) {
            edgesToHighlight.add(feederEdge.id);
          }
        }
      }
    }

    const updatedNodes = state.nodes.map(node => {
      if (node.id === meterId) {
        return {
          ...node,
          risk_score: riskScore,
          status: newStatus,
          details: {
            ...node.details,
            anomaly_type: anomalyType,
            financial_loss: financialLoss
          }
        };
      }
      return node;
    });

    const updatedEdges = state.edges.map(edge => {
      if (edgesToHighlight.has(edge.id)) {
        return { ...edge, status: 'high_loss' as const };
      }
      return edge;
    });

    return {
      nodes: updatedNodes,
      edges: updatedEdges
    };
  }),

  setSelectedNode: (id) => set({ selectedNodeId: id })
}));
