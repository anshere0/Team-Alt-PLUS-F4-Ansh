export interface TopologyNode {
  id: string;
  type: 'substation' | 'feeder' | 'transformer' | 'meter';
  label: string;
  status: 'nominal' | 'warning' | 'critical';
  risk_score: number;
  loss_percentage: number;
  position: { x: number; y: number };
  details: {
    capacity_kva?: number;
    connected_consumers?: number;
    current_load_kw?: number;
    anomaly_type?: string;
    financial_loss?: number;
  };
}

export interface TopologyEdge {
  id: string;
  source: string;
  target: string;
  status: 'nominal' | 'high_loss';
  load_flow_rate: number;
}

export interface GridTopologyResponse {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
}
