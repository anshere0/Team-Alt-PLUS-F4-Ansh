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
    <div className="glass-panel p-4 space-y-3.5 font-sans">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <h2 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 font-sans">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            Live Telemetry Alerts
          </h2>
        </div>
        <span className="text-[11px] font-medium text-slate-300 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
          {alerts.length} Active
        </span>
      </div>

      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {alerts.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-sans">
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
                  className={`p-3 rounded-xl border backdrop-blur-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50'
                      : alert.severity === 'HIGH'
                      ? 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                        alert.severity === 'CRITICAL'
                          ? 'bg-rose-500/10 text-rose-400'
                          : alert.severity === 'HIGH'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <AlertOctagon className="w-3.5 h-3.5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-semibold text-xs text-white">{alert.meter_id}</span>
                        {alert.consumer_name && (
                          <span className="text-xs text-slate-400 font-medium">— {alert.consumer_name}</span>
                        )}
                        <span className="text-[10px] font-sans px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                          {alert.anomaly_type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{alert.message}</p>
                      <div className="flex items-center gap-2.5 text-[11px] text-slate-400 font-sans pt-0.5">
                        <span className="font-mono">Feeder: {alert.feeder_id}</span>
                        <span>•</span>
                        <span className="font-mono">Transformer: {alert.transformer_id}</span>
                        <span>•</span>
                        <span className="text-slate-400">{formatRelativeTime(alert.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0 border-t sm:border-t-0 border-slate-800/60 pt-2 sm:pt-0">
                    <div className="text-right">
                      <span className="text-xs font-mono font-semibold text-rose-400 block">
                        -₹{alert.financial_loss_estimate.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 font-sans">Estimated Loss</span>
                    </div>

                    {onAcknowledge && (
                      <button
                        onClick={() => onAcknowledge(alert.alert_id)}
                        disabled={alert.is_acknowledged}
                        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors ${
                          alert.is_acknowledged
                            ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
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
