'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { KPIMetric, ExecutiveDashboardSummary } from '../../types/dashboard';
import { TrendingUp, TrendingDown, Minus, Activity, ShieldAlert, Zap, DollarSign, Cpu, CheckCircle } from 'lucide-react';

interface KPIGridProps {
  metrics?: ExecutiveDashboardSummary | Record<string, KPIMetric>;
}

export const KPIGrid: React.FC<KPIGridProps> = ({ metrics }) => {
  if (!metrics) return null;

  const metricList = Object.values(metrics);

  const getMetricIcon = (id: string) => {
    switch (id) {
      case 'kpi-1':
        return Activity;
      case 'kpi-2':
        return Zap;
      case 'kpi-3':
        return ShieldAlert;
      case 'kpi-4':
        return TrendingUp;
      case 'kpi-5':
        return DollarSign;
      case 'kpi-6':
        return ShieldAlert;
      case 'kpi-7':
        return Cpu;
      case 'kpi-8':
        return CheckCircle;
      default:
        return Activity;
    }
  };

  const getStatusStyle = (status: KPIMetric['status']) => {
    switch (status) {
      case 'CRITICAL':
        return 'border-rose-500/30 bg-rose-950/20';
      case 'WARNING':
        return 'border-amber-500/30 bg-amber-950/20';
      case 'NOMINAL':
      default:
        return 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 font-sans">
      {metricList.map((metric, idx) => {
        const Icon = getMetricIcon(metric.id);
        const isUp = metric.trend === 'UP';
        const isDown = metric.trend === 'DOWN';

        return (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, delay: idx * 0.02 }}
            className={`glass-panel p-4 border relative overflow-hidden transition-all ${getStatusStyle(metric.status)}`}
          >
            <div className="flex items-start justify-between mb-2.5">
              <span className="text-xs font-medium text-slate-400 tracking-tight">{metric.title}</span>
              <div className="p-1.5 rounded-lg bg-slate-800/80 text-slate-400 border border-slate-700/50">
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-baseline justify-between mb-2">
              <span className="text-2xl font-bold font-mono tracking-tight text-white">{metric.value}</span>
              {metric.unit && <span className="text-xs font-mono text-slate-400 ml-1">{metric.unit}</span>}
            </div>

            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/60">
              <div
                className={`inline-flex items-center gap-1 font-mono font-medium ${
                  isUp
                    ? metric.status === 'CRITICAL' || metric.status === 'WARNING'
                      ? 'text-rose-400'
                      : 'text-emerald-400'
                    : isDown
                    ? 'text-amber-400'
                    : 'text-slate-400'
                }`}
              >
                {isUp ? (
                  <TrendingUp className="w-3 h-3" />
                ) : isDown ? (
                  <TrendingDown className="w-3 h-3" />
                ) : (
                  <Minus className="w-3 h-3" />
                )}
                <span>
                  {metric.change_percentage > 0 ? `+${metric.change_percentage}%` : `${metric.change_percentage}%`}
                </span>
              </div>
              <span className="text-slate-400 text-[11px] truncate max-w-[130px]">{metric.description}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
