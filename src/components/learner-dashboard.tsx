'use client';

import Link from 'next/link';
import { type ChangeEvent, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { motion } from 'framer-motion';
import { BookOpen, Code2, Flame, Mail, Phone, Target, UserRound } from 'lucide-react';
import { getFirebaseAuth } from '@/lib/firebase';
import type { CodeSubmissionSummary, DashboardSummary, LearnerProfile } from '@/lib/types';
import type { ReactNode } from 'react';

const defaultSummary: DashboardSummary = {
  score: 0,
  weakTopics: [],
  strongTopics: [],
  trend: [],
  sessionCount: 0
};

const defaultCodeSummary: CodeSubmissionSummary = {
  totalSubmissions: 0,
  solvedCount: 0,
  averageScore: 0,
  currentStreak: 0,
  recentSubmissions: []
};

export function LearnerDashboard() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [summary, setSummary] = useState<DashboardSummary>(defaultSummary);
  const [codeSummary, setCodeSummary] = useState<CodeSubmissionSummary>(defaultCodeSummary);
  const [loading, setLoading] = useState(false);
  const [uploadingDp, setUploadingDp] = useState(false);
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
      setError('Authentication is not configured. Add Firebase keys to continue.');
    }
  }, []);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user) {
        setProfile(null);
        setSummary(defaultSummary);
        setCodeSummary(defaultCodeSummary);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const idToken = await user.getIdToken();
        const [profileRes, dashboardRes, codeSummaryRes] = await Promise.all([
          fetch('/api/learner-profile', {
            headers: { Authorization: `Bearer ${idToken}` }
          }),
          fetch('/api/dashboard', {
            headers: { Authorization: `Bearer ${idToken}` }
          }),
          fetch('/api/code/history', {
            headers: { Authorization: `Bearer ${idToken}` }
          })
        ]);

        if (!profileRes.ok || !dashboardRes.ok || !codeSummaryRes.ok) {
          throw new Error('Unable to load learner dashboard data.');
        }

        const profileJson = (await profileRes.json()) as { profile: LearnerProfile | null };
        const dashboardJson = (await dashboardRes.json()) as { summary: DashboardSummary };
        const codeJson = (await codeSummaryRes.json()) as { summary: CodeSubmissionSummary };

        setProfile(profileJson.profile);
        setSummary(dashboardJson.summary);
        setCodeSummary(codeJson.summary);
      } catch {
        setError('Could not load learner details right now.');
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, [user]);

  const maxTrend = useMemo(() => {
    const maxValue = Math.max(...summary.trend.map((entry) => entry.value), 100);
    return Math.max(100, maxValue);
  }, [summary.trend]);

  const handleProfileDpUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }

    if (!user) {
      setError('Please login before uploading profile photo.');
      return;
    }

    if (!profile) {
      setError('Complete signup details first, then upload profile photo.');
      return;
    }

    setUploadingDp(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const profileDpData = typeof reader.result === 'string' ? reader.result : '';
      if (!profileDpData) {
        setUploadingDp(false);
        setError('Unable to process selected image.');
        return;
      }

      try {
        const idToken = await user.getIdToken();
        const response = await fetch('/api/learner-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({
            userId: user.uid,
            name: profile.name,
            phone: profile.phone,
            email: profile.email,
            course: profile.course,
            profileDp: profileDpData
          })
        });

        if (!response.ok) {
          const data = (await response.json()) as { error?: string };
          throw new Error(data.error || 'Unable to update profile photo.');
        }

        setProfile({ ...profile, profileDp: profileDpData });
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : 'Profile photo update failed.');
      } finally {
        setUploadingDp(false);
      }
    };

    reader.onerror = () => {
      setUploadingDp(false);
      setError('Could not read selected image.');
    };

    reader.readAsDataURL(file);
  };

  if (!ready) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 text-slate-300 backdrop-blur">
        Loading learner dashboard...
      </div>
    );
  }

  if (!user) {
    return (
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-7 text-center backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Learner dashboard</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Sign in to access your dashboard</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300">Login or create your learner account to view your course profile, contact details, and learning performance.</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href="/login" className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm text-white transition hover:bg-white/10">Login</Link>
          <Link href="/signup" className="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-2.5 text-sm font-medium text-slate-950 transition hover:scale-[1.02]">Sign up</Link>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-7">
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-cyan-900/20 backdrop-blur">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-2xl border border-cyan-300/30 bg-white/5">
              {profile?.profileDp || user.photoURL ? (
                // Using img keeps remote avatar support without extra Next image config.
                <img src={profile?.profileDp || user.photoURL || ''} alt="Learner profile" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-cyan-200">
                  <UserRound className="h-7 w-7" />
                </div>
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Learner Profile</p>
              <h1 className="mt-1 text-2xl font-semibold text-white">{profile?.name || user.displayName || 'Learner'}</h1>
              <p className="text-sm text-slate-300">{profile?.course || 'Course not set yet'}</p>
              <label className="mt-2 inline-flex cursor-pointer items-center rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/10">
                {uploadingDp ? 'Uploading photo...' : 'Upload new profile photo'}
                <input type="file" accept="image/*" onChange={handleProfileDpUpload} className="hidden" disabled={uploadingDp} />
              </label>
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-300/25 bg-emerald-400/10 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-100/80">Performance score</p>
            <p className="mt-1 text-3xl font-semibold text-emerald-100">{summary.score}</p>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 text-slate-300 backdrop-blur">Loading profile and performance data...</div>
      ) : null}
      {error ? <div className="rounded-3xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">{error}</div> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard title="Email" value={profile?.email || user.email || '—'} icon={<Mail className="h-4 w-4" />} />
        <InfoCard title="Phone" value={profile?.phone || '—'} icon={<Phone className="h-4 w-4" />} />
        <InfoCard title="Course" value={profile?.course || '—'} icon={<BookOpen className="h-4 w-4" />} />
        <InfoCard title="Sessions" value={`${summary.sessionCount}`} icon={<UserRound className="h-4 w-4" />} />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard title="Code submissions" value={`${codeSummary.totalSubmissions}`} icon={<Code2 className="h-4 w-4" />} />
        <InfoCard title="Problems solved" value={`${codeSummary.solvedCount}`} icon={<Target className="h-4 w-4" />} />
        <InfoCard title="Avg code score" value={`${codeSummary.averageScore}%`} icon={<BookOpen className="h-4 w-4" />} />
        <InfoCard title="Coding streak" value={`${codeSummary.currentStreak} day(s)`} icon={<Flame className="h-4 w-4" />} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Learning trend</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Recent performance trend</h2>
          <div className="mt-6 space-y-4">
            {summary.trend.length > 0 ? (
              summary.trend.map((entry, index) => (
                <motion.div
                  key={`${entry.label}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>{entry.label}</span>
                    <span>{entry.value}</span>
                  </div>
                  <div className="h-3 rounded-full bg-white/5">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                      style={{ width: `${Math.max(10, Math.round((entry.value / maxTrend) * 100))}%` }}
                    />
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No sessions yet. Start learning to build your trend.</p>
            )}
          </div>
        </article>

        <article className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Topic insights</p>
          <div className="mt-5 space-y-5">
            <InsightBlock title="Weak topics" items={summary.weakTopics} tone="amber" />
            <InsightBlock title="Strong topics" items={summary.strongTopics} tone="emerald" />
          </div>
        </article>
      </section>

      <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Recent coding submissions</p>
        {codeSummary.recentSubmissions.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-slate-400">
                  <th className="pb-2 pr-4 font-medium">Problem</th>
                  <th className="pb-2 pr-4 font-medium">Topic</th>
                  <th className="pb-2 pr-4 font-medium">Language</th>
                  <th className="pb-2 pr-4 font-medium">Score</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {codeSummary.recentSubmissions.map((submission, index) => (
                  <tr key={`${submission.problemTitle}-${submission.createdAt}-${index}`} className="border-b border-white/5 text-slate-200">
                    <td className="py-3 pr-4">{submission.problemTitle}</td>
                    <td className="py-3 pr-4">{submission.topic}</td>
                    <td className="py-3 pr-4">{submission.language}</td>
                    <td className="py-3 pr-4">{submission.score}%</td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs ${submission.passed ? 'border border-emerald-300/25 bg-emerald-400/10 text-emerald-200' : 'border border-amber-300/25 bg-amber-400/10 text-amber-100'}`}>
                        {submission.passed ? 'Accepted' : 'Attempted'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-400">No coding submissions yet. Visit Learn page and run code in the practice lab.</p>
        )}
      </section>
    </div>
  );
}

function InfoCard({ title, value, icon }: { title: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 backdrop-blur">
      <div className="flex items-center gap-2 text-slate-300">
        {icon}
        <p className="text-xs uppercase tracking-[0.2em]">{title}</p>
      </div>
      <p className="mt-3 break-all text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function InsightBlock({ title, items, tone }: { title: string; items: string[]; tone: 'amber' | 'emerald' }) {
  const toneClasses = tone === 'amber' ? 'border-amber-400/20 bg-amber-400/10 text-amber-100' : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100';

  return (
    <div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.length > 0 ? (
          items.map((item) => (
            <span key={item} className={`rounded-full border px-3 py-1 text-sm ${toneClasses}`}>
              {item}
            </span>
          ))
        ) : (
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">No items yet</span>
        )}
      </div>
    </div>
  );
}
