import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebase/config';
import { UserProfile } from '../types/rpg';
import {
  signUpUser,
  loginUser,
  logoutUser,
  subscribeToUserProfile,
  parseAuthError,
} from '../services/authService';
import { getGuestProfile, GUEST_EVENT_NAME } from '../services/localRpgStore';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  isGuest: boolean;
  enterAsGuest: () => void;
  exitGuestMode: () => void;
  signUp: (name: string, email: string, pass: string) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_STORAGE_FLAG = 'life_rpg_guest_active';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    try {
      return localStorage.getItem(GUEST_STORAGE_FLAG) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isGuest && !user) {
      const mockUser = {
        uid: 'guest-hero',
        email: 'guest@realm.local',
        displayName: 'Guest Hero',
      } as unknown as FirebaseUser;
      setUser(mockUser);
      setProfile(getGuestProfile());
      setLoading(false);

      const guestListener = () => {
        setProfile(getGuestProfile());
      };
      window.addEventListener(GUEST_EVENT_NAME, guestListener);
      return () => {
        window.removeEventListener(GUEST_EVENT_NAME, guestListener);
      };
    }
  }, [isGuest, user]);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setIsGuest(false);
        try {
          localStorage.removeItem(GUEST_STORAGE_FLAG);
        } catch {
          // ignore
        }
        setUser(currentUser);

        // Subscribe to real-time updates for user profile
        unsubscribeProfile = subscribeToUserProfile(
          currentUser.uid,
          (prof) => {
            setProfile(prof);
            setLoading(false);
          },
          (err) => {
            console.error('Profile sync error:', err);
            setLoading(false);
          }
        );
      } else {
        if (!isGuest) {
          if (unsubscribeProfile) {
            unsubscribeProfile();
            unsubscribeProfile = null;
          }
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, [isGuest]);

  const enterAsGuest = () => {
    try {
      localStorage.setItem(GUEST_STORAGE_FLAG, 'true');
    } catch {
      // ignore
    }
    setIsGuest(true);
    const mockUser = {
      uid: 'guest-hero',
      email: 'guest@realm.local',
      displayName: 'Guest Hero',
    } as unknown as FirebaseUser;
    setUser(mockUser);
    setProfile(getGuestProfile());
    setLoading(false);
  };

  const exitGuestMode = () => {
    try {
      localStorage.removeItem(GUEST_STORAGE_FLAG);
    } catch {
      // ignore
    }
    setIsGuest(false);
    setUser(null);
    setProfile(null);
  };

  const signUp = async (name: string, email: string, pass: string) => {
    try {
      setAuthError(null);
      setLoading(true);
      const newProfile = await signUpUser(name, email, pass);
      setIsGuest(false);
      try {
        localStorage.removeItem(GUEST_STORAGE_FLAG);
      } catch {
        // ignore
      }
      setProfile(newProfile);
    } catch (err: unknown) {
      const msg = parseAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      setAuthError(null);
      setLoading(true);
      const userProf = await loginUser(email, pass);
      setIsGuest(false);
      try {
        localStorage.removeItem(GUEST_STORAGE_FLAG);
      } catch {
        // ignore
      }
      setProfile(userProf);
    } catch (err: unknown) {
      const msg = parseAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setAuthError(null);
      if (isGuest) {
        exitGuestMode();
        return;
      }
      await logoutUser();
      setUser(null);
      setProfile(null);
    } catch (err: unknown) {
      const msg = parseAuthError(err);
      setAuthError(msg);
    }
  };

  const clearError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        authError,
        isGuest,
        enterAsGuest,
        exitGuestMode,
        signUp,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
