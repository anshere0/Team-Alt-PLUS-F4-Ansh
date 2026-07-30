'use client';

import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { CopilotDrawer } from '../copilot/CopilotDrawer';
import { useWebSocket } from '../../hooks/useWebSocket';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Activate real-time WebSocket connection
  useWebSocket();

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
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
