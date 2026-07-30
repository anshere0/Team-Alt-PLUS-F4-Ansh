'use client';

import React from 'react';
import { useNotificationStore } from '../../store/notificationStore';
import { Wifi, WifiOff } from 'lucide-react';

export const LiveConnectionBadge: React.FC = () => {
  const isWsConnected = useNotificationStore((state) => state.isWsConnected);

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
        isWsConnected
          ? 'bg-[var(--tint-emerald-bg)] text-[var(--accent-emerald)] border border-[var(--tint-emerald-border)]'
          : 'bg-[var(--tint-amber-bg)] text-[var(--accent-amber)] border border-[var(--tint-amber-border)]'
      }`}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isWsConnected ? 'bg-[var(--accent-emerald)]' : 'bg-[var(--accent-amber)]'
          }`}
        />
        <span
          className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
            isWsConnected ? 'bg-[var(--accent-emerald)]' : 'bg-[var(--accent-amber)]'
          }`}
        />
      </span>
      {isWsConnected ? (
        <>
          <Wifi className="w-3 h-3" />
          <span className="font-mono text-[11px]">LIVE</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          <span className="font-mono text-[11px]">MOCK</span>
        </>
      )}
    </div>
  );
};
