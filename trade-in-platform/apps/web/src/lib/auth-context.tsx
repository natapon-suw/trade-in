'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { AuthUser } from './auth-types';
import {
  login as apiLogin,
  getToken,
  removeToken,
  setToken,
} from './api';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  // On mount, restore user from localStorage if a token exists
  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const stored = localStorage.getItem('trade_in_user');
        if (stored) {
          setUser(JSON.parse(stored) as AuthUser);
        }
      } catch {
        // corrupted data — clear it
        removeToken();
        localStorage.removeItem('trade_in_user');
      }
    }
    setLoaded(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    setToken(res.accessToken);
    localStorage.setItem('trade_in_user', JSON.stringify(res.user));
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    removeToken();
    localStorage.removeItem('trade_in_user');
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      login,
      logout,
    }),
    [user, login, logout],
  );

  // Don't render children until we've checked localStorage
  if (!loaded) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
