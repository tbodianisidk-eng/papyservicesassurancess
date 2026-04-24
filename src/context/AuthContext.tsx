import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '@/services/apiClient';

export type UserRole = 'admin' | 'prestataire' | 'client';

export interface AuthUser {
  id: string;
  email: string;
  role?: UserRole;
  full_name?: string;
  fullName?: string;
  organization?: string;
  created_at?: string;
  updated_at?: string;
  photo?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signUp: (email: string, password: string, role: UserRole, fullName: string, organization?: string, telephone?: string, adresse?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updatePhoto: (photo: string) => void;
  isAuthenticated: boolean;
  getActiveSessions: () => SessionEntry[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PHOTO_KEY   = (id: string) => `user_photo_${id}`;
const PROFILE_KEY = (id: string) => `user_profile_${id}`;
const SESSIONS_KEY = 'active_sessions';

export interface SessionEntry {
  userId:       string;
  name:         string;
  role:         string;
  email:        string;
  loginTime:    string;
  lastActivity: string;
}

function getSessions(): SessionEntry[] {
  try { return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]'); } catch { return []; }
}
function saveSessions(sessions: SessionEntry[]) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}
export function updateSessionActivity(userId: string) {
  const sessions = getSessions();
  const idx = sessions.findIndex(s => s.userId === userId);
  if (idx !== -1) {
    sessions[idx].lastActivity = new Date().toISOString();
    saveSessions(sessions);
  }
}
function addSession(user: AuthUser) {
  const sessions = getSessions().filter(s => s.userId !== user.id);
  const profile = user.id ? (() => { try { return JSON.parse(localStorage.getItem(PROFILE_KEY(user.id)) || 'null'); } catch { return null; } })() : null;
  const name = profile ? `${profile.prenom} ${profile.nom}`.trim() : (user.full_name || user.email || 'Utilisateur');
  sessions.push({ userId: user.id, name, role: user.role || 'client', email: user.email, loginTime: new Date().toISOString(), lastActivity: new Date().toISOString() });
  saveSessions(sessions);
}
function removeSession(userId: string) {
  saveSessions(getSessions().filter(s => s.userId !== userId));
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handler = () => {
      setUser(null);
      sessionStorage.removeItem('auth_token');
    };
    window.addEventListener('auth:expired', handler);
    return () => window.removeEventListener('auth:expired', handler);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = sessionStorage.getItem('auth_token');
        if (!token) return;

        const userData = await apiClient.getCurrentUser();
        const uid = String(userData.id);
        setUser({
          id: uid,
          email: userData.email,
          role: userData.role?.toLowerCase() as UserRole,
          full_name: userData.fullName,
          fullName: userData.fullName,
          organization: userData.organization,
          photo: localStorage.getItem(PHOTO_KEY(uid)) ?? undefined,
        });
      } catch {
        sessionStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await apiClient.login({ email, password });
    sessionStorage.setItem('auth_token', response.token);
    const uid = String(response.user.id);
    const authUser: AuthUser = {
      id: uid,
      email: response.user.email,
      role: response.user.role?.toLowerCase() as UserRole,
      full_name: response.user.fullName,
      fullName: response.user.fullName,
      organization: response.user.organization,
      photo: localStorage.getItem(PHOTO_KEY(uid)) ?? undefined,
    };
    setUser(authUser);
    addSession(authUser);
  };

  const updatePhoto = (photo: string) => {
    setUser(prev => {
      if (!prev) return prev;
      localStorage.setItem(PHOTO_KEY(prev.id), photo);
      return { ...prev, photo };
    });
  };

  const signUp = async (email: string, password: string, role: UserRole, fullName: string, organization?: string, telephone?: string, adresse?: string) => {
    const response = await apiClient.register({
      email, password, fullName,
      role: role.toUpperCase(),
      organization,
      telephone,
      adresse,
    });

    if (!response.token) {
      // Compte créé mais en attente de validation admin — pas de session ouverte
      throw new Error('PENDING_APPROVAL');
    }

    sessionStorage.setItem('auth_token', response.token);
    const uid2 = String(response.user.id);
    setUser({
      id: uid2,
      email: response.user.email,
      role: response.user.role?.toLowerCase() as UserRole,
      full_name: response.user.fullName,
      fullName: response.user.fullName,
      organization: response.user.organization,
      photo: localStorage.getItem(PHOTO_KEY(uid2)) ?? undefined,
    });
  };

  const signOut = async () => {
    if (user?.id) removeSession(user.id);
    sessionStorage.removeItem('auth_token');
    setUser(null);
    apiClient.logout().catch(() => {});
  };

  const value: AuthContextType = { user, loading, signUp, signIn, signOut, updatePhoto, isAuthenticated: !!user, getActiveSessions: getSessions };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
