'use client';

import React from 'react';
import { useNotificationStore } from '../../store/notificationStore';
import { Wifi, WifiOff } from 'lucide-react';

export const LiveConnectionBadge: React.FC = () => {
  const isWsConnected = useNotificationStore((state) => state.isWsConnected);

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-md transition-all ${
        isWsConnected
          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20'
          : 'bg-amber-950/40 text-amber-400 border border-amber-500/20'
      }`}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isWsConnected ? 'bg-emerald-400' : 'bg-amber-400'
          }`}
        />
        <span
          className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
            isWsConnected ? 'bg-emerald-500' : 'bg-amber-500'
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
