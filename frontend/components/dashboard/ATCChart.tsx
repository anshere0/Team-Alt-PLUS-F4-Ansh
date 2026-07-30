'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { ATCDataPoint } from '../../types/dashboard';
import { Activity } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

interface ATCChartProps {
  data: ATCDataPoint[];
}

export const ATCChart: React.FC<ATCChartProps> = ({ data }) => {
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';

  const tooltipBg = isDark ? '#0f172a' : '#ffffff';
  const tooltipBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
  const tooltipText = isDark ? '#f8fafc' : '#0f172a';
  const gridStroke = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)';
  const axisColor = '#64748b';

  return (
    <div className="glass-panel p-6 space-y-5 font-sans">
      <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-5">
        <div>
          <h2 className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5 font-sans">
            <Activity className="w-4 h-4 text-[var(--accent-blue)]" />
            AT&amp;C Energy Loss Trend
          </h2>
          <p className="text-[11px] text-[var(--text-muted)] font-sans mt-0.5">
            24-hour aggregate technical &amp; commercial energy draw analysis (kWh)
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-sans">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[var(--accent-blue)] inline-block" />
            <span className="text-[var(--text-secondary)]">Expected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[var(--accent-rose)] inline-block" />
            <span className="text-[var(--text-secondary)]">Actual</span>
          </div>
        </div>
      </div>

      <div className="h-[280px] w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="timestamp" stroke={axisColor} fontSize={11} fontFamily="monospace" />
            <YAxis stroke={axisColor} fontSize={11} fontFamily="monospace" unit="kWh" />
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                borderColor: tooltipBorder,
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                fontSize: '12px',
                fontFamily: 'sans-serif',
                color: tooltipText,
              }}
            />
            <Area
              type="monotone"
              dataKey="expected_draw_kwh"
              name="Expected Draw (kWh)"
              stroke="#3b82f6"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#colorExpected)"
            />
            <Area
              type="monotone"
              dataKey="actual_draw_kwh"
              name="Actual Draw (kWh)"
              stroke="#f43f5e"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#colorActual)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
