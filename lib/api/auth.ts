/**
 * Authentication API utilities
 * 
 * This file contains utilities for handling authentication-related API calls.
 */

import { apiClient } from './axios';
import { authEndpoints, userEndpoints } from './endpoints';

/**
 * Check if the input is an email address
 */
export const isEmail = (input: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input);
};

/**
 * Check if the input is a phone number
 */
export const isPhoneNumber = (input: string): boolean => {
  // Basic phone number validation - can be enhanced based on requirements
  const phoneRegex = /^\+?[0-9\s-()]{8,}$/;
  return phoneRegex.test(input);
};

/**
 * Login with email/phone and password
 */
export const login = async (emailOrPhone: string, password: string, deviceInfo?: any) => {
  const isEmailInput = isEmail(emailOrPhone);
  const isPhoneInput = isPhoneNumber(emailOrPhone);
  
  if (!isEmailInput && !isPhoneInput) {
    throw new Error('Invalid email or phone number format');
  }
  
  const payload = isEmailInput 
    ? { email: emailOrPhone, password, deviceInfo } 
    : { phoneNumber: emailOrPhone, password, deviceInfo };
  
  const response = await apiClient.post(authEndpoints.login, payload);
  
  // Store tokens in localStorage
  if (response.data?.accessToken) {
    localStorage.setItem('auth_token', response.data.accessToken);
  }
  
  if (response.data?.refreshToken) {
    localStorage.setItem('refresh_token', response.data.refreshToken);
  }
  
  // Check if user has management access
  if (response.data?.user && response.data.user.managementAccess === false) {
    // Redirect to landsonagri.in website
    window.location.href = 'https://www.landsonagri.in';
  }
  
  return response;
};

/**
 * Request OTP for login
 */
export const requestOtp = async (emailOrPhone: string) => {
  const isEmailInput = isEmail(emailOrPhone);
  const isPhoneInput = isPhoneNumber(emailOrPhone);
  
  if (!isEmailInput && !isPhoneInput) {
    throw new Error('Invalid email or phone number format');
  }
  
  const payload = isEmailInput 
    ? { email: emailOrPhone, requestOtp: true } 
    : { phoneNumber: emailOrPhone, requestOtp: true };
  
  return apiClient.post(authEndpoints.login, payload);
};

/**
 * Verify OTP for login
 */
export const verifyOtp = async (emailOrPhone: string, otp: string, deviceInfo?: any) => {
  const isEmailInput = isEmail(emailOrPhone);
  const isPhoneInput = isPhoneNumber(emailOrPhone);
  
  if (!isEmailInput && !isPhoneInput) {
    throw new Error('Invalid email or phone number format');
  }
  
  const payload = isEmailInput 
    ? { email: emailOrPhone, code: otp, type: 'LOGIN',  } 
    : { phoneNumber: emailOrPhone, code: otp, type: 'LOGIN',  };
  
  const response = await apiClient.post(authEndpoints.verifyOtp, payload);
  
  // Store tokens in localStorage
  if (response.data?.accessToken) {
    localStorage.setItem('auth_token', response.data.accessToken);
  }
  
  if (response.data?.refreshToken) {
    localStorage.setItem('refresh_token', response.data.refreshToken);
  }
  
  // Check if user has management access
  if (response.data?.user && response.data.user.managementAccess === false) {
    // Redirect to landsonagri.in website
    window.location.href = 'https://www.landsonagri.in';
  }
  
  return response;
};

/**
 * Logout the current user
 */
export const logout = async () => {
  // Clear tokens from localStorage
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  
  return apiClient.post(authEndpoints.logout);
};

/**
 * Get the current user's profile
 */
export const getProfile = async () => {
  try {
    return await apiClient.get(userEndpoints.profile);
  } catch (error: any) {
    // If unauthorized, try to refresh the token
    if (error.response && error.response.status === 401) {
      const refreshed = await refreshAuthToken();
      if (refreshed) {
        // Retry the profile request with the new token
        return await apiClient.get(userEndpoints.profile);
      } else {
        // Redirect to authentication page if token refresh failed
        window.location.href = '/authenticate?type=LOGIN&utm_source=direct';
        throw new Error('Authentication required');
      }
    }
    throw error;
  }
};

/**
 * Refresh the authentication token
 */
export const refreshAuthToken = async (): Promise<boolean> => {
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) {
    return false;
  }
  
  try {
    const response = await apiClient.post(authEndpoints.refreshToken, {
      refreshToken
    });
    
    if (response.data?.accessToken) {
      localStorage.setItem('auth_token', response.data.accessToken);
      return true;
    }
    
    return false;
  } catch (error) {
    // Clear tokens if refresh fails
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    return false;
  }
};

/**
 * Get user permissions
 * 
 * Fetches the modules that the current user has access to
 */
export const getUserPermissions = async () => {
  try {
    return await apiClient.get(userEndpoints.permissions);
  } catch (error: any) {
    // If unauthorized, try to refresh the token
    if (error.response && error.response.status === 401) {
      const refreshed = await refreshAuthToken();
      if (refreshed) {
        // Retry the permissions request with the new token
        return await apiClient.get(userEndpoints.permissions);
      } else {
        // Redirect to authentication page if token refresh failed
        window.location.href = '/authenticate?type=LOGIN&utm_source=direct';
        throw new Error('Authentication required');
      }
    }
    throw error;
  }
};