import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse, ApiSuccessResponse } from '../types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor (auth token injection removed)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
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
    if (error.response?.status === 429) {
      console.warn('Rate Limit Exceeded', error.response.data);
    }
    return Promise.reject(error);
  }
);
