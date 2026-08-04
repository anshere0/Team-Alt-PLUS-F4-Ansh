'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { KPIMetric, ExecutiveDashboardSummary } from '../../types/dashboard';
import { TrendingUp, TrendingDown, Minus, Activity, ShieldAlert, Zap, DollarSign, Cpu, CheckCircle, Clock } from 'lucide-react';

import { SkeletonCard } from '../common/Skeleton';

interface KPIGridProps {
  metrics?: ExecutiveDashboardSummary | Record<string, KPIMetric>;
  isLoading?: boolean;
}

export const KPIGrid: React.FC<KPIGridProps> = ({ metrics, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  const metricList = Object.values(metrics);

  const getMetricIcon = (id: string, status: string) => {
    if (status === 'UNAVAILABLE') return Clock;
    
    // Naive icon mapping based on id string matches, but normally we'd pass an icon enum
    if (id.includes('health')) return Activity;
    if (id.includes('loss') && id.includes('mwh')) return Zap;
    if (id.includes('theft')) return ShieldAlert;
    if (id.includes('financial') || id.includes('revenue')) return DollarSign;
    if (id.includes('ai')) return Cpu;
    if (id.includes('meters') || id.includes('feeders')) return CheckCircle;
    
    return Activity;
  };

  const getStatusStyle = (status: KPIMetric['status']) => {
    switch (status) {
      case 'CRITICAL':
        return 'border-[var(--tint-rose-border)] bg-[var(--tint-rose-bg)]';
      case 'WARNING':
        return 'border-[var(--tint-amber-border)] bg-[var(--tint-amber-bg)]';
      case 'UNAVAILABLE':
        return 'border-[var(--border-subtle)] bg-[var(--bg-inset)] opacity-70 border-dashed';
      case 'NOMINAL':
      default:
        return 'border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-emphasis)]';
    }
  };

  const formatValue = (value: any, unit?: string): string => {
    if (value === null || value === undefined) return '—';
    const num = Number(value);
    if (isNaN(num)) return String(value);
    
    // For rupee values, use Indian number formatting
    if (unit === '₹') {
      return '₹' + num.toLocaleString('en-IN');
    }
    // For large numbers, use Indian locale
    if (num >= 1000) {
      return num.toLocaleString('en-IN');
    }
    return String(value);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-sans">
      {metricList.map((metric, idx) => {
        const Icon = getMetricIcon(metric.id, metric.status);
        const isUp = metric.trend === 'UP';
        const isDown = metric.trend === 'DOWN';
        const isUnavailable = metric.status === 'UNAVAILABLE';

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
              {isUnavailable ? (
                <span className="text-lg font-bold font-mono tracking-tight text-[var(--text-muted)]">— Pending</span>
              ) : (
                <>
                  <span className="text-2xl font-bold font-mono tracking-tight text-[var(--text-primary)]">
                    {formatValue(metric.value, metric.unit)}
                  </span>
                  {metric.unit && metric.unit !== '₹' && <span className="text-xs font-mono text-[var(--text-secondary)] ml-1">{metric.unit}</span>}
                </>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 text-[11px] pt-3 border-t border-[var(--border-subtle)]">
              {isUnavailable ? (
                <div className="text-[var(--text-muted)] italic w-full text-[10px]">
                  {metric.description || 'Awaiting future phase'}
                </div>
              ) : (
                <>
                  <div
                    className={`inline-flex items-center gap-1 font-mono font-medium ${isUp
                      ? metric.id.includes('loss') || metric.id.includes('theft')
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
                </>
              )}
            </div>

            {/* Feature Description for Judges */}
            {!isUnavailable && metric.description && (
              <p className="text-[11px] text-[var(--text-muted)] italic leading-tight mt-3 font-sans">
                {metric.description}
              </p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

