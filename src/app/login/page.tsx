'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  getFirebaseAuth,
  getFirebaseConfigurationError,
  isPopupBlockedError,
  signInWithEmail,
  signInWithGoogle,
  signInWithGoogleRedirect
} from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const firebaseConfigError = getFirebaseConfigurationError();

  useEffect(() => {
    if (firebaseConfigError) {
      return;
    }

    try {
      const auth = getFirebaseAuth();
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          router.push('/dashboard');
        }
      });

      return () => unsubscribe();
    } catch {
      return;
    }
  }, [firebaseConfigError, router]);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmail(email.trim(), password);
      router.push('/dashboard');
    } catch (loginError) {
      const fallback = loginError instanceof Error ? loginError.message : 'Login failed.';
      setError(firebaseConfigError ?? fallback);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setNotice(null);
    setLoading(true);

    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (loginError) {
      if (isPopupBlockedError(loginError)) {
        setNotice('Popup blocked by browser. Redirecting to Google sign-in...');
        await signInWithGoogleRedirect();
        return;
      }

      const fallback = loginError instanceof Error ? loginError.message : 'Google login failed.';
      setError(firebaseConfigError ?? fallback);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl rounded-[2rem] border border-white/10 bg-slate-950/70 p-7 shadow-2xl shadow-cyan-900/20 backdrop-blur sm:p-10">
      <p className="text-xs uppercase tracking-[0.35em] text-cyan-200">Learner login</p>
      <h1 className="mt-2 text-3xl font-semibold text-white">Welcome back</h1>
      <p className="mt-3 text-sm text-slate-300">Login with your email and password or continue using Google.</p>

      <form onSubmit={handleLogin} className="mt-7 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm text-slate-200">Email</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="input-field" placeholder="you@example.com" />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-200">Password</span>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="input-field" placeholder="Enter your password" />
        </label>

        <button type="submit" disabled={loading || Boolean(firebaseConfigError)} className="btn-primary w-full py-3">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading || Boolean(firebaseConfigError)}
        className="btn-secondary mt-4 w-full py-3"
      >
        Continue with Google
      </button>

      {firebaseConfigError ? <p className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-sm text-amber-100">{firebaseConfigError}</p> : null}
      {notice ? <p className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-sm text-cyan-100">{notice}</p> : null}
      {error ? <p className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-100">{error}</p> : null}

      <p className="mt-5 text-sm text-slate-400">
        New learner? <Link href="/signup" className="text-cyan-200 transition hover:text-cyan-100">Create account</Link>
      </p>
    </div>
  );
}
