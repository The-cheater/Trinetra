'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  userId: string;
  name: string;
  email: string;
  credibility_score?: number;
  reports_submitted?: number;
  profilePicture?: string;
  city?: string;
}

interface LoginResponse {
  success: boolean;
  data?: {
    accessToken: string;
    user: User;
  };
  message?: string;
}

interface RefreshResponse {
  success: boolean;
  data?: {
    accessToken: string;
    user: User;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
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
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to decode JWT and check expiration
  const parseJwt = (token: string): { [key: string]: unknown; exp?: number } | null => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return null;
    }
  };

  const isTokenExpired = (token: string): boolean => {
    const decoded = parseJwt(token);
    if (!decoded || !decoded.exp) return true;
    return Date.now() >= decoded.exp * 1000;
  };

  // Refresh token function with proper typing
  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user?.userId })
      });

      if (response.ok) {
        const data: RefreshResponse = await response.json();
        
        if (data.success && data.data) {
          setToken(data.data.accessToken);
          setUser(data.data.user);
          localStorage.setItem('access_token', data.data.accessToken);
          return data.data.accessToken;
        }
      }
      
      // Refresh failed, user needs to login again
      logout();
      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return null;
    }
  };

  // Check session on app load
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      
      const storedToken = localStorage.getItem('access_token');
      
      if (storedToken) {
        if (isTokenExpired(storedToken)) {
          console.log('Token expired, attempting refresh...');
          const newToken = await refreshAccessToken();
          if (newToken) {
            console.log('✅ Token refreshed successfully');
          }
        } else {
          // Token is still valid
          const decodedToken = storedToken ? parseJwt(storedToken) : null;
          const userId = decodedToken?.sub?.toString() ?? '';
          const username = decodedToken?.username?.toString() ?? '';
          const _role = decodedToken?.role?.toString() ?? '';
          setToken(storedToken);
          setUser({
            userId,
            name: username,
            email: '',
            credibility_score: 75,
            reports_submitted: 0
          });
        }
      }
      
      setIsLoading(false);
    };

    checkSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refresh token before expiration
  useEffect(() => {
    if (!token) return;

    const decoded = parseJwt(token);
    if (!decoded || !decoded.exp) return;

    const timeUntilExpiry = (decoded.exp * 1000) - Date.now();
    const refreshTime = Math.max(timeUntilExpiry - 60000, 0); // Refresh 1 minute before expiry

    const refreshTimer = setTimeout(() => {
      console.log('Auto-refreshing token...');
      refreshAccessToken();
    }, refreshTime);

    return () => clearTimeout(refreshTimer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data: LoginResponse = await response.json();

      if (response.ok && data.success && data.data) {
        setToken(data.data.accessToken);
        setUser(data.data.user);
        localStorage.setItem('access_token', data.data.accessToken);
        return true;
      } else {
        console.error('Login failed:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ name, email, password })
      });

      const data: LoginResponse = await response.json();

      if (response.ok && data.success && data.data) {
        setToken(data.data.accessToken);
        setUser(data.data.user);
        localStorage.setItem('access_token', data.data.accessToken);
        return true;
      } else {
        console.error('Registration failed:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('access_token');
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user && !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
