import { GetResult } from '@fingerprintjs/fingerprintjs';
import { getFingerprint } from './index';

/**
 * Device information DTO for API requests
 */
export interface DeviceInfoDto {
  deviceId?: string;
  name?: string;
  type?: string;
  brand?: string;
  model?: string;
  osName?: string;
  osVersion?: string;
  browserName?: string;
  browserVersion?: string;
  pushToken?: string;
}

/**
 * Enhanced device information
 */
export interface DeviceInfo {
  // Basic device information
  userAgent: string;
  platform: string;
  language: string;
  languages: readonly string[];
  cookiesEnabled: boolean;
  doNotTrack: string | null;
  timezone: string;
  timezoneOffset: number;
  screenWidth: number;
  screenHeight: number;
  screenColorDepth: number;
  devicePixelRatio: number;
  
  // Connection information (if available)
  connectionType?: string;
  effectiveConnectionType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  
  // Hardware information
  cpuCores?: number;
  deviceMemory?: number;
  hardwareConcurrency?: number;
  
  // Browser capabilities
  touchPoints?: number;
  pdfViewerEnabled?: boolean;
  webglVendor?: string;
  webglRenderer?: string;
  canvasSupported?: boolean;
  webrtcSupported?: boolean;
  webworkerSupported?: boolean;
  localStorageSupported?: boolean;
  sessionStorageSupported?: boolean;
  indexedDBSupported?: boolean;
  
  // Fingerprint information
  visitorId: string;
  confidence: {
    score: number;
    comment?: string;
  };
}

/**
 * Get enhanced device information including fingerprint
 */
export async function getEnhancedDeviceInfo(): Promise<DeviceInfo> {
  // Get the fingerprint
  const fingerprintResult = await getFingerprint().getFingerprint();
  
  // Basic device information
  const deviceInfo: DeviceInfo = {
    // Basic browser information
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    languages: navigator.languages,
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    screenColorDepth: window.screen.colorDepth,
    devicePixelRatio: window.devicePixelRatio,
    
    // Fingerprint information
    visitorId: fingerprintResult.visitorId,
    confidence: calculateConfidenceScore(fingerprintResult),
  };
  
  // Add connection information if available
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection) {
      deviceInfo.connectionType = connection.type;
      deviceInfo.effectiveConnectionType = connection.effectiveType;
      deviceInfo.downlink = connection.downlink;
      deviceInfo.rtt = connection.rtt;
      deviceInfo.saveData = connection.saveData;
    }
  }
  
  // Add hardware information if available
  if ('hardwareConcurrency' in navigator) {
    deviceInfo.hardwareConcurrency = navigator.hardwareConcurrency;
    deviceInfo.cpuCores = navigator.hardwareConcurrency;
  }
  
  if ('deviceMemory' in navigator) {
    deviceInfo.deviceMemory = (navigator as any).deviceMemory;
  }
  
  // Add touch capability information
  if ('maxTouchPoints' in navigator) {
    deviceInfo.touchPoints = navigator.maxTouchPoints;
  }
  
  // Check PDF viewer capability
  deviceInfo.pdfViewerEnabled = 'pdfViewerEnabled' in navigator && (navigator as any).pdfViewerEnabled;
  
  // Check WebGL information
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        deviceInfo.webglVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        deviceInfo.webglRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
    }
  } catch (e) {
    console.error('Error getting WebGL information:', e);
  }
  
  // Check browser capabilities
  deviceInfo.canvasSupported = !!document.createElement('canvas').getContext;
  deviceInfo.webrtcSupported = !!window.RTCPeerConnection;
  deviceInfo.webworkerSupported = !!window.Worker;
  
  // Check storage support
  deviceInfo.localStorageSupported = checkStorageAvailability('localStorage');
  deviceInfo.sessionStorageSupported = checkStorageAvailability('sessionStorage');
  deviceInfo.indexedDBSupported = !!window.indexedDB;
  
  return deviceInfo;
}

/**
 * Calculate a confidence score for the fingerprint
 */
function calculateConfidenceScore(result: GetResult): { score: number; comment?: string } {
  // Start with a base score
  let score = 0.5;
  let comment = '';
  
  // Check if we have components data
  if (result.components) {
    // Increase score based on available components
    const components = Object.keys(result.components).length;
    if (components > 15) score += 0.3;
    else if (components > 10) score += 0.2;
    else if (components > 5) score += 0.1;
    
    // Check for high-entropy components
    const highEntropyComponents = [
      'canvas', 'webgl', 'fonts', 'audio', 'screenResolution',
      'deviceMemory', 'hardwareConcurrency', 'timezone'
    ];
    
    let availableHighEntropyComponents = 0;
    for (const component of highEntropyComponents) {
      if (component in result.components) {
        availableHighEntropyComponents++;
      }
    }
    
    // Adjust score based on high-entropy components
    if (availableHighEntropyComponents >= 6) {
      score += 0.2;
      comment = 'High confidence: multiple high-entropy components available';
    } else if (availableHighEntropyComponents >= 4) {
      score += 0.1;
      comment = 'Medium confidence: some high-entropy components available';
    } else {
      comment = 'Lower confidence: few high-entropy components available';
    }
  } else {
    score -= 0.2;
    comment = 'Low confidence: component data not available';
  }
  
  // Cap the score between 0 and 1
  score = Math.max(0, Math.min(1, score));
  
  return { score, comment };
}

/**
 * Check if a storage type is available
 */
function checkStorageAvailability(type: 'localStorage' | 'sessionStorage'): boolean {
  try {
    const storage = window[type];
    const testKey = `__storage_test__${Math.random()}`;
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Map enhanced device information to DeviceInfoDto format
 */
export function mapToDeviceInfoDto(deviceInfo: DeviceInfo): DeviceInfoDto {
  // Extract browser name and version from user agent
  const userAgent = deviceInfo.userAgent;
  let browserName = '';
  let browserVersion = '';
  
  // Simple browser detection
  if (userAgent.includes('Chrome')) {
    browserName = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+\.\d+)/i);
    if (match) browserVersion = match[1];
  } else if (userAgent.includes('Firefox')) {
    browserName = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+\.\d+)/i);
    if (match) browserVersion = match[1];
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browserName = 'Safari';
    const match = userAgent.match(/Version\/(\d+\.\d+)/i);
    if (match) browserVersion = match[1];
  } else if (userAgent.includes('Edge') || userAgent.includes('Edg')) {
    browserName = 'Edge';
    const match = userAgent.match(/Edge?\/(\d+\.\d+)/i);
    if (match) browserVersion = match[1];
  } else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) {
    browserName = 'Internet Explorer';
    const match = userAgent.match(/(?:MSIE |rv:)(\d+\.\d+)/i);
    if (match) browserVersion = match[1];
  }
  
  // Extract OS information
  let osName = '';
  let osVersion = '';
  
  if (userAgent.includes('Windows')) {
    osName = 'Windows';
    const match = userAgent.match(/Windows NT (\d+\.\d+)/i);
    if (match) {
      const ntVersion = match[1];
      // Map NT version to Windows version
      const ntToWindows: Record<string, string> = {
        '10.0': '10',
        '6.3': '8.1',
        '6.2': '8',
        '6.1': '7',
        '6.0': 'Vista',
        '5.2': 'XP x64',
        '5.1': 'XP'
      };
      osVersion = ntToWindows[ntVersion] || ntVersion;
    }
  } else if (userAgent.includes('Mac OS X')) {
    osName = 'macOS';
    const match = userAgent.match(/Mac OS X (\d+[._]\d+)/i);
    if (match) osVersion = match[1].replace('_', '.');
  } else if (userAgent.includes('Android')) {
    osName = 'Android';
    const match = userAgent.match(/Android (\d+\.\d+)/i);
    if (match) osVersion = match[1];
  } else if (userAgent.includes('iOS') || userAgent.includes('iPhone OS')) {
    osName = 'iOS';
    const match = userAgent.match(/OS (\d+[._]\d+)/i);
    if (match) osVersion = match[1].replace('_', '.');
  } else if (userAgent.includes('Linux')) {
    osName = 'Linux';
  }
  
  return {
    deviceId: deviceInfo.visitorId,
    name: `${browserName} on ${osName}`,
    type: deviceInfo.touchPoints && deviceInfo.touchPoints > 0 ? 'Mobile' : 'Desktop',
    brand: deviceInfo.webglVendor || '',
    model: deviceInfo.webglRenderer || '',
    osName,
    osVersion,
    browserName,
    browserVersion
  };
}

export default getEnhancedDeviceInfo;