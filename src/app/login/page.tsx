'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import {
  getFirebaseAuth,
  isPopupBlockedError,
  onAuthStateChanged,
  signInWithDemoStudent,
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

  useEffect(() => {
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
  }, [router]);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmail(email.trim(), password);
      router.push('/dashboard');
    } catch (loginError) {
      const fallback = loginError instanceof Error ? loginError.message : 'Login failed.';
      setError(fallback);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoStudentLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithDemoStudent();
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo login failed.');
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
      setError(fallback);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl rounded-[2rem] border border-white/10 bg-slate-950/70 p-7 shadow-2xl shadow-cyan-900/20 backdrop-blur sm:p-10">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-200">Learner login</p>
        <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
          Ready to Learn
        </span>
      </div>
      <h1 className="mt-2 text-3xl font-semibold text-white">Welcome back</h1>
      <p className="mt-3 text-sm text-slate-300">Login with your credentials or try instant demo student access.</p>

      {/* 1-Click Demo Access */}
      <div className="mt-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 to-blue-950/40 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Quick Demo Access</p>
            <p className="text-xs text-slate-300">Explore all features instantly with sample student profile.</p>
          </div>
          <button
            type="button"
            onClick={handleDemoStudentLogin}
            disabled={loading}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/25 transition hover:brightness-110"
          >
            {loading ? 'Entering...' : '⚡ Enter as Demo Student'}
          </button>
        </div>
      </div>

      <div className="relative my-6 flex items-center justify-center">
        <div className="w-full border-t border-white/10" />
        <span className="absolute bg-slate-950 px-3 text-xs uppercase tracking-wider text-slate-400">or sign in</span>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm text-slate-200">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="input-field"
            placeholder="you@example.com"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-200">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="input-field"
            placeholder="Enter your password"
          />
        </label>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Logging in...' : 'Login with Email'}
        </button>
      </form>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="btn-secondary mt-4 w-full py-3"
      >
        Continue with Google
      </button>

      {notice ? <p className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-sm text-cyan-100">{notice}</p> : null}
      {error ? <p className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-100">{error}</p> : null}

      <p className="mt-5 text-sm text-slate-400">
        New learner? <Link href="/signup" className="text-cyan-200 transition hover:text-cyan-100">Create account</Link>
      </p>
    </div>
  );
}
