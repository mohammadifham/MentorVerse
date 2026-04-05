import { getApp, getApps, initializeApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth, signInWithPopup, signOut } from 'firebase/auth';

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

function isFirebaseConfigured() {
  const config = getFirebaseConfig();
  return Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);
}

export function getFirebaseApp() {
  const config = getFirebaseConfig();
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase environment variables are missing.');
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

export async function signOutUser() {
  const auth = getFirebaseAuth();
  return signOut(auth);
}
