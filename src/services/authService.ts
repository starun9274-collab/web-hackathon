import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { UserProfile } from '../types/rpg';

export function parseAuthError(error: unknown): string {
  if (!error || typeof error !== 'object') return 'An unexpected error occurred. Please try again.';
  const code = (error as { code?: string }).code || '';

  switch (code) {
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not enabled in your Firebase Console. Please enable it under Authentication > Sign-in method > Email/Password.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for OAuth operations in your Firebase project.';
    case 'auth/admin-restricted-operation':
      return 'This operation is restricted by administrator policies.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please log in.';
    case 'auth/invalid-email':
      return 'The email address format is invalid.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please try again.';
    case 'auth/network-request-failed':
      return 'Network connection failed. Please verify your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Please try again later.';
    default:
      return (error as { message?: string }).message || 'Authentication failed. Please check your credentials.';
  }
}

/**
 * Register a new user and initialize their RPG profile in Firestore.
 */
export async function signUpUser(name: string, email: string, password: string): Promise<UserProfile> {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();

  if (!trimmedName) {
    throw new Error('Please enter your adventurer name.');
  }
  if (!trimmedEmail) {
    throw new Error('Please provide a valid email address.');
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
  const user = cred.user;

  // Set display name in Auth
  await updateProfile(user, { displayName: trimmedName });

  // Initial user RPG data
  const initialProfile: UserProfile = {
    id: user.uid,
    name: trimmedName,
    email: trimmedEmail,
    level: 1,
    totalXP: 0,
    currentXP: 0,
    coins: 0,
    streak: 0,
    lastActivityDate: null,
    attributes: {
      intellect: 10,
      strength: 10,
      discipline: 10,
      creativity: 10,
    },
    createdAt: new Date().toISOString(),
    equippedTheme: 'default',
    equippedBadge: '',
    equippedAccessory: '',
  };

  const userDocRef = doc(db, 'users', user.uid);
  await setDoc(userDocRef, initialProfile);

  return initialProfile;
}

/**
 * Sign in existing user and ensure profile doc exists.
 */
export async function loginUser(email: string, password: string): Promise<UserProfile> {
  const trimmedEmail = email.trim();
  if (!trimmedEmail) throw new Error('Please enter your email.');
  if (!password) throw new Error('Please enter your password.');

  const cred = await signInWithEmailAndPassword(auth, trimmedEmail, password);
  const user = cred.user;

  const userDocRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userDocRef);

  if (snap.exists()) {
    return { id: user.uid, ...snap.data() } as UserProfile;
  }

  // Fallback profile if user was created without doc
  const fallbackProfile: UserProfile = {
    id: user.uid,
    name: user.displayName || trimmedEmail.split('@')[0] || 'Adventurer',
    email: trimmedEmail,
    level: 1,
    totalXP: 0,
    currentXP: 0,
    coins: 0,
    streak: 0,
    lastActivityDate: null,
    attributes: {
      intellect: 10,
      strength: 10,
      discipline: 10,
      creativity: 10,
    },
    createdAt: new Date().toISOString(),
  };

  await setDoc(userDocRef, fallbackProfile);
  return fallbackProfile;
}

/**
 * Log out current user
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Real-time subscription to user RPG profile
 */
export function subscribeToUserProfile(
  userId: string,
  onProfile: (profile: UserProfile | null) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const userDocRef = doc(db, 'users', userId);
  return onSnapshot(
    userDocRef,
    (snap) => {
      if (snap.exists()) {
        onProfile({ id: snap.id, ...snap.data() } as UserProfile);
      } else {
        onProfile(null);
      }
    },
    (err) => {
      console.error('Failed to subscribe to user profile:', err);
      if (onError) onError(err);
    }
  );
}
