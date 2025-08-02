'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import useAuth from '@/lib/hooks/useAuth';

// Define the shape of the authentication context
interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  permissions: string[];
  refreshProfile: () => Promise<any | null>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component that wraps the app and makes auth object available to any child component
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook for components to get the auth object and re-render when it changes
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
};