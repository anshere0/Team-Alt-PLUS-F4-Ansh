'use client';

import { create } from 'zustand';

export type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'dark',

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },

  setTheme: (theme: Theme) => {
    set({ theme });
    if (typeof window !== 'undefined') {
      localStorage.setItem('gridguard-theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    }
  },

  initTheme: () => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('gridguard-theme') as Theme | null;
    const resolved = stored || 'dark';
    set({ theme: resolved });
    document.documentElement.setAttribute('data-theme', resolved);
  },
}));
