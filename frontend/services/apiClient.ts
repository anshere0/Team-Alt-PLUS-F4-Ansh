import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse, ApiSuccessResponse } from '../types/api';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws') + '/api/v1/ws/stream';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

let mockToken: string | null = null;
let mockTokenPromise: Promise<string | null> | null = null;

export async function getMockToken() {
  if (mockToken) return mockToken;
  if (mockTokenPromise) return mockTokenPromise;

  mockTokenPromise = axios.post(`${API_BASE_URL}/api/v1/auth/login`, {
    username: 'admin',
    password: 'admin123'
  }).then(res => {
    mockToken = res.data.data.access_token;
    return mockToken;
  }).catch(() => null);

  return mockTokenPromise;
}

// Request interceptor to automatically inject token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (!config.url?.includes('/auth/login')) {
      const token = await getMockToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle envelope unpacking and 401 unauthorized
apiClient.interceptors.response.use(
  (response) => {
    const data = response.data as ApiResponse;
    if (data && typeof data === 'object' && 'success' in data) {
      if (!data.success) {
        return Promise.reject(new Error(data.message || 'API request failed'));
      }
      return (data as ApiSuccessResponse).data;
    }
    return response.data;
  },
  (error: AxiosError<any>) => {
    // Aggressive error logging for production debugging
    console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
    console.error('[API Error Details]', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    if (error.response?.status === 429) {
      console.warn('Rate Limit Exceeded', error.response.data);
    }
    return Promise.reject(error);
  }
);
