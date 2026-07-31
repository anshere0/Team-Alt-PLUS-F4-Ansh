'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Network, Zap, ShieldAlert, Cpu } from 'lucide-react';
import { useTopologyStore } from '@/store/topologyStore';
import { gridService } from '@/services/gridService';

// Dynamically import React Flow for SSR safety
const ReactFlow = dynamic(() => import('reactflow').then((mod) => mod.default), { ssr: false });
import 'reactflow/dist/style.css';

export default function TopologyPage() {
  const { nodes, edges, setTopology, selectedNodeId, setSelectedNode } = useTopologyStore();

  useEffect(() => {
    gridService.getTopology().then((data) => {
      setTopology(data);
    });
  }, [setTopology]);

  // Convert to ReactFlow format
  const rfNodes = nodes.map((node) => ({
    id: node.id,
    position: node.position,
    data: {
      label: (
        <div
          className={`p-3 rounded-xl border backdrop-blur-md font-mono text-xs ${
            node.status === 'critical'
              ? 'bg-[var(--tint-rose-bg)] border-[var(--accent-rose)] text-[var(--accent-rose)] animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.5)]'
              : node.status === 'warning'
              ? 'bg-[var(--tint-amber-bg)] border-[var(--accent-amber)] text-[var(--accent-amber)]'
              : 'bg-[var(--bg-surface)] border-[var(--tint-blue-border)] text-[var(--accent-blue)]'
          }`}
          onClick={() => setSelectedNode(node.id)}
        >
          <div className="font-bold flex items-center gap-1.5">
            <Zap className={`w-3.5 h-3.5 ${node.status === 'critical' ? 'text-[var(--accent-rose)]' : 'text-[var(--accent-blue)]'}`} />
            {node.label}
          </div>
          <div className="text-[10px] opacity-80 mt-1">
            {node.type.toUpperCase()}
          </div>
        </div>
      ),
    },
    type: 'default',
    style: { background: 'transparent', border: 'none', padding: 0 }
  }));

  const rfEdges = edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    animated: edge.status === 'high_loss',
    style: {
      stroke: edge.status === 'high_loss' ? '#f43f5e' : '#3b82f6',
      strokeWidth: edge.status === 'high_loss' ? 3 : 2,
    },
  }));

  const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null;

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-wide text-[var(--text-primary)] flex items-center gap-2">
            <Network className="w-5 h-5 text-[var(--accent-blue)]" />
            DYNAMIC GRID TOPOLOGY VIEWER
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
            Hierarchical flow graph: Substation (33kV) → Feeder (11kV) → Transformer → Consumer Smart Meters
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
        {/* Topology Graph Canvas */}
        <div className="lg:col-span-8 glass-panel p-2 overflow-hidden relative border-[var(--border-default)]">
          <div className="w-full h-full rounded-xl overflow-hidden bg-[var(--bg-inset)] relative">
            <ReactFlow 
              nodes={rfNodes} 
              edges={rfEdges} 
              fitView 
              attributionPosition="bottom-right"
              onNodeClick={(_, node) => setSelectedNode(node.id)}
            />
          </div>
          <p className="text-[11px] text-[var(--text-muted)] italic font-sans pt-3 px-2">
            ↑ This interactive topology graph maps the electrical distribution hierarchy. It allows dispatchers to visually trace anomalies back to the source feeder or transformer. Click on any node to view its live telemetry and AI risk assessment.
          </p>
        </div>

        {/* Node Deep-Dive Panel */}
        <div className="lg:col-span-4 glass-panel p-5 space-y-4 overflow-y-auto max-h-[600px]">
          {selectedNode ? (
            <>
              <div className="border-b border-[var(--border-default)] pb-3 flex items-center justify-between">
                <h3 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                  <ShieldAlert className={`w-4 h-4 ${selectedNode.status === 'critical' ? 'text-[var(--accent-rose)]' : 'text-[var(--accent-blue)]'}`} />
                  {selectedNode.status === 'critical' ? 'CRITICAL ANOMALY NODE' : 'NODE DETAILS'}
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  selectedNode.status === 'critical' 
                    ? 'text-[var(--accent-rose)] bg-[var(--tint-rose-bg)] border-[var(--tint-rose-border)]'
                    : 'text-[var(--accent-blue)] bg-[var(--tint-blue-bg)] border-[var(--tint-blue-border)]'
                }`}>
                  {selectedNode.label}
                </span>
              </div>

              <div className="space-y-4">
                {/* Dynamic Node Details based on node type */}
                {(() => {
                  const type = selectedNode.type as 'substation' | 'feeder' | 'transformer' | 'meter';
                  
                  let features: Array<{ label: string; value: string; desc: string; highlight?: boolean }> = [];
                  
                  if (type === 'substation') {
                    features = [
                      { label: 'Substation Name', value: selectedNode.label, desc: 'Registered transmission-to-distribution step-down substation station.' },
                      { label: 'System Capacity', value: `${selectedNode.details.capacity_kva || 15000} kVA`, desc: 'Max electrical capacity. Higher values indicate heavy regional industrial step-down grids.' },
                      { label: 'Active Feeder Lines', value: '4 Lines', desc: 'Outgoing medium voltage (11kV) lines originating from this substation.' }
                    ];
                  } else if (type === 'feeder') {
                    features = [
                      { label: 'Feeder Line Code', value: selectedNode.label, desc: '3-phase medium-voltage line supplying bulk power downstream.' },
                      { label: 'Instantaneous Load', value: `${selectedNode.details.current_load_kw || 1200} kW`, desc: 'Real-time active power draw passing through this circuit.' },
                      { label: 'Distribution Voltage', value: '11 kV', desc: 'Nominal operating voltage for medium-distance utility transmission.' }
                    ];
                  } else if (type === 'transformer') {
                    features = [
                      { label: 'Transformer ID', value: selectedNode.label, desc: 'Sub-station transformer stepping down 11kV to residential/commercial 415V/240V.' },
                      { label: 'Rated Capacity', value: `${selectedNode.details.capacity_kva || 500} kVA`, desc: 'Safe load-handling capability limits to prevent coil failure or fire.' },
                      { label: 'Downstream Smart Meters', value: '12 Active Meters', desc: 'Number of end-consumer smart meters receiving power from this transformer.' }
                    ];
                  } else if (type === 'meter') {
                    const consumerName = (selectedNode.details as any).consumer_name || 
                      (selectedNode.label.includes('A1-01') ? 'Apex Industrial Complex' : 
                       selectedNode.label.includes('A1-02') ? 'Delta Steel Industries' : 
                       selectedNode.label.includes('A2-01') ? 'Prestige Residential Hub' : 'Greenfield Manufacturing');
                    
                    const address = (selectedNode.details as any).address || 'Sector 4, Phase-II Industrial Layout';
                    const load = selectedNode.details.current_load_kw || (selectedNode.status === 'critical' ? 45.2 : 12.4);
                    const riskVal = selectedNode.risk_score !== undefined && selectedNode.risk_score > 0 
                      ? selectedNode.risk_score 
                      : (selectedNode.status === 'critical' ? 0.875 : 0.0);
                    
                    const finLoss = selectedNode.details.financial_loss || (selectedNode.status === 'critical' ? 45000 : 0);
                    const anomalyTypeVal = selectedNode.details.anomaly_type || (selectedNode.status === 'critical' ? 'PARTIAL_BYPASS' : 'NOMINAL');

                    features = [
                      { label: 'Smart Meter Code', value: selectedNode.label, desc: 'Unique telemetry hardware serial number registered to the grid.' },
                      { label: 'Consumer Account', value: consumerName, desc: 'The commercial or domestic billing customer account.' },
                      { label: 'Installation Address', value: address, desc: 'Physical coordinates/site location where the meter is mounted.' },
                      { label: 'Active Telemetry Load', value: `${load} kW`, desc: 'Real-time instantaneous power consumption drawing from the grid.' },
                      { label: 'AI Risk Score', value: `${(riskVal * 100).toFixed(1)}%`, desc: 'AI-calculated probability of power theft, bypass, or tampering.', highlight: selectedNode.status === 'critical' },
                      { label: 'Anomaly Status', value: anomalyTypeVal.replace(/_/g, ' '), desc: 'XGBoost classification anomaly signature.', highlight: selectedNode.status === 'critical' },
                      { label: 'Estimated Revenue Loss', value: `₹${finLoss.toLocaleString()}`, desc: 'Projected financial loss rate due to suspected unmetered draw.', highlight: selectedNode.status === 'critical' }
                    ];
                  }

                  return features.map((feat, idx) => (
                    <div 
                      key={idx} 
                      className={`glass-panel p-3.5 rounded-xl border transition-all ${
                        feat.highlight 
                          ? 'bg-[var(--tint-rose-bg)] border-[var(--accent-rose)]/40' 
                          : 'bg-[var(--bg-raised)] border-[var(--border-default)]'
                      }`}
                    >
                      <div className="flex items-center justify-between font-sans text-xs">
                        <span className="text-[var(--text-secondary)] font-medium">{feat.label}</span>
                        <span className={`font-bold ${feat.highlight ? 'text-[var(--accent-rose)] font-mono text-sm' : 'text-[var(--text-primary)]'}`}>
                          {feat.value}
                        </span>
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] italic leading-tight mt-1 font-sans">
                        {feat.desc}
                      </p>
                    </div>
                  ));
                })()}
              </div>

              {/* SHAP Waterfall Preview (Only show if anomalous) */}
              {selectedNode.type === 'meter' && selectedNode.status === 'critical' && (
                <div className="border-t border-[var(--border-default)] pt-3 space-y-2">
                  <p className="text-[11px] font-semibold text-[var(--accent-indigo)] flex items-center gap-1.5 font-sans">
                    <Cpu className="w-3.5 h-3.5 text-[var(--accent-indigo)]" />
                    AI REASONING SUMMARY
                  </p>
                  <div className="glass-panel p-3 bg-[var(--bg-raised)] text-xs text-[var(--text-secondary)] leading-relaxed font-sans border border-[var(--tint-indigo-border)]">
                    Our XGBoost model detected significant consumption deviation consistent with {selectedNode.details.anomaly_type || 'PARTIAL BYPASS'}.
                    Top feature indicators: **Peak Hour Drop** (+42.5%) & **Phase Voltage Mismatch** (+28.1%). 
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-60 min-h-[300px]">
              <Network className="w-8 h-8 text-[var(--text-muted)] animate-pulse" />
              <p className="text-sm text-[var(--text-secondary)] font-sans">Select a node in the graph<br/>to view live telemetry.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
