"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchApi, setAccessToken } from '../lib/api-client';

export interface User {
  id: string;
  name: string;
  email: string;
  roles: { role: { name: string } }[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (access_token: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roleName: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  hasRole: () => false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await fetchApi('/api/v1/auth/me');
      if (res && res.data) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
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
    await fetchUser();
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

  const hasRole = (roleName: string) => {
    if (!user || !user.roles) return false;
    return user.roles.some((r) => r.role.name === roleName);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
