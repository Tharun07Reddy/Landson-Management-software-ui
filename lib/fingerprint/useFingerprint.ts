import { useState, useEffect, useCallback } from 'react';
import { GetResult } from '@fingerprintjs/fingerprintjs';
import { getFingerprint, FingerprintOptions, createFingerprint } from './index';

/**
 * Hook state for fingerprint
 */
export interface UseFingerprintState {
  // The visitor ID (fingerprint)
  visitorId: string | null;
  // The complete fingerprint result
  result: GetResult | null;
  // Loading state
  isLoading: boolean;
  // Error state
  error: Error | null;
  // Function to refresh the fingerprint
  refresh: () => Promise<GetResult>;
  // Function to clear the fingerprint cache
  clearCache: () => void;
}

/**
 * Options for useFingerprint hook
 */
export interface UseFingerprintOptions extends FingerprintOptions {
  // Automatically get fingerprint on mount
  autoGet?: boolean;
}

/**
 * React hook for using device fingerprinting
 */
export function useFingerprint(options: UseFingerprintOptions = {}): UseFingerprintState {
  const { autoGet = true, ...fingerprintOptions } = options;
  
  // Create a fingerprint service instance with the provided options
  const [service] = useState(() => {
    return options ? createFingerprint(fingerprintOptions) : getFingerprint();
  });
  
  // State for the fingerprint result
  const [state, setState] = useState<{
    visitorId: string | null;
    result: GetResult | null;
    isLoading: boolean;
    error: Error | null;
  }>({
    visitorId: null,
    result: null,
    isLoading: autoGet,
    error: null,
  });

  /**
   * Get the fingerprint
   */
  const getVisitorFingerprint = useCallback(async (): Promise<GetResult> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await service.getFingerprint();
      
      setState({
        visitorId: result.visitorId,
        result,
        isLoading: false,
        error: null,
      });
      
      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Failed to get fingerprint');
      
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorObj,
      }));
      
      throw errorObj;
    }
  }, [service]);

  /**
   * Clear the fingerprint cache
   */
  const clearCache = useCallback(() => {
    service.clearCache();
    setState({
      visitorId: null,
      result: null,
      isLoading: false,
      error: null,
    });
  }, [service]);

  // Get the fingerprint on mount if autoGet is enabled
  useEffect(() => {
    if (autoGet) {
      getVisitorFingerprint().catch((error) => {
        console.error('Error getting fingerprint:', error);
      });
    }
  }, [autoGet, getVisitorFingerprint]);

  return {
    ...state,
    refresh: getVisitorFingerprint,
    clearCache,
  };
}

export default useFingerprint;