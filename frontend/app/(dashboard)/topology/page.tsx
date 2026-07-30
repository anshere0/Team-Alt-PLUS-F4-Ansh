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
        </div>

        {/* Node Deep-Dive Panel */}
        <div className="lg:col-span-4 glass-panel p-5 space-y-4 overflow-y-auto">
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

              <div className="space-y-3 font-mono text-xs">
                <div className="glass-panel p-3 bg-[var(--bg-raised)] flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Node Type:</span>
                  <span className="text-[var(--text-primary)] font-bold capitalize">{selectedNode.type}</span>
                </div>
                {selectedNode.details.capacity_kva && (
                  <div className="glass-panel p-3 bg-[var(--bg-raised)] flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">Capacity:</span>
                    <span className="text-[var(--text-primary)] font-bold">{selectedNode.details.capacity_kva} kVA</span>
                  </div>
                )}
                {selectedNode.details.current_load_kw !== undefined && (
                  <div className="glass-panel p-3 bg-[var(--bg-raised)] flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">Load:</span>
                    <span className="text-[var(--text-primary)] font-bold">{selectedNode.details.current_load_kw} kW</span>
                  </div>
                )}
                
                {selectedNode.type === 'meter' && (
                  <>
                    <div className="glass-panel p-3 bg-[var(--bg-raised)] flex items-center justify-between">
                      <span className="text-[var(--text-muted)]">AI Risk Score:</span>
                      <span className={`font-bold ${selectedNode.status === 'critical' ? 'text-[var(--accent-rose)]' : 'text-[var(--text-primary)]'}`}>
                        {((selectedNode.risk_score ?? 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                    {selectedNode.details.anomaly_type && (
                      <div className="glass-panel p-3 bg-[var(--bg-raised)] flex items-center justify-between">
                        <span className="text-[var(--text-muted)]">Anomaly:</span>
                        <span className="text-[var(--accent-rose)] font-bold">{selectedNode.details.anomaly_type}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* SHAP Waterfall Preview (Only show if anomalous) */}
              {selectedNode.type === 'meter' && selectedNode.status === 'critical' && (
                <div className="border-t border-[var(--border-default)] pt-3 space-y-2">
                  <p className="text-[11px] font-semibold text-[var(--accent-indigo)] flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-[var(--accent-indigo)]" />
                    AI REASONING SUMMARY
                  </p>
                  <div className="glass-panel p-3 bg-[var(--bg-raised)] text-xs text-[var(--text-secondary)] leading-relaxed">
                    AI Model detected significant deviation consistent with {selectedNode.details.anomaly_type}.
                    Estimated financial loss: ₹{(selectedNode.details.financial_loss || 0).toLocaleString()}.
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-60">
              <Network className="w-8 h-8 text-[var(--text-muted)]" />
              <p className="text-sm text-[var(--text-secondary)]">Select a node in the graph<br/>to view live telemetry.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
