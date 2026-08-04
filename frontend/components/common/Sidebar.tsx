'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Map, Network, ClipboardList, ShieldAlert, Cpu, UploadCloud } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Executive Dashboard', icon: LayoutDashboard },
  { href: '/topology', label: 'Grid Topology', icon: Network },
  { href: '/inspector', label: 'Inspector Worklist', icon: ClipboardList },
  { href: '/ingestion', label: 'Data Ingestion', icon: UploadCloud },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-56 border-r border-[var(--border-default)] bg-[var(--bg-sidebar)] flex flex-col justify-between py-4 px-3 shrink-0 hidden md:flex min-h-[calc(100vh-3.25rem)] font-sans transition-colors duration-200">
      <div className="space-y-6">
        <div>
          <p className="text-[10px] font-medium text-[var(--text-muted)] mb-3 px-2">
            Navigation
          </p>
          <nav className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={`Navigate to ${item.label}`}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)] transition-all ${
                    isActive
                      ? 'bg-[var(--bg-active)] text-[var(--text-primary)] font-medium'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--accent-blue)]' : 'text-[var(--text-muted)]'}`} aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-[var(--border-subtle)] px-1">
          <p className="text-[10px] font-medium text-[var(--text-muted)] mb-2 px-1">
            System
          </p>
          <div className="space-y-1.5 text-xs px-1">
            <div className="flex items-center justify-between py-1">
              <span className="text-[var(--text-muted)] flex items-center gap-1.5">
                <Cpu className="w-3 h-3" /> Model
              </span>
              <span className="font-mono text-[var(--text-secondary)] text-[11px]">v4.2-XGB</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-[var(--text-muted)] flex items-center gap-1.5">
                <ShieldAlert className="w-3 h-3" /> SHAP
              </span>
              <span className="font-mono text-[var(--accent-emerald)] text-[11px]">Online</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-1 py-3 border-t border-[var(--border-subtle)]">
        <p className="text-[11px] text-[var(--text-secondary)] mb-0.5">Grid Status</p>
        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
          148.9k smart meters active across 14 feeder lines.
        </p>
      </div>
    </aside>
  );
};
