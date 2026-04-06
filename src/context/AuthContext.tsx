import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '@/services/apiClient';
import { emailService } from '@/services/emailService';

export type UserRole = 'admin' | 'prestataire' | 'client';

export interface AuthUser {
  id: string;
  email: string;
  role?: UserRole;
  full_name?: string;
  organization?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signUp: (email: string, password: string, role: UserRole, fullName: string, organization?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

// Comptes administrateurs fixes
const ADMIN_ACCOUNTS: Record<string, { id: string; email: string; role: UserRole; full_name: string }> = {
  'admin@assurance.com':    { id: '1', email: 'admin@assurance.com',    role: 'admin',       full_name: 'Administrateur' },
  'prestataire@assurance.com': { id: '2', email: 'prestataire@assurance.com', role: 'prestataire', full_name: 'Prestataire Demo' },
  'client@assurance.com':   { id: '3', email: 'client@assurance.com',   role: 'client',      full_name: 'Client Demo' },
  'bodianm372@gmail.com':   { id: '4', email: 'bodianm372@gmail.com',   role: 'admin',       full_name: 'Administrateur Bodian' },
  'bassniang7@yahoo.fr':    { id: '5', email: 'bassniang7@yahoo.fr',    role: 'admin',       full_name: 'Administrateur Bassniang' },
};

const ADMIN_PASSWORDS: Record<string, string[]> = {
  'admin@assurance.com':       ['admin123'],
  'prestataire@assurance.com': ['admin123'],
  'client@assurance.com':      ['admin123'],
  'bodianm372@gmail.com':      ['Admin1'],
  'bassniang7@yahoo.fr':       ['Admin1'],
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        // Token local (mode sans backend)
        if (token.startsWith('local-token-')) {
          const userId = token.replace('local-token-', '');
          // Chercher dans les comptes fixes
          const fixedUser = Object.values(ADMIN_ACCOUNTS).find(u => u.id === userId);
          if (fixedUser) { setUser(fixedUser); return; }
          // Chercher dans les comptes enregistrés
          const saved: any[] = JSON.parse(localStorage.getItem('registered_users') || '[]');
          const found = saved.find((u: any) => u.id === userId);
          if (found) { const { password, ...u } = found; setUser(u); }
          return;
        }

        // Token backend JWT
        const response = await apiClient.getCurrentUser();
        setUser(response.user);
      } catch {
        localStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    // 1. Essayer le backend en premier
    try {
      const response = await apiClient.login({ email, password });
      localStorage.setItem('auth_token', response.token);
      setUser(response.user);
      return;
    } catch (backendError: any) {
      // Si le backend est indisponible (réseau), on tente le fallback local
      // Si c'est une erreur d'authentification (401), on rejette directement
      const isNetworkError = backendError.message?.includes('fetch') ||
        backendError.message?.includes('timeout') ||
        backendError.message?.includes('network') ||
        backendError.message?.includes('Failed to fetch');

      if (!isNetworkError) {
        throw new Error('Email ou mot de passe incorrect');
      }
    }

    // 2. Fallback local si backend indisponible
    const fixedUser = ADMIN_ACCOUNTS[email];
    const allowedPasswords = ADMIN_PASSWORDS[email] || [];
    if (fixedUser && allowedPasswords.includes(password)) {
      localStorage.setItem('auth_token', `local-token-${fixedUser.id}`);
      setUser(fixedUser);
      return;
    }

    const saved: any[] = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const found = saved.find((u: any) => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...userWithoutPassword } = found;
      localStorage.setItem('auth_token', `local-token-${found.id}`);
      setUser(userWithoutPassword);
      return;
    }

    throw new Error('Email ou mot de passe incorrect');
  };

  const signUp = async (email: string, password: string, role: UserRole, fullName: string, organization?: string) => {
    // Vérifier si email déjà utilisé
    if (ADMIN_ACCOUNTS[email]) throw new Error('Cet email est déjà utilisé');
    const saved: any[] = JSON.parse(localStorage.getItem('registered_users') || '[]');
    if (saved.find((u: any) => u.email === email)) throw new Error('Cet email est déjà utilisé');

    const newUser = {
      id: Date.now().toString(),
      email, password, role,
      full_name: fullName,
      organization: organization || '',
      created_at: new Date().toISOString(),
    };
    saved.push(newUser);
    localStorage.setItem('registered_users', JSON.stringify(saved));

    const { password: _, ...userWithoutPassword } = newUser;
    localStorage.setItem('auth_token', `local-token-${newUser.id}`);
    setUser(userWithoutPassword);

    await emailService.notifyAdminNewRegistration(email, fullName, role, organization).catch(() => {});
  };

  const signOut = async () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    apiClient.logout().catch(() => {});
  };

  const value: AuthContextType = { user, loading, signUp, signIn, signOut, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
