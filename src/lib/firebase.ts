import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  getAuth,
  signInWithRedirect,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type UserCredential
} from 'firebase/auth';

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

  if (!config.apiKey) missing.push('NEXT_PUBLIC_FIREBASE_API_KEY');
  if (!config.authDomain) missing.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  if (!config.projectId) missing.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  if (!config.appId) missing.push('NEXT_PUBLIC_FIREBASE_APP_ID');

  return missing;
}

function isFirebaseConfigured() {
  return getMissingFirebaseEnvVars().length === 0;
}

export function getFirebaseConfigurationError() {
  const missingVars = getMissingFirebaseEnvVars();
  if (missingVars.length === 0) {
    return null;
  }

  return `Firebase configuration is missing: ${missingVars.join(', ')}. Add these in your deployment environment variables, then rebuild/redeploy.`;
}

export function getFirebaseApp() {
  const config = getFirebaseConfig();
  if (!isFirebaseConfigured()) {
    const missingVars = getMissingFirebaseEnvVars();
    throw new Error(
      `Firebase environment variables are missing: ${missingVars.join(', ')}. ` +
      'Add NEXT_PUBLIC_FIREBASE_* variables in your deployment settings and redeploy.'
    );
  }

  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp({
    apiKey: config.apiKey ?? '',
    authDomain: config.authDomain ?? '',
    projectId: config.projectId ?? '',
    storageBucket: config.storageBucket ?? '',
    messagingSenderId: config.messagingSenderId ?? '',
    appId: config.appId ?? ''
  });
}

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

export async function signInWithGoogle() {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

export async function signInWithGoogleRedirect() {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  return signInWithRedirect(auth, provider);
}

export function isPopupBlockedError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const code = 'code' in error ? String((error as { code?: string }).code) : '';
  return code === 'auth/popup-blocked';
}

export async function signInWithEmail(email: string, password: string): Promise<UserCredential> {
  const auth = getFirebaseAuth();
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signOutUser() {
  const auth = getFirebaseAuth();
  return signOut(auth);
}
