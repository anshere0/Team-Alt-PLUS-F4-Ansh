'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Map, Zap, AlertTriangle } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import { useGISStore } from '@/store/gisStore';
import { gridService } from '@/services/gridService';

// Dynamically import Leaflet components (SSR disabled)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.CircleMarker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

export default function GISMapPage() {
  const { nodes, selectedNodeId, setNodes, setSelectedNode } = useGISStore();
  const theme = useThemeStore((s) => s.theme);
  const tileUrl = theme === 'dark' 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  useEffect(() => {
    // Fetch real coordinates on mount
    gridService.getMeters().then((meters) => {
      setNodes(meters);
    });
  }, [setNodes]);

  const selectedNode = selectedNodeId ? nodes[selectedNodeId] : null;
  const nodesArray = Object.values(nodes);

  // Center on New Delhi since coordinates in seed.py are centered around there
  const mapCenter: [number, number] = [28.6139, 77.2090]; 

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-wide text-[var(--text-primary)] flex items-center gap-2">
            <Map className="w-5 h-5 text-[var(--accent-blue)]" />
            GIS SPATIAL LOSS HEATMAP
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
            Geospatial distribution of unmetered AT&C energy losses & high-risk smart meter clusters
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-full bg-[var(--tint-rose-bg)] border border-[var(--tint-rose-border)] text-[var(--accent-rose)]">
            ● RED: High Risk (&gt;= 75%)
          </span>
          <span className="px-2.5 py-1 rounded-full bg-[var(--tint-amber-bg)] border border-[var(--tint-amber-border)] text-[var(--accent-amber)]">
            ● AMBER: Warning (50% - 75%)
          </span>
          <span className="px-2.5 py-1 rounded-full bg-[var(--tint-emerald-bg)] border border-[var(--tint-emerald-border)] text-[var(--accent-emerald)]">
            ● GREEN: Nominal Grid (&lt; 50%)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
        {/* Map Container */}
        <div className="lg:col-span-8 glass-panel p-2 overflow-hidden relative border-[var(--border-default)]">
          <div className="w-full h-full rounded-xl overflow-hidden bg-[var(--bg-inset)] relative">
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ width: '100%', height: '100%', backgroundColor: 'var(--map-bg)' }}
            >
              <TileLayer
                url={tileUrl}
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              />
              {nodesArray.map((node) => {
                const risk = node.current_risk_score ?? 0;
                let color = '#10b981'; // emerald-500
                if (risk >= 0.75) color = '#f43f5e'; // rose-500
                else if (risk >= 0.5) color = '#f59e0b'; // amber-500

                return (
                  <CircleMarker
                    key={node.id}
                    center={[node.latitude, node.longitude]}
                    radius={risk >= 0.75 ? 10 : 7}
                    pathOptions={{ 
                      color: color, 
                      fillColor: color, 
                      fillOpacity: 0.7,
                      weight: risk >= 0.75 ? 2 : 1
                    }}
                    eventHandlers={{
                      click: () => setSelectedNode(node.id),
                    }}
                  >
                    <Popup>
                      <div className="p-2 font-mono text-xs text-slate-900">
                        <p className="font-bold" style={{ color }}>{node.meter_number}</p>
                        <p>Risk Score: {(risk * 100).toFixed(1)}%</p>
                        <p className="text-[10px] text-gray-500 mt-1 cursor-pointer underline" onClick={() => setSelectedNode(node.id)}>
                          View Full Diagnostics
                        </p>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* GIS Node Inspect Drawer */}
        <div className="lg:col-span-4 glass-panel p-5 space-y-4 overflow-y-auto">
          {selectedNode ? (
            <>
              <div className="border-b border-[var(--border-default)] pb-3 flex items-center justify-between">
                <h3 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[var(--accent-blue)]" />
                  Meter Details &amp; Diagnostics
                </h3>
                <span className="text-[10px] font-mono text-[var(--accent-blue)] px-2 py-0.5 rounded-full bg-[var(--tint-blue-bg)] border border-[var(--tint-blue-border)]">
                  {selectedNode.meter_number}
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="glass-panel p-3 bg-[var(--bg-raised)] flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Consumer:</span>
                  <span className="font-bold text-[var(--text-primary)]">{selectedNode.consumer_name || 'N/A'}</span>
                </div>
                <div className="glass-panel p-3 bg-[var(--bg-raised)] flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Transformer ID:</span>
                  <span className="text-[var(--accent-blue)]">{selectedNode.transformer_id}</span>
                </div>
                <div className="glass-panel p-3 bg-[var(--bg-raised)] flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Risk Score:</span>
                  <span className={`font-bold ${(selectedNode.current_risk_score ?? 0) >= 0.75 ? 'text-[var(--accent-rose)]' : 'text-[var(--text-primary)]'}`}>
                    {((selectedNode.current_risk_score ?? 0) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="glass-panel p-3 bg-[var(--bg-raised)] flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Est. Loss:</span>
                  <span className="text-[var(--text-primary)]">
                    ₹{(selectedNode.current_financial_loss ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="border-t border-[var(--border-default)] pt-3 space-y-2">
                <p className="text-[11px] font-semibold text-[var(--accent-indigo)] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[var(--accent-indigo)]" />
                  AI REASONING SUMMARY
                </p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed bg-[var(--tint-indigo-bg)] p-3 rounded-xl border border-[var(--tint-indigo-border)]">
                  {selectedNode.current_anomaly_type 
                    ? `AI Model classified the active behavior as ${selectedNode.current_anomaly_type.replace('_', ' ')} with high confidence.` 
                    : 'Grid behavior is nominal. No significant anomalies detected.'}
                </p>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-60">
              <Map className="w-8 h-8 text-[var(--text-muted)]" />
              <p className="text-sm text-[var(--text-secondary)]">Select a meter on the map<br/>to view live diagnostics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
