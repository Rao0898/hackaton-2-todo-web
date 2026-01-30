'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { authAPI } from '@/lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { email: string; name?: string } | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [user, setUser] = useState<{ email: string; name?: string } | null>(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      try {
        return storedUser ? JSON.parse(storedUser) : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on initial load
  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          try {
            const response = await fetch('http://127.0.0.1:8000/api/tasks/', {
              headers: {
                'Authorization': `Bearer ${storedToken}`,
              },
            });

            if (response.ok) {
              setIsAuthenticated(true);
              try {
                setUser(JSON.parse(storedUser));
              } catch (parseError) {
                console.error('Error parsing stored user:', parseError);
                localStorage.removeItem('user');
              }
            } else if (response.status === 401) {
              console.log('Token validation failed - clearing session');
              localStorage.clear();
              document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              setIsAuthenticated(false);
              setUser(null);
              window.location.href = '/login';
            }
          } catch (networkError) {
            console.error('Network error during token validation:', networkError);
            localStorage.clear();
            document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            setIsAuthenticated(false);
            setUser(null);
            window.location.href = '/login';
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.clear();
        document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const getToken = () => {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      return localStorage.getItem('access_token');
    } catch (error) {
      console.error('Error getting token from localStorage:', error);
      return null;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    if (typeof window === 'undefined') {
      console.error('Login can only be performed on the client side');
      return false;
    }

    try {
      console.log('Attempting login with email:', email);
      const data = await authAPI.login(email, password);
      console.log('Login Response Data:', data);

      // Extract user object from response and set authentication state
      if (data.user) {
        setIsAuthenticated(true);
        setUser(data.user);

        // Store authentication state
        localStorage.setItem('access_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Set a cookie for the middleware to read
        document.cookie = `auth-token=${data.token}; path=/; SameSite=Lax`;

        window.location.href = '/dashboard';
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    if (typeof window === 'undefined') {
      console.error('Signup can only be performed on the client side');
      return false;
    }

    try {
      const data = await authAPI.signup(email, password, name);
      console.log('Signup Response Data:', data);

      // Extract user object from response and set authentication state
      if (data.user) {
        setIsAuthenticated(true);
        setUser(data.user);

        // Store authentication state
        localStorage.setItem('access_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Set a cookie for the middleware to read
        document.cookie = `auth-token=${data.token}; path=/; SameSite=Lax`;

        window.location.href = '/dashboard';
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    if (typeof window === 'undefined') {
      console.error('Logout can only be performed on the client side');
      return;
    }

    setIsAuthenticated(false);
    setUser(null);

    // Clear all localStorage
    localStorage.clear();

    // Remove all auth-related cookies
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
    }

    // Navigate to login page
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, logout, signup, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}