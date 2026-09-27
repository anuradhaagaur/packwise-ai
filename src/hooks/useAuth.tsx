import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile, UserRole } from '../types/database';

export interface UserSession {
  id: string;
  email: string;
  fullName?: string;
  role: UserRole;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password?: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  toggleAdminRole: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'packwise.auth.user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. If Supabase is configured, listen to real session
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const u: UserSession = {
            id: session.user.id,
            email: session.user.email || '',
            fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            role: session.user.user_metadata?.role || 'user',
          };
          setUser(u);
        } else {
          checkLocalUser();
        }
        setLoading(false);
      });

      const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const u: UserSession = {
            id: session.user.id,
            email: session.user.email || '',
            fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            role: session.user.user_metadata?.role || 'user',
          };
          setUser(u);
        } else {
          checkLocalUser();
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    } else {
      checkLocalUser();
      setLoading(false);
    }
  }, []);

  const checkLocalUser = () => {
    try {
      const stored = localStorage.getItem(LOCAL_USER_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // Default guest user profile for immediate seamless exploration
        const defaultUser: UserSession = {
          id: 'guest-foodtech-dev',
          email: 'lab.researcher@packwise.ai',
          fullName: 'Food Packaging Researcher',
          role: 'user',
        };
        setUser(defaultUser);
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(defaultUser));
      }
    } catch {
      setUser(null);
    }
  };

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured && supabase && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) return { success: false, error: error.message };
        if (data.user) {
          const u: UserSession = {
            id: data.user.id,
            email: data.user.email || email,
            fullName: data.user.user_metadata?.full_name || email.split('@')[0],
            role: data.user.user_metadata?.role || 'user',
          };
          setUser(u);
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(u));
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Login failed' };
      }
    }

    // Local / Demo login
    const u: UserSession = {
      id: `usr-${Date.now()}`,
      email,
      fullName: email.split('@')[0].replace('.', ' ').toUpperCase(),
      role: email.toLowerCase().includes('admin') ? 'admin' : 'user',
    };
    setUser(u);
    try {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(u));
    } catch {}
    return { success: true };
  };

  const signup = async (email: string, password?: string, fullName?: string): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured && supabase && password) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: 'user',
            },
          },
        });
        if (error) return { success: false, error: error.message };
        if (data.user) {
          const u: UserSession = {
            id: data.user.id,
            email: data.user.email || email,
            fullName: fullName || email.split('@')[0],
            role: 'user',
          };
          setUser(u);
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(u));
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Signup failed' };
      }
    }

    const u: UserSession = {
      id: `usr-${Date.now()}`,
      email,
      fullName: fullName || email.split('@')[0],
      role: 'user',
    };
    setUser(u);
    try {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(u));
    } catch {}
    return { success: true };
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    setUser(null);
    try {
      localStorage.removeItem(LOCAL_USER_KEY);
    } catch {}
  };

  const toggleAdminRole = () => {
    if (!user) return;
    const newRole: UserRole = user.role === 'admin' ? 'user' : 'admin';
    const updated: UserSession = { ...user, role: newRole };
    setUser(updated);
    try {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));
    } catch {}
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, login, signup, logout, toggleAdminRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
