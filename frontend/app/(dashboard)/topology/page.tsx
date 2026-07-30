'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Network, Zap, ShieldAlert, Cpu } from 'lucide-react';
import { MOCK_TOPOLOGY_DATA, MOCK_SHAP_EXPLANATION } from '@/services/mockData';

// Dynamically import React Flow for SSR safety
const ReactFlow = dynamic(() => import('reactflow').then((mod) => mod.default), { ssr: false });

export default function TopologyPage() {
  const initialNodes = MOCK_TOPOLOGY_DATA.nodes.map((node) => ({
    id: node.id,
    position: node.position,
    data: {
      label: (
        <div
          className={`p-3 rounded-xl border backdrop-blur-md font-mono text-xs ${
            node.status === 'critical'
              ? 'bg-[var(--tint-rose-bg)] border-[var(--accent-rose)] text-[var(--accent-rose)] animate-pulse'
              : node.status === 'warning'
              ? 'bg-[var(--tint-amber-bg)] border-[var(--accent-amber)] text-[var(--accent-amber)]'
              : 'bg-[var(--bg-surface)] border-[var(--tint-blue-border)] text-[var(--accent-blue)]'
          }`}
        >
          <div className="font-bold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
            {node.label}
          </div>
          <div className="text-[10px] opacity-80 mt-1">
            Loss: {node.loss_percentage}% • Risk: {node.risk_score}
          </div>
        </div>
      ),
    },
  }));

  const initialEdges = MOCK_TOPOLOGY_DATA.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    animated: true,
    style: {
      stroke: edge.status === 'high_loss' ? '#f43f5e' : '#3b82f6',
      strokeWidth: 2,
    },
  }));

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
            <ReactFlow nodes={initialNodes} edges={initialEdges} fitView />
          </div>
        </div>

        {/* Node Deep-Dive Panel */}
        <div className="lg:col-span-4 glass-panel p-5 space-y-4 overflow-y-auto">
          <div className="border-b border-[var(--border-default)] pb-3 flex items-center justify-between">
            <h3 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[var(--accent-rose)]" />
              CRITICAL ANOMALY NODE
            </h3>
            <span className="text-[10px] font-mono text-[var(--accent-rose)] px-2 py-0.5 rounded-full bg-[var(--tint-rose-bg)] border border-[var(--tint-rose-border)]">
              TR-102 / MTR-44822
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="glass-panel p-3 bg-[var(--bg-raised)] flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Node Type:</span>
              <span className="text-[var(--accent-blue)] font-bold">Transformer &amp; Meter</span>
            </div>
            <div className="glass-panel p-3 bg-[var(--bg-raised)] flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Calculated Line Loss:</span>
              <span className="text-[var(--accent-rose)] font-bold">32.8% Unmetered</span>
            </div>
            <div className="glass-panel p-3 bg-[var(--bg-raised)] flex items-center justify-between">
              <span className="text-[var(--text-muted)]">SHAP Risk Score:</span>
              <span className="text-[var(--accent-rose)] font-bold">0.94 / 1.00</span>
            </div>
          </div>

          {/* SHAP Waterfall Preview */}
          <div className="border-t border-[var(--border-default)] pt-3 space-y-2">
            <p className="text-[11px] font-semibold text-[var(--accent-indigo)] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[var(--accent-indigo)]" />
              SHAP FEATURE CONTRIBUTIONS
            </p>
            <div className="space-y-2 pt-1">
              {MOCK_SHAP_EXPLANATION.contributions.map((c, idx) => (
                <div key={idx} className="glass-panel p-2.5 bg-[var(--bg-raised)] text-[11px] space-y-1">
                  <div className="flex justify-between font-mono">
                    <span className="text-[var(--text-secondary)] font-medium">{c.feature_name}</span>
                    <span className={c.shap_score > 0 ? 'text-[var(--accent-rose)] font-bold' : 'text-[var(--accent-emerald)] font-bold'}>
                      {c.shap_score > 0 ? `+${c.shap_score}` : c.shap_score}
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] leading-tight">{c.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
