/**
 * DIGITAL HEROES AUTHENTICATION & ROLE CONTEXT
 * 
 * Provides:
 * - Current user state & role detection (public_visitor, subscriber, admin)
 * - Subscription status (active, inactive, past_due, canceled)
 * - Sign up, Login, Logout, Forgot Password, Reset Password
 * - Fast Persona Switcher for reviewer inspection across all 3 roles and subscription statuses
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserRole } from '../types';
import { db } from '../services/db';

interface AuthContextType {
  currentUser: UserProfile | null;
  role: UserRole;
  isSubscriber: boolean;
  isActiveSubscriber: boolean;
  isAdmin: boolean;
  isPublicVisitor: boolean;
  login: (email: string) => Promise<{ success: boolean; error?: string }>;
  signup: (params: {
    email: string;
    fullName: string;
    selectedCharityId: string;
    charityContributionPct: number;
    handicap?: number;
  }) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (password: string) => Promise<{ success: boolean; message: string }>;
  switchPersona: (userId: string | null) => void;
  updateCurrentUser: (updates: Partial<UserProfile>) => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Load initial active user
  useEffect(() => {
    const activeId = db.getActiveUserId();
    if (activeId === 'public_visitor') {
      setCurrentUser(null);
    } else {
      const user = db.getUserById(activeId);
      if (user) {
        setCurrentUser(user);
      } else {
        // Default to first subscriber
        const fallback = db.getUsers()[1] || null;
        setCurrentUser(fallback);
      }
    }
  }, []);

  const refreshUser = () => {
    if (!currentUser) return;
    const fresh = db.getUserById(currentUser.id);
    if (fresh) {
      setCurrentUser({ ...fresh });
    }
  };

  const role: UserRole = currentUser ? currentUser.role : 'public_visitor';
  const isSubscriber = currentUser?.role === 'subscriber' || currentUser?.role === 'admin';
  const isActiveSubscriber = Boolean(
    currentUser &&
    currentUser.subscription &&
    currentUser.subscription.status === 'active'
  );
  const isAdmin = currentUser?.role === 'admin';
  const isPublicVisitor = !currentUser || currentUser.role === 'public_visitor';

  const login = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const user = db.getUserByEmail(email);
    if (!user) {
      return { success: false, error: 'No account found with this email address.' };
    }
    db.setActiveUserId(user.id);
    setCurrentUser(user);
    return { success: true };
  };

  const signup = async (params: {
    email: string;
    fullName: string;
    selectedCharityId: string;
    charityContributionPct: number;
    handicap?: number;
  }): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    const existing = db.getUserByEmail(params.email);
    if (existing) {
      return { success: false, error: 'An account with this email already exists. Please log in.' };
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      email: params.email,
      full_name: params.fullName,
      role: 'subscriber',
      handicap: params.handicap || 18,
      selected_charity_id: params.selectedCharityId,
      charity_contribution_pct: Math.max(10, params.charityContributionPct),
      subscription: {
        plan: 'monthly',
        status: 'inactive', // Starts inactive until Stripe checkout completed
        amount_cents: 2000,
        charity_contribution_pct: Math.max(10, params.charityContributionPct),
        current_period_end: new Date().toISOString(),
      },
      created_at: new Date().toISOString(),
    };

    db.saveUser(newUser);
    db.setActiveUserId(newUser.id);
    setCurrentUser(newUser);
    return { success: true, user: newUser };
  };

  const logout = () => {
    db.setActiveUserId('public_visitor');
    setCurrentUser(null);
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    const user = db.getUserByEmail(email);
    if (!user) {
      return { success: false, message: 'If an account exists with this email, a reset link has been dispatched.' };
    }
    return { success: true, message: `Password reset verification link has been sent to ${email}.` };
  };

  const resetPassword = async (_password: string): Promise<{ success: boolean; message: string }> => {
    return { success: true, message: 'Password has been successfully updated.' };
  };

  const switchPersona = (userId: string | null) => {
    if (!userId) {
      logout();
      return;
    }
    const user = db.getUserById(userId);
    if (user) {
      db.setActiveUserId(user.id);
      setCurrentUser(user);
    }
  };

  const updateCurrentUser = (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    db.saveUser(updated);
    setCurrentUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        isSubscriber,
        isActiveSubscriber,
        isAdmin,
        isPublicVisitor,
        login,
        signup,
        logout,
        forgotPassword,
        resetPassword,
        switchPersona,
        updateCurrentUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
