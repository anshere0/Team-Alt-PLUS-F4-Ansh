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
              ? 'bg-red-950/80 border-red-500 text-red-300 glow-crimson-border animate-pulse'
              : node.status === 'warning'
              ? 'bg-amber-950/80 border-amber-500 text-amber-300'
              : 'bg-slate-900/80 border-cyan-500/40 text-cyan-300'
          }`}
        >
          <div className="font-bold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
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
      stroke: edge.status === 'high_loss' ? '#FF2A5F' : '#00F0FF',
      strokeWidth: 2,
    },
  }));

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-wide text-white flex items-center gap-2">
            <Network className="w-5 h-5 text-cyan-400" />
            DYNAMIC GRID TOPOLOGY VIEWER
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Hierarchical flow graph: Substation (33kV) → Feeder (11kV) → Transformer → Consumer Smart Meters
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
        {/* Topology Graph Canvas */}
        <div className="lg:col-span-8 glass-panel p-2 overflow-hidden relative border-cyan-500/30 glow-cyan-border">
          <div className="w-full h-full rounded-xl overflow-hidden bg-slate-950/90 relative">
            <ReactFlow nodes={initialNodes} edges={initialEdges} fitView />
          </div>
        </div>

        {/* Node Deep-Dive Panel */}
        <div className="lg:col-span-4 glass-panel p-5 space-y-4 overflow-y-auto">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              CRITICAL ANOMALY NODE
            </h3>
            <span className="text-[10px] font-mono text-red-400 px-2 py-0.5 rounded-full bg-red-950 border border-red-500/40">
              TR-102 / MTR-44822
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="glass-panel p-3 bg-slate-900/60 flex items-center justify-between">
              <span className="text-slate-400">Node Type:</span>
              <span className="text-cyan-400 font-bold">Transformer &amp; Meter</span>
            </div>
            <div className="glass-panel p-3 bg-slate-900/60 flex items-center justify-between">
              <span className="text-slate-400">Calculated Line Loss:</span>
              <span className="text-red-400 font-bold">32.8% Unmetered</span>
            </div>
            <div className="glass-panel p-3 bg-slate-900/60 flex items-center justify-between">
              <span className="text-slate-400">SHAP Risk Score:</span>
              <span className="text-red-400 font-bold">0.94 / 1.00</span>
            </div>
          </div>

          {/* SHAP Waterfall Preview */}
          <div className="border-t border-slate-800 pt-3 space-y-2">
            <p className="text-[11px] font-semibold text-cyan-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              SHAP FEATURE CONTRIBUTIONS
            </p>
            <div className="space-y-2 pt-1">
              {MOCK_SHAP_EXPLANATION.contributions.map((c, idx) => (
                <div key={idx} className="glass-panel p-2.5 bg-slate-900/40 text-[11px] space-y-1">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-300 font-medium">{c.feature_name}</span>
                    <span className={c.shap_score > 0 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {c.shap_score > 0 ? `+${c.shap_score}` : c.shap_score}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">{c.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
