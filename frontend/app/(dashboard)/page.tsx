'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useDashboard } from '@/hooks/useDashboard';
import { useAlerts } from '@/hooks/useAlerts';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { SkeletonChart } from '@/components/common/Skeleton';
import { KPIGrid } from '@/components/dashboard/KPIGrid';
import { AlertTicker } from '@/components/dashboard/AlertTicker';
import { SimulationBar } from '@/components/simulation/SimulationBar';

// Dynamically import the heavy chart to improve initial page load speed
const ATCChart = dynamic(() => import('@/components/dashboard/ATCChart').then(mod => mod.ATCChart), {
  loading: () => <SkeletonChart className="h-96" />,
  ssr: false
});

// Dynamically import Leaflet Map to avoid window is not defined errors during SSR
const GridMap = dynamic(() => import('@/components/dashboard/GridMap').then(mod => mod.GridMap), {
  loading: () => <div className="glass-panel h-[400px] animate-pulse bg-gray-100 rounded-xl" />,
  ssr: false
});

export default function DashboardPage() {
  const { summary, atcTrend, isLoading, isError, refetch } = useDashboard();
  const { alerts, acknowledgeAlert } = useAlerts();

  return (
    <ErrorBoundary componentName="DashboardPage">
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

        {isError ? (
          <div className="p-8 rounded-xl border border-[var(--tint-rose-border)] bg-[var(--tint-rose-bg)] text-[var(--accent-rose)] flex flex-col items-center justify-center">
            <AlertTriangle className="w-8 h-8 mb-3" />
            <h3 className="font-medium">Failed to connect to Backend API</h3>
            <p className="text-sm opacity-80 mt-1">Please ensure the FastAPI service is running on port 8000.</p>
          </div>
        ) : (
          <>
            {/* KPI Grid */}
            <div className="space-y-2">
              <ErrorBoundary componentName="KPIGrid">
                <KPIGrid metrics={summary} isLoading={isLoading && !summary} />
              </ErrorBoundary>
              <p className="text-[11px] text-[var(--text-muted)] italic font-sans px-2">
                ↑ These KPIs are aggregated in real-time from the PostgreSQL database. Each card shows a live metric computed from smart meter telemetry, AI predictions, and alert records. Trend arrows indicate 24h change.
              </p>
            </div>

            {/* Geographical Map */}
            <div className="space-y-2">
              <ErrorBoundary componentName="GridMap">
                <GridMap />
              </ErrorBoundary>
              <p className="text-[11px] text-[var(--text-muted)] italic font-sans px-2">
                ↑ Real-time GIS visualization. Markers shift to red when the Scikit-Learn Isolation Forest detects theft or anomalies in incoming WebSocket telemetry.
              </p>
            </div>

          {/* Charts & Live Ticker Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-2">
              {atcTrend && atcTrend.length > 0 ? (
                <ATCChart data={atcTrend} />
              ) : (
                <div className="glass-panel h-[350px] border flex flex-col items-center justify-center text-[var(--text-muted)] border-dashed">
                  <span className="text-sm">ATC Chart Pending Phase 2</span>
                </div>
              )}
              <p className="text-[11px] text-[var(--text-muted)] italic font-sans px-2">
                ↑ AT&C (Aggregate Technical & Commercial) Loss Trend compares expected vs actual energy consumption over 24 hours. The gap between the blue (expected) and red (actual) lines represents unmetered energy — potential theft.
              </p>
            </div>
            <div className="lg:col-span-5 space-y-2">
              <AlertTicker alerts={alerts || []} onAcknowledge={acknowledgeAlert} />
              <p className="text-[11px] text-[var(--text-muted)] italic font-sans px-2">
                ↑ Live anomaly alerts generated by our XGBoost AI model when it detects suspicious consumption patterns. Each alert shows the consumer, anomaly type, and estimated financial loss in ₹.
              </p>
            </div>
          </div>
        </>
      )}

      {/* Hackathon Sticky Simulation Control Bar */}
      <SimulationBar />
    </div>
    </ErrorBoundary>
  );
}
