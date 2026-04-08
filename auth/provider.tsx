'use client';

import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { PublicUser } from '@/lib/local-auth/types';

interface AuthProviderProps {
  children: ReactNode;
}

interface UserAuthState {
  user: PublicUser | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface AuthContextState {
  areServicesAvailable: boolean;
  auth: null;
  session: { user: PublicUser } | null;
  user: PublicUser | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface AuthServicesAndUser {
  auth: null;
  session: { user: PublicUser } | null;
  user: PublicUser | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface UserHookResult {
  user: PublicUser | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export const AuthContext = createContext<AuthContextState | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true,
    userError: null,
  });

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          cache: 'no-store',
          credentials: 'include',
        });

        if (!isMounted) {
          return;
        }

        if (!response.ok) {
          setUserAuthState({
            user: null,
            isUserLoading: false,
            userError: null,
          });
          return;
        }

        const { user } = (await response.json()) as { user: PublicUser | null };

        setUserAuthState({
          user,
          isUserLoading: false,
          userError: null,
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setUserAuthState({
          user: null,
          isUserLoading: false,
          userError: error instanceof Error ? error : new Error('Failed to load session.'),
        });
      }
    };

    void loadSession();

    const handleAuthChange = () => {
      setUserAuthState(current => ({
        ...current,
        isUserLoading: true,
      }));
      void loadSession();
    };

    window.addEventListener('traction-auth-changed', handleAuthChange);

    return () => {
      isMounted = false;
      window.removeEventListener('traction-auth-changed', handleAuthChange);
    };
  }, []);

  const contextValue = useMemo(
    (): AuthContextState => ({
      areServicesAvailable: true,
      auth: null,
      session: userAuthState.user ? { user: userAuthState.user } : null,
      user: userAuthState.user,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
    }),
    [userAuthState]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuthState = (): AuthServicesAndUser => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuthState must be used within an AuthProvider.');
  }

  return {
    auth: context.auth,
    session: context.session,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
  };
};

export const useAuth = (): null => {
  return null;
};

export const useUser = (): UserHookResult => {
  const { user, isUserLoading, userError } = useAuthState();
  return { user, isUserLoading, userError };
};
