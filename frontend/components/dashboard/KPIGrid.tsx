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
        return 'border-[var(--tint-rose-border)] bg-[var(--tint-rose-bg)]';
      case 'WARNING':
        return 'border-[var(--tint-amber-border)] bg-[var(--tint-amber-bg)]';
      case 'NOMINAL':
      default:
        return 'border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-emphasis)]';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-sans">
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
            className={`glass-panel p-6 border relative overflow-hidden transition-all ${getStatusStyle(metric.status)}`}
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-xs font-medium text-[var(--text-secondary)] tracking-tight">{metric.title}</span>
              <div className="p-1.5 rounded-lg bg-[var(--bg-raised)] text-[var(--text-muted)] border border-[var(--border-default)]">
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-baseline justify-between mb-4">
              <span className="text-2xl font-bold font-mono tracking-tight text-[var(--text-primary)]">{metric.value}</span>
              {metric.unit && <span className="text-xs font-mono text-[var(--text-secondary)] ml-1">{metric.unit}</span>}
            </div>

            <div className="flex items-center justify-between gap-3 text-[11px] pt-4 border-t border-[var(--border-subtle)]">
              <div
                className={`inline-flex items-center gap-2 font-mono font-medium ${isUp
                  ? metric.status === 'CRITICAL' || metric.status === 'WARNING'
                    ? 'text-[var(--accent-rose)]'
                    : 'text-[var(--accent-emerald)]'
                  : isDown
                    ? 'text-[var(--accent-amber)]'
                    : 'text-[var(--text-muted)]'
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
              <span className="text-[var(--text-muted)] text-[11px] truncate max-w-[130px]">{metric.description}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
