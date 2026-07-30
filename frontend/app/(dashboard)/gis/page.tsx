'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Map, Layers, Zap, AlertTriangle, ArrowRight } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';

// TODO (Phase 3): Replace inline mocks with real GIS API fetch
const MOCK_SHAP_EXPLANATION = {
  ai_summary: 'High theft probability (94%) detected due to 78% drop in peak-hour active consumption.',
  contributions: []
};

// Dynamically import Leaflet components (SSR disabled)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

export default function GISMapPage() {
  const [selectedPin, setSelectedPin] = useState<string | null>('MTR-44822');
  const theme = useThemeStore((s) => s.theme);
  const tileUrl = theme === 'dark' 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

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
            ● RED: Theft Zone (&gt;30% Loss)
          </span>
          <span className="px-2.5 py-1 rounded-full bg-[var(--tint-emerald-bg)] border border-[var(--tint-emerald-border)] text-[var(--accent-emerald)]">
            ● GREEN: Nominal Grid
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
        {/* Map Container */}
        <div className="lg:col-span-8 glass-panel p-2 overflow-hidden relative border-[var(--border-default)]">
          <div className="w-full h-full rounded-xl overflow-hidden bg-[var(--bg-inset)] relative">
            <MapContainer
              center={[28.6139, 77.209]}
              zoom={13}
              style={{ width: '100%', height: '100%', backgroundColor: 'var(--map-bg)' }}
            >
              <TileLayer
                url={tileUrl}
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              />
              <Marker position={[28.6139, 77.209]}>
                <Popup>
                  <div className="p-2 font-mono text-xs text-slate-900">
                    <p className="font-bold text-red-600">MTR-44822 (Critical)</p>
                    <p>Unmetered Loss: 14.2 kWh/h</p>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>

        {/* GIS Node Inspect Drawer */}
        <div className="lg:col-span-4 glass-panel p-5 space-y-4 overflow-y-auto">
          <div className="border-b border-[var(--border-default)] pb-3 flex items-center justify-between">
            <h3 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
              <Zap className="w-4 h-4 text-[var(--accent-blue)]" />
              Meter Details &amp; Diagnostics
            </h3>
            <span className="text-[10px] font-mono text-[var(--accent-blue)] px-2 py-0.5 rounded-full bg-[var(--tint-blue-bg)] border border-[var(--tint-blue-border)]">
              MTR-44822
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="glass-panel p-3 bg-[var(--bg-raised)] flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Consumer:</span>
              <span className="font-bold text-[var(--text-primary)]">Apex Industrial Complex</span>
            </div>
            <div className="glass-panel p-3 bg-[var(--bg-raised)] flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Transformer ID:</span>
              <span className="text-[var(--accent-blue)]">TR-102 (500 kVA)</span>
            </div>
            <div className="glass-panel p-3 bg-[var(--bg-raised)] flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Risk Score:</span>
              <span className="text-[var(--accent-rose)] font-bold">0.94 (CRITICAL THEFT)</span>
            </div>
            <div className="glass-panel p-3 bg-[var(--bg-raised)] flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Active Power Draw:</span>
              <span className="text-[var(--text-primary)]">1.2 kWh / 5.4 kWh Exp</span>
            </div>
          </div>

          <div className="border-t border-[var(--border-default)] pt-3 space-y-2">
            <p className="text-[11px] font-semibold text-[var(--accent-indigo)] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[var(--accent-indigo)]" />
              AI SHAP REASONING SUMMARY
            </p>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed bg-[var(--tint-indigo-bg)] p-3 rounded-xl border border-[var(--tint-indigo-border)]">
              {MOCK_SHAP_EXPLANATION.ai_summary}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
