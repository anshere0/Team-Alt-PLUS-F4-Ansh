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
    <div className="space-y-8 pb-20 font-sans">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-default)] pb-6">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2 font-sans">
            Executive Command Dashboard
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-sans mt-1">
            Real-time Smart Grid Telemetry • AT&amp;C Loss Tracking • AI Theft Detection
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium bg-[var(--bg-raised)] hover:bg-[var(--bg-inset)] border border-[var(--border-default)] text-[var(--text-secondary)] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Data</span>
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <KPIGrid metrics={summary} />

      {/* Charts & Live Ticker Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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
