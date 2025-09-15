'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@/types';
import { API_ROUTES } from '@/config/apiConfig';
import httpClient from '@/config/httpClient';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  userLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

// Fetch user profile from the API
export const getUserProfile = async (): Promise<User> => {
  try {
    const response = await httpClient.get(API_ROUTES.USER_PROFILE);
    return response.data;
  } catch {
    throw new Error('Failed to fetch user profile');
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(false);

  const fetchUser = async () => {
    try {
      setUserLoading(true);
      const userData = await getUserProfile();
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setUser(null);
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is authenticated on mount
    const token = localStorage.getItem('token');
    const authenticated = !!token;
    setIsAuthenticated(authenticated);
    setIsLoading(false);

    // Fetch user profile if authenticated
    if (authenticated) {
      fetchUser();
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    fetchUser();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        userLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
