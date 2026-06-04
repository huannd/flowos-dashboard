'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi, userApi } from './api';

interface User {
  id: string;
  email: string;
  fullName: string | null;
  systemRole: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('flowos_token');
    const savedUser = localStorage.getItem('flowos_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('flowos_token', res.accessToken);
    localStorage.setItem('flowos_user', JSON.stringify(res.user));
    setToken(res.accessToken);
    setUser(res.user);
  }, []);

  const register = useCallback(async (email: string, password: string, fullName?: string) => {
    const res = await authApi.register({ email, password, fullName });
    localStorage.setItem('flowos_token', res.accessToken);
    localStorage.setItem('flowos_user', JSON.stringify(res.user));
    setToken(res.accessToken);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('flowos_token');
    localStorage.removeItem('flowos_user');
    setToken(null);
    setUser(null);
    window.location.href = '/auth/login';
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await userApi.getProfile();
      setUser(profile);
      localStorage.setItem('flowos_user', JSON.stringify(profile));
    } catch { /* ignore */ }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
