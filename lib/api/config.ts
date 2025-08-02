/**
 * API Configuration
 * 
 * This file contains environment-specific configuration for API services.
 * Values are loaded from environment variables with fallbacks for each environment.
 */

// Environment detection
const isDevelopment = process.env.NODE_ENV === 'development';
// Next.js only supports 'development', 'production', and 'test' as NODE_ENV values
// For staging, we'll use a custom environment variable
const isStaging = process.env.NEXT_PUBLIC_APP_ENV === 'staging';
const isProduction = process.env.NODE_ENV === 'production' && !isStaging;

/**
 * API Configuration object
 */
export const apiConfig = {
  // Base API URL - Environment specific
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 
    (isDevelopment ? 'http://localhost:3001/api' : 
     isStaging ? 'https://staging-api.landsonagri.com' : 
     'https://api.landsonagri.com'),
  
  // Request timeout in milliseconds - Environment specific
  timeout: process.env.NEXT_PUBLIC_API_TIMEOUT ? 
    parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT) : 
    (isDevelopment ? 60000 : isStaging ? 45000 : 30000),
  
  // Enable request/response logging - Environment specific
  enableLogging: process.env.NEXT_PUBLIC_API_LOGGING === 'true' || 
    (isDevelopment ? true : isStaging ? true : false),
  
  // Retry configuration - Environment specific
  retry: {
    // Maximum number of retry attempts
    maxRetries: process.env.NEXT_PUBLIC_API_MAX_RETRIES ? 
      parseInt(process.env.NEXT_PUBLIC_API_MAX_RETRIES) : 
      (isDevelopment ? 5 : isStaging ? 4 : 3),
    
    // Initial retry delay in milliseconds
    initialDelayMs: process.env.NEXT_PUBLIC_API_RETRY_DELAY ? 
      parseInt(process.env.NEXT_PUBLIC_API_RETRY_DELAY) : 
      (isDevelopment ? 500 : isStaging ? 750 : 1000),
    
    // Maximum retry delay in milliseconds
    maxDelayMs: process.env.NEXT_PUBLIC_API_MAX_RETRY_DELAY ? 
      parseInt(process.env.NEXT_PUBLIC_API_MAX_RETRY_DELAY) : 
      (isDevelopment ? 10000 : isStaging ? 20000 : 30000),
    
    // Status codes that should trigger a retry
    statusCodesToRetry: [408, 429, 500, 502, 503, 504],
  },
  
  // Cache configuration - Environment specific
  cache: {
    // Enable response caching
    enabled: process.env.NEXT_PUBLIC_API_CACHE_ENABLED === 'true' || 
      (isDevelopment ? false : isStaging ? true : true),
    
    // Default cache TTL in seconds
    ttl: process.env.NEXT_PUBLIC_API_CACHE_TTL ? 
      parseInt(process.env.NEXT_PUBLIC_API_CACHE_TTL) : 
      (isDevelopment ? 60 : isStaging ? 180 : 300),
  },
  
  // Authentication
  auth: {
    // Token storage key
    tokenKey: 'auth_token',
    
    // Refresh token storage key
    refreshTokenKey: 'refresh_token',
    
    // Authentication endpoints
    endpoints: {
      login: '/auth/login',
      logout: '/auth/logout',
      refresh: '/auth/refresh',
      user: '/auth/user',
    },
  },
  
  // Environment flags
  environment: {
    isDevelopment,
    isStaging,
    isProduction,
  },
};

/**
 * Get the full API URL
 */
export const getApiUrl = (path: string): string => {
  const baseUrl = apiConfig.baseUrl.endsWith('/') 
    ? apiConfig.baseUrl.slice(0, -1) 
    : apiConfig.baseUrl;
  
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${normalizedPath}`;
};

export default apiConfig;