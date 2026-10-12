'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Lock, LogIn, UserPlus, Sparkles, Code2, ArrowRight } from 'lucide-react';
import { getFirebaseAuth, onAuthStateChanged, signInWithDemoStudent, type UnifiedUser } from '@/lib/firebase';
import { LearnWorkspace } from '@/components/learn-workspace';
import { CodePracticeWorkspace } from '@/components/code-practice-workspace';

export function LearnPageClient() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<UnifiedUser | null>(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);

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
    }
  }, []);

  const handleDemoSignIn = async () => {
    setDemoLoading(true);
    setDemoError(null);
    try {
      const demoUser = await signInWithDemoStudent();
      setUser(demoUser);
    } catch (err: any) {
      setDemoError(err?.message || 'Demo sign-in failed. Please use standard Login or Signup.');
    } finally {
      setDemoLoading(false);
    }
  };

  if (!ready) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-white/10 bg-slate-950/70 p-12 text-slate-300 backdrop-blur">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <p className="text-sm font-medium text-slate-400">Verifying learner access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative mx-auto my-6 max-w-3xl overflow-hidden rounded-[2.5rem] border border-cyan-500/30 bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-slate-950/95 p-8 text-center shadow-2xl shadow-cyan-950/40 backdrop-blur sm:p-12"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_55%),radial-gradient(circle_at_bottom,rgba(16,185,129,0.12),transparent_45%)]" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.25)]">
            <Lock className="h-8 w-8 text-cyan-300" />
          </div>

          <span className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" />
            Authentication Required
          </span>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Sign In or Sign Up to Start Learning
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base text-slate-300">
            To use GUIDELY&apos;s multi-agent AI tutor, interactive coding playground, real-time code evaluator, and track your personalized learning analytics, please log in or create an account.
          </p>

          <div className="mt-8 flex flex-col w-full max-w-sm gap-3 sm:flex-row sm:max-w-none sm:justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-7 py-3.5 text-base font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:scale-[1.02] active:scale-[0.98]"
            >
              <LogIn className="h-5 w-5" />
              Log In to Account
            </Link>

            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-7 py-3.5 text-base font-medium text-white backdrop-blur transition hover:bg-white/10 hover:border-cyan-300/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              <UserPlus className="h-5 w-5" />
              Create Free Account
            </Link>
          </div>

          <div className="mt-8 border-t border-white/10 pt-6 w-full max-w-md">
            <p className="text-xs text-slate-400">Want to test the platform immediately?</p>
            <button
              type="button"
              onClick={handleDemoSignIn}
              disabled={demoLoading}
              className="mt-2.5 inline-flex items-center gap-2 text-xs font-medium text-cyan-300 hover:text-cyan-200 underline decoration-cyan-400/40 transition hover:decoration-cyan-300 disabled:opacity-60"
            >
              <Code2 className="h-3.5 w-3.5" />
              {demoLoading ? 'Launching demo student...' : 'Explore as Demo Student (1-Click) →'}
            </button>
            {demoError ? (
              <p className="mt-2 text-xs text-rose-300">{demoError}</p>
            ) : null}
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <div className="space-y-8">
      <LearnWorkspace />
      <CodePracticeWorkspace />
    </div>
  );
}
