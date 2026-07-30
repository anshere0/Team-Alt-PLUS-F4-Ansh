import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/api';
import { AuthSession, LoginCredentials, User } from '../types/user';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthSession> => {
    try {
      const response = await apiClient.post<any, AuthSession>(API_ENDPOINTS.AUTH.LOGIN, credentials);
      return response;
    } catch {
      // Fallback mock authentication for hackathon demo
      const mockUser: User = {
        id: 'usr-99',
        username: credentials.username || 'grid_operator',
        email: 'operator@gridguard.ai',
        role: 'GRID_ENGINEER',
        full_name: 'Ansh Arora (Lead Operator)',
        avatar_url: '/assets/avatar.png',
      };
      return {
        access_token: 'mock_jwt_token_gridguard_2026',
        token_type: 'Bearer',
        user: mockUser,
      };
    }
  },

  getProfile: async (): Promise<User> => {
    try {
      return await apiClient.get<any, User>(API_ENDPOINTS.AUTH.PROFILE);
    } catch {
      return {
        id: 'usr-99',
        username: 'grid_operator',
        email: 'operator@gridguard.ai',
        role: 'GRID_ENGINEER',
        full_name: 'Ansh Arora (Lead Operator)',
      };
    }
  },
};
