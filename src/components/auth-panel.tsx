'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { LogIn, LogOut } from 'lucide-react';
import { getFirebaseAuth, signInWithGoogle, signOutUser } from '@/lib/firebase';

export function AuthPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const auth = getFirebaseAuth();
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setReady(true);
      });

      return () => unsubscribe();
    } catch {
      setReady(true);
      setError('Firebase auth is not configured yet.');
    }
  }, []);

  const handleSignIn = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch {
      setError('Sign-in failed. Check Firebase settings and Google auth provider configuration.');
    }
  };

  const handleSignOut = async () => {
    setError(null);
    try {
      await signOutUser();
    } catch {
      setError('Sign-out failed.');
    }
  };

  return (
    <div className="flex flex-col items-end gap-2 text-sm text-slate-300">
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 backdrop-blur">
        <span className={`h-2.5 w-2.5 rounded-full ${user ? 'bg-emerald-400' : 'bg-slate-500'}`} />
        <span>{ready ? (user ? user.email ?? 'Signed in' : 'Guest mode') : 'Connecting...'}</span>
      </div>
      <div className="flex gap-2">
        {user ? (
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:border-cyan-400/60 hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSignIn}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.01]"
          >
            <LogIn className="h-4 w-4" />
            Sign in with Google
          </button>
        )}
      </div>
      {error ? <p className="max-w-xs text-right text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}
