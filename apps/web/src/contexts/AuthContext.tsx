"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchApi, setAccessToken } from '../lib/api-client';

export type RoleName = 'AUTHOR' | 'REVIEWER' | 'EDITOR' | 'ADMIN';

export const getDefaultDashboardUrl = (roles?: RoleName[]): string => {
  if (!roles || roles.length === 0) return '/login';
  // Return highest privilege dashboard
  if (roles.includes('ADMIN')) return '/dashboard/admin';
  if (roles.includes('EDITOR')) return '/dashboard/editor';
  if (roles.includes('REVIEWER')) return '/dashboard/reviewer';
  if (roles.includes('AUTHOR')) return '/dashboard/author';
  return '/dashboard/author';
};
export interface User {
  id: string;
  name: string;
  email: string;
  roles: RoleName[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (access_token: string) => Promise<User | null>;
  logout: () => Promise<void>;
  hasRole: (roleName: RoleName) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => null,
  logout: async () => {},
  hasRole: () => false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async (): Promise<User | null> => {
    try {
      const res = await fetchApi('/api/v1/auth/me');
      if (res && res.data) {
        setUser(res.data);
        return res.data;
      } else {
        setUser(null);
        return null;
      }
    } catch (err) {
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Attempt to fetch user on mount (relies on refresh token if access token is null)
    // We will trigger a dummy request to /auth/me. If we have a refresh cookie, api-client will refresh and retry.
    fetchUser();
  }, []);

  const login = async (access_token: string) => {
    setAccessToken(access_token);
    setIsLoading(true);
    return await fetchUser();
  };

  const logout = async () => {
    try {
      await fetchApi('/api/v1/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore errors on logout
    } finally {
      setAccessToken(null);
      setUser(null);
      window.location.href = '/login';
    }
  };

  const hasRole = (roleName: RoleName) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(roleName);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
