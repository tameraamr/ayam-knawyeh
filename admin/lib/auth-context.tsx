'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminUser } from '@/lib/types';

interface AuthContextType {
  token: string | null;
  admin: AdminUser | null;
  login: (token: string, admin: AdminUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  token: null, admin: null,
  login: () => {}, logout: () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('admin_token');
    const storedAdmin = localStorage.getItem('admin_user');
    if (storedToken && storedAdmin) {
      setToken(storedToken);
      setAdmin(JSON.parse(storedAdmin));
    }
  }, []);

  const login = (newToken: string, newAdmin: AdminUser) => {
    setToken(newToken);
    setAdmin(newAdmin);
    localStorage.setItem('admin_token', newToken);
    localStorage.setItem('admin_user', JSON.stringify(newAdmin));
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  };

  return (
    <AuthContext.Provider value={{ token, admin, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
