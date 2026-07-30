'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GridAlert } from '../../types/alert';
import { formatRelativeTime } from '../../utils/formatDate';
import { calculateRiskLevel } from '../../utils/calculateRiskLevel';
import { AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';

interface AlertTickerProps {
  alerts: GridAlert[];
  onAcknowledge?: (alertId: string) => void;
}

export const AlertTicker: React.FC<AlertTickerProps> = ({ alerts, onAcknowledge }) => {
  return (
    <div className="glass-panel p-6 space-y-5 font-sans">
      <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--accent-rose)] animate-pulse" />
          <h2 className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5 font-sans">
            <ShieldAlert className="w-4 h-4 text-[var(--accent-rose)]" />
            Live Telemetry Alerts
          </h2>
        </div>
        <span className="text-[11px] font-medium text-[var(--text-secondary)] bg-[var(--bg-raised)] border border-[var(--border-default)] px-2 py-0.5 rounded-md">
          {alerts.length} Active
        </span>
      </div>

      <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {alerts.length === 0 ? (
            <div className="py-12 text-center text-[var(--text-muted)] text-xs font-sans">
              No anomalies detected — Grid nominal
            </div>
          ) : (
            alerts.map((alert) => {
              const riskInfo = calculateRiskLevel(alert.risk_score);
              return (
                <motion.div
                  key={alert.alert_id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.15 }}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-[var(--tint-rose-bg)] border-[var(--tint-rose-border)] hover:border-[var(--accent-rose)]/50'
                      : alert.severity === 'HIGH'
                      ? 'bg-[var(--tint-amber-bg)] border-[var(--tint-amber-border)] hover:border-[var(--accent-amber)]/50'
                      : 'bg-[var(--bg-surface)] border-[var(--border-default)] hover:border-[var(--border-emphasis)]'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                        alert.severity === 'CRITICAL'
                          ? 'bg-[var(--tint-rose-bg)] text-[var(--accent-rose)]'
                          : alert.severity === 'HIGH'
                          ? 'bg-[var(--tint-amber-bg)] text-[var(--accent-amber)]'
                          : 'bg-[var(--bg-raised)] text-[var(--text-muted)]'
                      }`}
                    >
                      <AlertOctagon className="w-3.5 h-3.5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-semibold text-xs text-[var(--text-primary)]">{alert.meter_id}</span>
                        {alert.consumer_name && (
                          <span className="text-xs text-[var(--text-secondary)] font-medium">— {alert.consumer_name}</span>
                        )}
                        <span className="text-[10px] font-sans px-2 py-0.5 rounded-md bg-[var(--bg-raised)] text-[var(--text-secondary)] border border-[var(--border-default)]">
                          {alert.anomaly_type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">{alert.message}</p>
                      <div className="flex items-center gap-2.5 text-[11px] text-[var(--text-muted)] font-sans pt-0.5">
                        <span className="font-mono">Feeder: {alert.feeder_id}</span>
                        <span>•</span>
                        <span className="font-mono">Transformer: {alert.transformer_id}</span>
                        <span>•</span>
                        <span>{formatRelativeTime(alert.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0 border-t sm:border-t-0 border-[var(--border-subtle)] pt-2 sm:pt-0">
                    <div className="text-right">
                      <span className="text-xs font-mono font-semibold text-[var(--accent-rose)] block">
                        -₹{alert.financial_loss_estimate.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] font-sans">Estimated Loss</span>
                    </div>

                    {onAcknowledge && (
                      <button
                        onClick={() => onAcknowledge(alert.alert_id)}
                        disabled={alert.is_acknowledged}
                        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors ${
                          alert.is_acknowledged
                            ? 'bg-[var(--tint-emerald-bg)] text-[var(--accent-emerald)] border border-[var(--tint-emerald-border)]'
                            : 'bg-[var(--bg-raised)] hover:bg-[var(--bg-inset)] text-[var(--text-primary)] border border-[var(--border-default)]'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{alert.is_acknowledged ? 'Verified' : 'Acknowledge'}</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
