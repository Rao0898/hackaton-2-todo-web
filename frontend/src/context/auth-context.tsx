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
            // FIX 1: Localhost fallback removed, added Render URL
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://todo-web-app-i8sh.onrender.com'}/api/tasks/`, {
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
              logout(); // Use centralized logout
            }
          } catch (networkError) {
            console.error('Network error during token validation:', networkError);
            // Don't clear storage on network error, just stop loading
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const getToken = () => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem('access_token');
    } catch (error) {
      console.error('Error getting token from localStorage:', error);
      return null;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    if (typeof window === 'undefined') return false;

    try {
      console.log('Attempting login with email:', email);
      const data = await authAPI.login(email, password);
      console.log('Login Response Data:', data);

      if (data.user) {
        setIsAuthenticated(true);
        setUser(data.user);

        localStorage.setItem('access_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // FIX 2: Increased expiry to 7 days instead of 15 mins
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 7);

        // FIX 3: SameSite=Lax and window.location.replace
        document.cookie = `auth-token=${data.token}; path=/; expires=${expiry.toUTCString()}; SameSite=Lax;`;

        window.location.replace('/home');
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
    if (typeof window === 'undefined') return false;

    try {
      const data = await authAPI.signup(email, password, name);
      console.log('Signup Response Data:', data);

      if (data.user) {
        setIsAuthenticated(true);
        setUser(data.user);

        localStorage.setItem('access_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // FIX 2 & 3: Match the 7-day Lax logic
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 7);
        document.cookie = `auth-token=${data.token}; path=/; expires=${expiry.toUTCString()}; SameSite=Lax;`;

        window.location.replace('/home');
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
    if (typeof window === 'undefined') return;

    setIsAuthenticated(false);
    setUser(null);
    localStorage.clear();
    document.cookie = `auth-token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
    window.location.replace('/login');
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