import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  authProvider: 'local' | 'google';
  hasPassword?: boolean;
  plan?: 'free' | 'researcher' | 'organization';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (data: { name?: string; email?: string; avatar?: string }) => Promise<void>;
  updatePassword: (currentPassword: string | undefined, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check for OAuth callback success/error on mount
    const params = new URLSearchParams(window.location.search);
    const loginSuccess = params.get('login');
    const authError = params.get('error');

    if (authError) {
      console.error('OAuth error:', authError);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (loginSuccess === 'success') {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Login failed');
    setUser(data.user);
  };

  const signup = async (name: string, email: string, password: string) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Signup failed');
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
  };

  const updateProfile = async (data: { name?: string; email?: string; avatar?: string }) => {
    const response = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.message || 'Update failed');
    setUser(result.user);
  };

  const updatePassword = async (currentPassword: string | undefined, newPassword: string) => {
    const response = await fetch('/api/auth/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.message || 'Password update failed');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, checkAuth, updateProfile, updatePassword }}>
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
