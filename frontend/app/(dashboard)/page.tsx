'use client';

import React from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { useAlerts } from '@/hooks/useAlerts';
import { KPIGrid } from '@/components/dashboard/KPIGrid';
import { AlertTicker } from '@/components/dashboard/AlertTicker';
import { ATCChart } from '@/components/dashboard/ATCChart';
import { SimulationBar } from '@/components/simulation/SimulationBar';
import { RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const { summary, atcTrend, isLoading, refetch } = useDashboard();
  const { alerts, acknowledgeAlert } = useAlerts();

  return (
    <div className="space-y-5 pb-20 font-sans">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2 font-sans">
            Executive Command Dashboard
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Real-time Smart Grid Telemetry • AT&amp;C Loss Tracking • AI Theft Detection
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Data</span>
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <KPIGrid metrics={summary} />

      {/* Charts & Live Ticker Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <ATCChart data={atcTrend} />
        </div>
        <div className="lg:col-span-5">
          <AlertTicker alerts={alerts} onAcknowledge={acknowledgeAlert} />
        </div>
      </div>

      {/* Hackathon Sticky Simulation Control Bar */}
      <SimulationBar />
    </div>
  );
}
