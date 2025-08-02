import FingerprintJS, { Agent, GetResult } from '@fingerprintjs/fingerprintjs';

/**
 * Configuration options for the fingerprint service
 */
export interface FingerprintOptions {
  // Cache the fingerprint result in localStorage
  cacheResult?: boolean;
  // Cache expiration time in milliseconds (default: 24 hours)
  cacheExpiration?: number;
  // Cache key for storing the fingerprint result
  cacheKey?: string;
  // Debug mode for development
  debug?: boolean;
}

/**
 * Default configuration options
 */
const defaultOptions: FingerprintOptions = {
  cacheResult: true,
  cacheExpiration: 24 * 60 * 60 * 1000, // 24 hours
  cacheKey: 'device_fingerprint',
  debug: process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_APP_ENV === 'development',
};

/**
 * Cached fingerprint data structure
 */
interface CachedFingerprint {
  visitorId: string;
  components: Record<string, any>;
  timestamp: number;
  version: string;
}

/**
 * FingerprintJS service for device identification
 */
export class FingerprintService {
  private agent: Promise<Agent> | null = null;
  private options: FingerprintOptions;
  private cachedResult: CachedFingerprint | null = null;

  /**
   * Create a new FingerprintService instance
   */
  constructor(options: FingerprintOptions = {}) {
    this.options = { ...defaultOptions, ...options };
    
    // Initialize the service
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  /**
   * Initialize the fingerprint agent
   */
  private init(): void {
    // Load cached result if available
    if (this.options.cacheResult) {
      this.loadCachedResult();
    }

    // Initialize the agent with enhanced accuracy
    this.agent = FingerprintJS.load({
      debug: this.options.debug // Enable debug mode if specified in options
    });

    if (this.options.debug) {
      console.log('FingerprintJS initialized');
    }
  }

  /**
   * Get the visitor identifier
   */
  async getVisitorId(): Promise<string> {
    const result = await this.getFingerprint();
    return result.visitorId;
  }

  /**
   * Get the complete fingerprint result
   */
  async getFingerprint(): Promise<GetResult> {
    // Check if we have a valid cached result
    if (this.hasFreshCachedResult()) {
      if (this.options.debug) {
        console.log('Using cached fingerprint', this.cachedResult);
      }
      return this.cachedResult as unknown as GetResult;
    }

    try {
      // Ensure the agent is initialized
      if (!this.agent && typeof window !== 'undefined') {
        this.init();
      }

      // Get the fingerprint
      if (!this.agent) {
        throw new Error('Fingerprint agent not initialized');
      }
      
      const agent = await this.agent;
      const result = await agent.get();

      // Cache the result if enabled
      if (this.options.cacheResult) {
        this.cacheResult(result);
      }

      if (this.options.debug) {
        console.log('Generated new fingerprint', result);
      }

      return result;
    } catch (error) {
      console.error('Error getting fingerprint:', error);
      throw error;
    }
  }

  /**
   * Check if we have a fresh cached result
   */
  private hasFreshCachedResult(): boolean {
    if (!this.cachedResult || !this.options.cacheResult) {
      return false;
    }

    const now = Date.now();
    const expirationTime = this.cachedResult.timestamp + (this.options.cacheExpiration || 0);
    
    return now < expirationTime;
  }

  /**
   * Load the cached fingerprint result from storage
   */
  private loadCachedResult(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const cachedData = localStorage.getItem(this.options.cacheKey || defaultOptions.cacheKey!);
      
      if (cachedData) {
        this.cachedResult = JSON.parse(cachedData) as CachedFingerprint;
        
        if (this.options.debug) {
          console.log('Loaded cached fingerprint', this.cachedResult);
        }
      }
    } catch (error) {
      console.error('Error loading cached fingerprint:', error);
      this.cachedResult = null;
    }
  }

  /**
   * Cache the fingerprint result in storage
   */
  private cacheResult(result: GetResult): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const dataToCache: CachedFingerprint = {
        visitorId: result.visitorId,
        components: result.components,
        timestamp: Date.now(),
        version: result.version,
      };

      localStorage.setItem(
        this.options.cacheKey || defaultOptions.cacheKey!,
        JSON.stringify(dataToCache)
      );

      this.cachedResult = dataToCache;
      
      if (this.options.debug) {
        console.log('Cached fingerprint', dataToCache);
      }
    } catch (error) {
      console.error('Error caching fingerprint:', error);
    }
  }

  /**
   * Clear the cached fingerprint
   */
  clearCache(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.removeItem(this.options.cacheKey || defaultOptions.cacheKey!);
      this.cachedResult = null;
      
      if (this.options.debug) {
        console.log('Cleared fingerprint cache');
      }
    } catch (error) {
      console.error('Error clearing fingerprint cache:', error);
    }
  }
}

// Create a singleton instance with default options
let fingerprintService: FingerprintService | null = null;

/**
 * Get the global fingerprint service instance
 */
export const getFingerprint = (): FingerprintService => {
  if (!fingerprintService && typeof window !== 'undefined') {
    fingerprintService = new FingerprintService();
  }
  
  if (!fingerprintService) {
    throw new Error('Fingerprint service not initialized');
  }
  
  return fingerprintService;
};

/**
 * Create a new fingerprint service instance with custom options
 */
export const createFingerprint = (options: FingerprintOptions): FingerprintService => {
  return new FingerprintService(options);
};

export default getFingerprint;