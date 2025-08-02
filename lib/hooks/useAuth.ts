import { useState, useEffect } from 'react';
import { getProfile, refreshAuthToken, getUserPermissions } from '@/lib/api/auth';

interface User {
  id: string;
  email?: string;
  phoneNumber?: string;
  name?: string;
  managementAccess: boolean;
  permissions?: string[];
  [key: string]: any; // Allow for additional properties
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  permissions: string[];
}

/**
 * Hook to manage authentication state and user profile
 */
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
    isAuthenticated: false,
    permissions: []
  });

  // Function to fetch user profile and permissions
  const fetchUserProfile = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const profileResponse = await getProfile();
      let permissions: string[] = [];
      
      // Fetch user permissions if authenticated
      try {
        const permissionsResponse = await getUserPermissions();
        permissions = permissionsResponse.data?.modules || [];
      } catch (permError) {
        console.error('Failed to fetch permissions:', permError);
      }
      
      // Update user with permissions
      const userData = {
        ...profileResponse.data,
        permissions
      };
      
      setAuthState({
        user: userData,
        isLoading: false,
        error: null,
        isAuthenticated: true,
        permissions
      });
      
      return userData;
    } catch (error: any) {
      // If the error is not an authentication error (already handled in getProfile)
      if (error.message !== 'Authentication required') {
        setAuthState({
          user: null,
          isLoading: false,
          error: error,
          isAuthenticated: false,
          permissions: []
        });
      }
      
      return null;
    }
  };

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const authToken = localStorage.getItem('auth_token');
      
      if (!authToken) {
        // Try to refresh the token if no auth token is present
        const refreshed = await refreshAuthToken();
        
        if (!refreshed) {
          setAuthState({
            user: null,
            isLoading: false,
            error: null,
            isAuthenticated: false,
            permissions: []
          });
          
          // Redirect to login page
          window.location.href = '/authenticate?type=LOGIN&utm_source=direct';
          return;
        }
      }
      
      // Fetch user profile
      await fetchUserProfile();
    };
    
    checkAuth();
  }, []);

  return {
    ...authState,
    refreshProfile: fetchUserProfile
  };
}

export default useAuth;