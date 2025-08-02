import { useState, useCallback, useEffect } from 'react';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { apiClient, ApiRequestConfig } from './axios';
import { ApiError, formatApiError } from './errorHandler';

/**
 * Hook state for API requests
 */
export interface UseApiState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

/**
 * Options for useApi hook
 */
export interface UseApiOptions<T> extends Omit<ApiRequestConfig, 'url' | 'method'> {
  initialData?: T | null;
  onSuccess?: (data: T) => void;
  onError?: (error: Error | AxiosError | ApiError) => void;
  autoFetch?: boolean;
}

/**
 * Custom hook for making API requests
 */
export function useApi<T = any>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  options: UseApiOptions<T> = {}
) {
  const {
    initialData = null,
    onSuccess,
    onError,
    autoFetch = false,
    ...requestConfig
  } = options;

  // Request state
  const [state, setState] = useState<UseApiState<T>>({
    data: initialData,
    error: null,
    isLoading: autoFetch,
    isSuccess: false,
    isError: false,
  });

  // Execute request function
  const execute = useCallback(
    async (data?: any, config?: AxiosRequestConfig) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const mergedConfig: ApiRequestConfig = {
          ...requestConfig,
          ...config,
          url,
          method,
        };

        // Add data to appropriate property based on method
        if (data) {
          if (method === 'GET') {
            mergedConfig.params = { ...mergedConfig.params, ...data };
          } else {
            mergedConfig.data = data;
          }
        }

        const response = await apiClient.request<T>(mergedConfig);
        const responseData = response.data;

        setState({
          data: responseData,
          error: null,
          isLoading: false,
          isSuccess: true,
          isError: false,
        });

        onSuccess?.(responseData);
        return responseData;
      } catch (error: any) {
        const errorMessage = formatApiError(error);

        setState({
          data: initialData,
          error: errorMessage,
          isLoading: false,
          isSuccess: false,
          isError: true,
        });

        onError?.(error);
        throw error;
      }
    },
    [url, method, requestConfig, initialData, onSuccess, onError]
  );

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch && method === 'GET') {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset function
  const reset = useCallback(() => {
    setState({
      data: initialData,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
  }, [initialData]);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Convenience hooks for different HTTP methods
 */
export function useGet<T = any>(url: string, options?: UseApiOptions<T>) {
  return useApi<T>(url, 'GET', options);
}

export function usePost<T = any>(url: string, options?: UseApiOptions<T>) {
  return useApi<T>(url, 'POST', options);
}

export function usePut<T = any>(url: string, options?: UseApiOptions<T>) {
  return useApi<T>(url, 'PUT', options);
}

export function usePatch<T = any>(url: string, options?: UseApiOptions<T>) {
  return useApi<T>(url, 'PATCH', options);
}

export function useDelete<T = any>(url: string, options?: UseApiOptions<T>) {
  return useApi<T>(url, 'DELETE', options);
}