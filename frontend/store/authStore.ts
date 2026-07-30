import { create } from 'zustand';
import { User } from '../types/user';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('gridguard_token') : null,
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('gridguard_user') || 'null') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('gridguard_token') : true, // Default true for mock hackathon session
  setAuth: (token: string, user: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gridguard_token', token);
      localStorage.setItem('gridguard_user', JSON.stringify(user));
    }
    set({ token, user, isAuthenticated: true });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gridguard_token');
      localStorage.removeItem('gridguard_user');
    }
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
