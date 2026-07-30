'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Map, Network, ClipboardList, ShieldAlert, Cpu } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Executive Dashboard', icon: LayoutDashboard },
  { href: '/gis', label: 'GIS Loss Heatmap', icon: Map },
  { href: '/topology', label: 'Grid Topology', icon: Network },
  { href: '/inspector', label: 'Inspector Worklist', icon: ClipboardList },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-60 border-r border-slate-800/80 bg-slate-950/60 backdrop-blur-xl flex flex-col justify-between p-3.5 shrink-0 hidden md:flex min-h-[calc(100vh-3.5rem)] font-sans">
      <div className="space-y-5">
        <div>
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2 px-2">
            Navigation
          </p>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-all ${
                    isActive
                      ? 'bg-slate-800/90 text-white font-medium border border-slate-700/60 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-3 border-t border-slate-800/60 px-2">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">
            System Engine
          </p>
          <div className="glass-panel p-2.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-400" /> Model Version
              </span>
              <span className="font-mono text-slate-200 text-[11px]">v4.2-XGB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" /> SHAP Engine
              </span>
              <span className="font-sans font-medium text-emerald-400 text-[11px]">Online</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 glass-panel border-slate-800 bg-slate-900/40">
        <p className="text-[11px] font-medium text-slate-300 mb-1">Grid Operational Status</p>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          148.9k smart meters active across 14 feeder lines.
        </p>
      </div>
    </aside>
  );
};
