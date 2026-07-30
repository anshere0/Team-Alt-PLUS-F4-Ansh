'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Map, Layers, Zap, AlertTriangle, ArrowRight } from 'lucide-react';
import { MOCK_TELEMETRY, MOCK_SHAP_EXPLANATION } from '@/services/mockData';

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

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-wide text-white flex items-center gap-2">
            <Map className="w-5 h-5 text-cyan-400" />
            GIS SPATIAL LOSS HEATMAP
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Geospatial distribution of unmetered AT&C energy losses & high-risk smart meter clusters
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-400">
            ● RED: Theft Zone (&gt;30% Loss)
          </span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
            ● GREEN: Nominal Grid
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
        {/* Map Container */}
        <div className="lg:col-span-8 glass-panel p-2 overflow-hidden relative border-cyan-500/20">
          <div className="w-full h-full rounded-xl overflow-hidden bg-slate-950 relative">
            <MapContainer
              center={[28.6139, 77.209]}
              zoom={13}
              style={{ width: '100%', height: '100%', backgroundColor: '#07090E' }}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
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
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              PIN TELEMETRY DRILLDOWN
            </h3>
            <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/30">
              MTR-44822
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="glass-panel p-3 bg-slate-900/60 flex items-center justify-between">
              <span className="text-slate-400">Consumer:</span>
              <span className="font-bold text-white">Apex Industrial Complex</span>
            </div>
            <div className="glass-panel p-3 bg-slate-900/60 flex items-center justify-between">
              <span className="text-slate-400">Transformer ID:</span>
              <span className="text-cyan-400">TR-102 (500 kVA)</span>
            </div>
            <div className="glass-panel p-3 bg-slate-900/60 flex items-center justify-between">
              <span className="text-slate-400">Risk Score:</span>
              <span className="text-red-400 font-bold">0.94 (CRITICAL THEFT)</span>
            </div>
            <div className="glass-panel p-3 bg-slate-900/60 flex items-center justify-between">
              <span className="text-slate-400">Active Power Draw:</span>
              <span className="text-white">1.2 kWh / 5.4 kWh Exp</span>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3 space-y-2">
            <p className="text-[11px] font-semibold text-purple-300 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-purple-400" />
              AI SHAP REASONING SUMMARY
            </p>
            <p className="text-xs text-slate-400 leading-relaxed bg-purple-950/20 p-3 rounded-xl border border-purple-500/30">
              {MOCK_SHAP_EXPLANATION.ai_summary}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
