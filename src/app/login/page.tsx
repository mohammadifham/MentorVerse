'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import {
  GraduationCap,
  Shield,
  Eye,
  EyeOff,
  Lock,
  User
} from 'lucide-react';
import {
  getFirebaseAuth,
  isPopupBlockedError,
  onAuthStateChanged,
  signInWithEmail,
  signInWithGoogle,
  signInWithGoogleRedirect
} from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();

  // Mode: learner or admin
  const [authMode, setAuthMode] = useState<'learner' | 'admin'>('learner');

  // Learner form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Admin form fields
  const [adminUsername, setAdminUsername] = useState('Admin');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Auto-switch to admin if query param ?role=admin exists
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('role') === 'admin' || params.get('admin') === 'true') {
        setAuthMode('admin');
      }
    }
  }, []);

  // Listen for existing learner auth
  useEffect(() => {
    try {
      const auth = getFirebaseAuth();
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user && authMode === 'learner') {
          router.push('/dashboard');
        }
      });

      return () => unsubscribe();
    } catch {
      return;
    }
  }, [router, authMode]);

  // Unified or Learner Form Submit
  const handleLearnerLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    const trimmedIdentifier = email.trim();

    // Smart detection: If user types 'Admin' or 'admin@guidely.com' into learner login
    if (
      trimmedIdentifier.toLowerCase() === 'admin' ||
      trimmedIdentifier.toLowerCase() === 'admin@guidely.com' ||
      trimmedIdentifier.toLowerCase() === 'admin@mentorverse.com'
    ) {
      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: trimmedIdentifier, password: password.trim() })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Invalid Admin credentials.');
        }

        localStorage.setItem('guidely_admin_token', data.token);
        setNotice('Admin authenticated successfully. Redirecting to Admin Console...');
        setTimeout(() => {
          router.push('/admin');
        }, 300);
        return;
      } catch (adminErr: any) {
        setError(adminErr.message || 'Admin login failed.');
        setLoading(false);
        return;
      }
    }

    // Standard Learner Login via Firebase
    try {
      await signInWithEmail(trimmedIdentifier, password);
      router.push('/dashboard');
    } catch (loginError) {
      const fallback = loginError instanceof Error ? loginError.message : 'Login failed.';
      setError(fallback);
    } finally {
      setLoading(false);
    }
  };

  // Dedicated Admin Form Submit
  const handleAdminLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: adminUsername.trim(),
          password: adminPassword.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid Admin credentials.');
      }

      localStorage.setItem('guidely_admin_token', data.token);
      setNotice('Master Admin verified. Redirecting...');
      setTimeout(() => {
        router.push('/admin');
      }, 300);
    } catch (adminErr: any) {
      setError(adminErr.message || 'Admin login failed. Check username and password.');
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
    <div className="mx-auto w-full max-w-xl rounded-[2rem] border border-white/10 bg-slate-950/80 p-7 shadow-2xl shadow-cyan-900/20 backdrop-blur sm:p-10">
      {/* Role Switcher Tabs */}
      <div className="mb-6 flex rounded-2xl border border-white/10 bg-white/5 p-1.5 backdrop-blur">
        <button
          type="button"
          onClick={() => {
            setAuthMode('learner');
            setError(null);
            setNotice(null);
          }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition ${
            authMode === 'learner'
              ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          Learner Login
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMode('admin');
            setError(null);
            setNotice(null);
          }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition ${
            authMode === 'admin'
              ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Shield className="h-4 w-4" />
          Master Admin
        </button>
      </div>

      {authMode === 'learner' ? (
        /* LEARNER LOGIN VIEW */
        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-200">Learner Portal</p>
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
              Ready to Learn
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-300">
            Sign in to your account to continue learning.
          </p>

          <form onSubmit={handleLearnerLogin} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-200">Email or Username</span>
              <input
                type="text"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="input-field"
                placeholder="you@example.com or Admin"
                required
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
                required
              />
            </label>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Logging in...' : 'Login with Credentials'}
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

          {notice ? (
            <p className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-sm text-cyan-100">
              {notice}
            </p>
          ) : null}
          {error ? (
            <p className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-100">
              {error}
            </p>
          ) : null}

          <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
            <p>
              New learner?{' '}
              <Link href="/signup" className="text-cyan-200 transition hover:text-cyan-100">
                Create account
              </Link>
            </p>
            <button
              type="button"
              onClick={() => setAuthMode('admin')}
              className="text-xs text-slate-400 underline decoration-slate-600 transition hover:text-amber-300"
            >
              Admin login →
            </button>
          </div>
        </div>
      ) : (
        /* MASTER ADMIN LOGIN VIEW */
        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-300">Admin Console</p>
            <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-300">
              Authorized Access Only
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold text-white">GUIDELY Master Admin</h1>
          <p className="mt-2 text-sm text-slate-300">
            Sign in with authorized master credentials to inspect live telemetry and manage users.
          </p>

          <form onSubmit={handleAdminLogin} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">Admin Username</span>
              <div className="relative">
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Admin"
                  required
                />
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">Master Password</span>
              <div className="relative">
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="Enter master password"
                  required
                />
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showAdminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/25 transition hover:brightness-110 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : '🔓 Unlock Admin Console'}
            </button>
          </form>

          {/* Quick-fill helper */}
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-center">
            <button
              type="button"
              onClick={() => {
                setAdminUsername('Admin');
                setAdminPassword('PROJECT@TRUE');
              }}
              className="text-xs text-amber-300/90 underline decoration-amber-500/50 transition hover:text-amber-200"
            >
              Quick Fill Configured Credentials (Admin / PROJECT@TRUE)
            </button>
          </div>

          {notice ? (
            <p className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-200">
              {notice}
            </p>
          ) : null}
          {error ? (
            <p className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-100">
              {error}
            </p>
          ) : null}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setAuthMode('learner')}
              className="text-xs text-slate-400 underline decoration-slate-600 transition hover:text-cyan-300"
            >
              ← Back to Learner Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
