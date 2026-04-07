'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { LogIn, LogOut } from 'lucide-react';
import { getFirebaseAuth, signOutUser } from '@/lib/firebase';

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
          <>
            <Link href="/dashboard" className="btn-secondary rounded-full px-4 py-2 text-sm">
              Dashboard
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="btn-secondary rounded-full px-4 py-2 text-sm"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="btn-secondary rounded-full px-4 py-2 text-sm">
              <LogIn className="h-4 w-4" />
              Login
            </Link>
            <Link href="/signup" className="btn-primary rounded-full px-4 py-2 text-sm">
              Sign up
            </Link>
          </>
        )}
      </div>
      {error ? <p className="max-w-xs text-right text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}
