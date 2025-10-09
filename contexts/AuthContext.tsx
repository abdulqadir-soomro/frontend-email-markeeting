'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/lib/api-client';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  googleAuth: (googleId: string, email: string, name: string, avatar?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authAPI.getMe();
          if (response.success) {
            setUser(response.data);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);

      if (response.success) {
        const { user: userData, token } = response.data;
        localStorage.setItem('token', token);
        setUser(userData);
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await authAPI.register(email, password, name);

      if (response.success) {
        const { user: userData, token } = response.data;
        localStorage.setItem('token', token);
        setUser(userData);
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  const googleAuth = async (googleId: string, email: string, name: string, avatar?: string) => {
    try {
      const response = await authAPI.googleAuth(googleId, email, name, avatar);

      if (response.success) {
        const { user: userData, token } = response.data;
        localStorage.setItem('token', token);
        setUser(userData);
      } else {
        throw new Error(response.error || 'Google authentication failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Google authentication failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    googleAuth,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
