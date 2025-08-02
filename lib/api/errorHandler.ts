import { AxiosError } from 'axios';

/**
 * API Response interface
 */
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  meta?: Record<string, any>;
}

/**
 * API Error types
 */
export enum ApiErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  BAD_REQUEST_ERROR = 'BAD_REQUEST_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  public readonly type: ApiErrorType;
  public readonly status: number | null;
  public readonly data: any;
  public readonly originalError: Error | null;

  constructor({
    message,
    type = ApiErrorType.UNKNOWN_ERROR,
    status = null,
    data = null,
    originalError = null,
  }: {
    message: string;
    type?: ApiErrorType;
    status?: number | null;
    data?: any;
    originalError?: Error | null;
  }) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.status = status;
    this.data = data;
    this.originalError = originalError;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Create an ApiError from an AxiosError
   */
  static fromAxiosError(error: AxiosError): ApiError {
    const status = error.response?.status || null;
    const data = error.response?.data || null;
    let type = ApiErrorType.UNKNOWN_ERROR;
    let message = error.message || 'An unknown error occurred';

    // Determine error type based on status code or error code
    if (error.code === 'ECONNABORTED') {
      type = ApiErrorType.TIMEOUT_ERROR;
      message = 'Request timeout. Please try again.';
    } else if (error.code === 'ERR_NETWORK') {
      type = ApiErrorType.NETWORK_ERROR;
      message = 'Network error. Please check your connection.';
    } else if (status) {
      switch (status) {
        case 400:
          type = ApiErrorType.BAD_REQUEST_ERROR;
          message = (data as { message?: string })?.message || 'Bad request';
          break;
        case 401:
          type = ApiErrorType.AUTHENTICATION_ERROR;
          message = 'Authentication required';
          break;
        case 403:
          type = ApiErrorType.AUTHORIZATION_ERROR;
          message = 'You do not have permission to perform this action';
          break;
        case 404:
          type = ApiErrorType.NOT_FOUND_ERROR;
          message = 'The requested resource was not found';
          break;
        case 422:
          type = ApiErrorType.VALIDATION_ERROR;
          message = (data as { message?: string })?.message || 'Validation error';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          type = ApiErrorType.SERVER_ERROR;
          message = 'Server error. Please try again later.';
          break;
      }
    }

    return new ApiError({
      message,
      type,
      status,
      data,
      originalError: error,
    });
  }
}

/**
 * Format API error for display
 */
export const formatApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (error instanceof AxiosError) {
    return ApiError.fromAxiosError(error).message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred';
};

/**
 * Create a standardized error response
 */
export const createErrorResponse = <T = any>(
  error: unknown,
  defaultMessage = 'An error occurred'
): ApiResponse<T> => {
  if (error instanceof ApiError) {
    return {
      success: false,
      status: error.status || 500,
      message: error.message,
      data: error.data || null,
    };
  }
  
  if (error instanceof AxiosError) {
    const apiError = ApiError.fromAxiosError(error);
    return {
      success: false,
      status: apiError.status || 500,
      message: apiError.message,
      data: apiError.data || null,
    };
  }
  
  return {
    success: false,
    status: 500,
    message: error instanceof Error ? error.message : defaultMessage,
    data: null as T,
  };
};