import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { apiConfig } from './config';

// Environment detection
const isDevelopment = process.env.NODE_ENV === 'development';
// Next.js only supports 'development', 'production', and 'test' as NODE_ENV values
// For staging, we'll use a custom environment variable or detect it another way
const isStaging = process.env.NEXT_PUBLIC_APP_ENV === 'staging';
const isProduction = process.env.NODE_ENV === 'production' && !isStaging;

/**
 * API request configuration
 */
export interface ApiRequestConfig extends AxiosRequestConfig {
  // Add any custom config properties here
  skipAuthRefresh?: boolean;
  skipErrorHandling?: boolean;
}

/**
 * Create a configured Axios instance
 */
const createApiClient = (config?: ApiRequestConfig): AxiosInstance => {
  const axiosInstance = axios.create({
    baseURL: apiConfig.baseUrl,
    timeout: apiConfig.timeout,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    ...config,
  });

  // Configure request interceptors
  axiosInstance.interceptors.request.use(
    (config) => {
      // You can modify the request config here
      // For example, add authentication token
      const token = getAuthToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Configure response interceptors
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      // You can modify the response data here
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as ApiRequestConfig;
      
      // Handle token refresh logic
      if (
        error.response?.status === 401 &&
        !originalRequest.skipAuthRefresh &&
        originalRequest.url !== '/auth/refresh-token'
      ) {
        try {
          // Import refreshAuthToken dynamically to avoid circular dependency
          const { refreshAuthToken } = await import('./auth');
          const refreshed = await refreshAuthToken();
          
          if (refreshed) {
            // Get the new token
            const newToken = localStorage.getItem('auth_token');
            
            // Update the Authorization header with the new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            
            // Retry the original request with the new token
            return axiosInstance(originalRequest);
          } else {
            // If refresh failed, redirect to login page
            if (typeof window !== 'undefined') {
              window.location.href = '/authenticate?type=LOGIN&utm_source=direct';
            }
          }
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError);
          // If refresh fails, redirect to login page
          if (typeof window !== 'undefined') {
            window.location.href = '/authenticate?type=LOGIN&utm_source=direct';
          }
        }
      }

      // Skip error handling if specified in the request config
      if (originalRequest.skipErrorHandling) {
        return Promise.reject(error);
      }

      // Handle different error statuses
      handleApiError(error);
      
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

/**
 * Get authentication token from storage
 */
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

/**
 * Handle API errors based on status codes
 */
const handleApiError = (error: AxiosError): void => {
  const status = error.response?.status;

  switch (status) {
    case 400:
      console.error('Bad Request:', error.response?.data);
      break;
    case 401:
      console.error('Unauthorized:', error.response?.data);
      // You might want to redirect to login page
      break;
    case 403:
      console.error('Forbidden:', error.response?.data);
      break;
    case 404:
      console.error('Not Found:', error.response?.data);
      break;
    case 500:
      console.error('Server Error:', error.response?.data);
      break;
    default:
      console.error('API Error:', error.message);
      break;
  }
};

// Create default API client instance
const apiClient = createApiClient();

export { apiClient, createApiClient };