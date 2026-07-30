'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { LiveConnectionBadge } from './LiveConnectionBadge';
import { Zap, Bot, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { toggleCopilot, copilotOpen } = useUIStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="h-14 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-5 flex items-center justify-between sticky top-0 z-30 font-sans">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-950/60 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-semibold tracking-tight text-sm text-slate-100 flex items-center gap-2">
              GridGuard AI
              <span className="text-[10px] font-sans font-medium text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                Pro
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 font-sans">
              Smart Grid Monitoring &amp; Analytics
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <LiveConnectionBadge />

        <button
          onClick={toggleCopilot}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            copilotOpen
              ? 'bg-indigo-950/80 text-indigo-300 border-indigo-500/30 shadow-sm'
              : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
          }`}
        >
          <Bot className="w-3.5 h-3.5 text-indigo-400" />
          <span>AI Copilot</span>
        </button>

        {isMounted && user && (
          <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-slate-200">{user.full_name}</p>
              <p className="text-[10px] text-blue-400 font-mono">{user.role}</p>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
