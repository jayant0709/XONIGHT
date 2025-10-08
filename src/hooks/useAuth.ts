import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

interface User {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  ok: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Check for token in AsyncStorage first
      const token = await AsyncStorage.getItem('auth-token');
      
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Verify token with backend
      const response = await api.get('/api/auth/verify');
      const data: AuthResponse = response.data;

      if (data.ok && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        // Token is invalid, clear it
        await AsyncStorage.removeItem('auth-token');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await AsyncStorage.removeItem('auth-token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (usernameOrEmail: string, password: string) => {
    try {
      const response = await api.post('/api/auth/login', {
        usernameOrEmail,
        password,
      });

      const data: AuthResponse = response.data;

      if (data.ok && data.user && data.token) {
        // Store token in AsyncStorage
        await AsyncStorage.setItem('auth-token', data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || 'Network error. Please try again.';
      return { success: false, error: errorMessage };
    }
  }, []);

  const signup = useCallback(async (username: string, email: string, password: string) => {
    try {
      const response = await api.post('/api/auth/signup', {
        username,
        email,
        password,
        confirmPassword: password,
      });

      const data: AuthResponse = response.data;

      if (data.ok) {
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Signup failed' };
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      const errorMessage = error.response?.data?.error || 'Network error. Please try again.';
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call logout API to clear server-side cookies
      await api.post('/api/auth/logout');

      // Clear client-side token
      await AsyncStorage.removeItem('auth-token');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local state
      await AsyncStorage.removeItem('auth-token');
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  return { 
    user, 
    isLoading, 
    isAuthenticated, 
    login, 
    signup, 
    logout,
    checkAuth
  };
}