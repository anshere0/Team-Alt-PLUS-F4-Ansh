'use client';

import React, { useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { CopilotDrawer } from '../copilot/CopilotDrawer';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useThemeStore } from '../../store/themeStore';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Activate real-time WebSocket connection
  useWebSocket();

  // Initialize theme from localStorage on mount
  const initTheme = useThemeStore((s) => s.initTheme);
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <div className="min-h-screen bg-[var(--bg-root)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-blue-500/30 selection:text-white transition-colors duration-200">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 relative">
          {children}
        </main>
      </div>
      <CopilotDrawer />
    </div>
  );
};
