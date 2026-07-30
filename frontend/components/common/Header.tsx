'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useThemeStore } from '../../store/themeStore';
import { LiveConnectionBadge } from './LiveConnectionBadge';
import { Zap, Bot, LogOut, Sun, Moon } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { toggleCopilot, copilotOpen } = useUIStore();
  const { theme, toggleTheme } = useThemeStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="h-13 border-b border-[var(--border-default)] bg-[var(--bg-header)] backdrop-blur-sm px-5 flex items-center justify-between sticky top-0 z-30 font-sans transition-colors duration-200">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <Zap className="w-4 h-4 text-[var(--accent-blue)]" />
          <div>
            <h1 className="font-medium tracking-tight text-sm text-[var(--text-primary)] flex items-center gap-2 font-sans">
              GridGuard AI
              <span className="text-[9px] font-mono text-[var(--text-muted)] bg-[var(--bg-raised)] px-1.5 py-0.5 rounded-sm">
                Pro
              </span>
            </h1>
            <p className="text-[10px] text-[var(--text-muted)] font-sans">
              Smart Grid Monitoring &amp; Analytics
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <LiveConnectionBadge />

        {/* Sun / Moon Theme Toggle */}
        {isMounted && (
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>
        )}

        <button
          onClick={toggleCopilot}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            copilotOpen
              ? 'bg-[var(--tint-indigo-bg)] text-[var(--accent-indigo)] border border-[var(--tint-indigo-border)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-transparent hover:border-[var(--border-default)]'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>AI Copilot</span>
        </button>

        {isMounted && user && (
          <div className="flex items-center gap-3 pl-3 border-l border-[var(--border-default)]">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-[var(--text-primary)]">{user.full_name}</p>
              <p className="text-[10px] text-[var(--text-muted)] font-mono">{user.role}</p>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-rose)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
