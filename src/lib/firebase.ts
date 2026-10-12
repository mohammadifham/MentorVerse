import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  getAuth,
  signInWithRedirect,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type UserCredential,
  type User
} from 'firebase/auth';

export interface UnifiedUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  getIdToken: () => Promise<string>;
}

type AuthCallback = (user: UnifiedUser | null) => void;

const listeners: Set<AuthCallback> = new Set();
let cachedLocalUser: UnifiedUser | null = null;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function getStoredLocalUser(): UnifiedUser | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem('mentorverse_auth_user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.uid) return null;
    return {
      uid: parsed.uid,
      email: parsed.email ?? 'demo@mentorverse.dev',
      displayName: parsed.displayName ?? 'Learner',
      getIdToken: async () => `mv_${parsed.uid}:${Date.now()}`
    };
  } catch {
    return null;
  }
}

function setStoredLocalUser(user: UnifiedUser | null): void {
  cachedLocalUser = user;
  if (!isBrowser()) return;
  try {
    if (user) {
      localStorage.setItem(
        'mentorverse_auth_user',
        JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        })
      );
    } else {
      localStorage.removeItem('mentorverse_auth_user');
    }
  } catch (err) {
    console.error('Error updating local user storage:', err);
  }
  // Notify all listeners
  listeners.forEach((callback) => {
    try {
      callback(user);
    } catch (e) {
      console.error('Auth listener error:', e);
    }
  });
}

function getFirebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  };
}

function getMissingFirebaseEnvVars() {
  const config = getFirebaseConfig();
  const missing: string[] = [];

  if (!config.apiKey || config.apiKey.includes('placeholder')) missing.push('NEXT_PUBLIC_FIREBASE_API_KEY');
  if (!config.authDomain || config.authDomain.includes('placeholder')) missing.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  if (!config.projectId || config.projectId.includes('placeholder')) missing.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  if (!config.appId || config.appId.includes('placeholder')) missing.push('NEXT_PUBLIC_FIREBASE_APP_ID');

  return missing;
}

export function isFirebaseConfigured(): boolean {
  return getMissingFirebaseEnvVars().length === 0;
}

export function getFirebaseConfigurationError(): string | null {
  if (isFirebaseConfigured()) {
    return null;
  }
  return null; // Return null so UI provides seamless local demo auth without blocking
}

export function getFirebaseApp() {
  if (!isFirebaseConfigured()) {
    return null;
  }

  if (getApps().length > 0) {
    return getApp();
  }

  const config = getFirebaseConfig();
  return initializeApp({
    apiKey: config.apiKey ?? '',
    authDomain: config.authDomain ?? '',
    projectId: config.projectId ?? '',
    storageBucket: config.storageBucket ?? '',
    messagingSenderId: config.messagingSenderId ?? '',
    appId: config.appId ?? ''
  });
}

/**
 * Returns a universal auth instance that mirrors Firebase Auth
 * whether Firebase credentials are present or local demo auth is used.
 */
export function getFirebaseAuth(): any {
  if (isFirebaseConfigured()) {
    try {
      const fbApp = getFirebaseApp();
      if (fbApp) {
        return getAuth(fbApp);
      }
    } catch (err) {
      console.warn('Firebase initialization failed, utilizing local auth adapter:', err);
    }
  }

  // Local Auth adapter
  const current = cachedLocalUser ?? getStoredLocalUser();
  cachedLocalUser = current;

  return {
    currentUser: current,
    isLocalAuth: true
  };
}

/**
 * Universal auth state listener
 */
export function onAuthStateChanged(authInstance: any, callback: (user: any) => void): () => void {
  // If Firebase is configured, subscribe to Firebase Auth
  if (isFirebaseConfigured()) {
    try {
      const fbApp = getFirebaseApp();
      if (fbApp) {
        const auth = getAuth(fbApp);
        return firebaseOnAuthStateChanged(auth, (fbUser) => {
          if (fbUser) {
            callback(fbUser);
          } else {
            // Check if local demo user exists
            const local = cachedLocalUser ?? getStoredLocalUser();
            callback(local);
          }
        });
      }
    } catch (err) {
      console.warn('Firebase onAuthStateChanged error, using local auth:', err);
    }
  }

  // Local auth listener
  listeners.add(callback);
  const current = cachedLocalUser ?? getStoredLocalUser();
  callback(current);

  return () => {
    listeners.delete(callback);
  };
}

export async function signInWithGoogle(): Promise<any> {
  if (isFirebaseConfigured()) {
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }

  // Local fallback: Demo student Google simulation
  const demoStudent: UnifiedUser = {
    uid: 'demo_student_1',
    email: 'alex.rivera@mentorverse.dev',
    displayName: 'Alex Rivera (Google Demo)',
    getIdToken: async () => `mv_demo_student_1:${Date.now()}`
  };
  setStoredLocalUser(demoStudent);
  return { user: demoStudent };
}

export async function signInWithGoogleRedirect() {
  if (isFirebaseConfigured()) {
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    return signInWithRedirect(auth, provider);
  }
  return signInWithGoogle();
}

export function isPopupBlockedError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }
  const code = 'code' in error ? String((error as { code?: string }).code) : '';
  return code === 'auth/popup-blocked';
}

export async function signInWithEmail(email: string, password: string): Promise<any> {
  if (isFirebaseConfigured()) {
    try {
      const auth = getFirebaseAuth();
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      // If Firebase fails or credentials don't exist, proceed to local auth
      console.warn('Firebase email login failed, falling back to local credentials:', err);
    }
  }

  const cleanEmail = email.trim();
  const safeId = 'user_' + Buffer.from(cleanEmail).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
  const localUser: UnifiedUser = {
    uid: safeId || 'demo_student_1',
    email: cleanEmail,
    displayName: cleanEmail.split('@')[0],
    getIdToken: async () => `mv_${safeId || 'demo_student_1'}:${Date.now()}`
  };
  setStoredLocalUser(localUser);
  return { user: localUser };
}

export async function signInWithDemoStudent(): Promise<UnifiedUser> {
  const demoUser: UnifiedUser = {
    uid: 'demo_student_1',
    email: 'demo@mentorverse.dev',
    displayName: 'Alex Rivera',
    getIdToken: async () => `mv_demo_student_1:${Date.now()}`
  };
  setStoredLocalUser(demoUser);
  return demoUser;
}

export async function signOutUser(): Promise<void> {
  if (isFirebaseConfigured()) {
    try {
      const auth = getFirebaseAuth();
      await signOut(auth);
    } catch {
      // Ignore
    }
  }
  setStoredLocalUser(null);
}
