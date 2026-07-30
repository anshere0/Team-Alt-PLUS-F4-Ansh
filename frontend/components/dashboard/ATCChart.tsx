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

interface ATCChartProps {
  data: ATCDataPoint[];
}

export const ATCChart: React.FC<ATCChartProps> = ({ data }) => {
  return (
    <div className="glass-panel p-4 space-y-3.5 font-sans">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div>
          <h2 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 font-sans">
            <Activity className="w-4 h-4 text-blue-400" />
            AT&amp;C Energy Loss Trend
          </h2>
          <p className="text-[11px] text-slate-400 font-sans mt-0.5">
            24-hour aggregate technical &amp; commercial energy draw analysis (kWh)
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-sans">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />
            <span className="text-slate-300">Expected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
            <span className="text-slate-300">Actual</span>
          </div>
        </div>
      </div>

      <div className="h-[280px] w-full pt-1">
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
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="timestamp" stroke="#64748B" fontSize={11} fontFamily="monospace" />
            <YAxis stroke="#64748B" fontSize={11} fontFamily="monospace" unit="kWh" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                fontSize: '12px',
                fontFamily: 'sans-serif',
                color: '#fff',
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
