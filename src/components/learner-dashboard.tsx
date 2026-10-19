'use client';

import Link from 'next/link';
import { type ChangeEvent, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Code2, Flame, Mail, Phone, Target, UserRound, Sparkles, Brain, Lightbulb, Copy, Check, ArrowRight, GraduationCap, CheckCircle } from 'lucide-react';
import { getFirebaseAuth, onAuthStateChanged, getCurrentUnifiedUser, type UnifiedUser } from '@/lib/firebase';
import { PLACEMENT_COURSES } from '@/lib/courses-data';
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

const DASHBOARD_QUICK_PROMPTS = [
  'Binary Search algorithm and complexity',
  'Quicksort with Python example',
  'Dynamic Programming 0/1 Knapsack',
  'React useState vs useEffect lifecycle',
  'REST API vs GraphQL architecture'
];

export function LearnerDashboard() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<UnifiedUser | null>(null);
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [summary, setSummary] = useState<DashboardSummary>(defaultSummary);
  const [codeSummary, setCodeSummary] = useState<CodeSubmissionSummary>(defaultCodeSummary);
  const [loading, setLoading] = useState(false);
  const [uploadingDp, setUploadingDp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courseProgress, setCourseProgress] = useState<Record<string, string[]>>({});

  // AI Chatbot State
  const [chatQuery, setChatQuery] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatCopied, setChatCopied] = useState(false);
  const [chatResult, setChatResult] = useState<{
    topic: string;
    explanation: string;
    example?: string;
    question: string;
  } | null>(null);

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

  // Load Course Progress from local storage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('guidely_course_progress');
      if (raw) {
        setCourseProgress(JSON.parse(raw));
      }
    } catch {
      // Ignore
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

  const handleAskChatbot = async (queryText?: string) => {
    const query = (queryText || chatQuery).trim();
    if (!query) return;
    const activeUser = user || getCurrentUnifiedUser();
    if (!activeUser) {
      setChatError('Please sign in to your account to query the AI tutor.');
      return;
    }
    setChatQuery(query);
    setChatLoading(true);
    setChatError(null);
    try {
      const idToken = await activeUser.getIdToken();
      const res = await fetch('/api/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ topic: query, userId: activeUser.uid })
      });
      if (!res.ok) {
        const errJson = (await res.json()) as { error?: string };
        throw new Error(errJson.error || 'Failed to get answer from AI tutor.');
      }
      const data = (await res.json()) as {
        explanation: string;
        example?: string;
        question: string;
      };
      setChatResult({
        topic: query,
        explanation: data.explanation,
        example: data.example,
        question: data.question
      });
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setChatLoading(false);
    }
  };

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

      {/* Ask GUIDELY AI Chatbot Widget */}
      <section className="relative overflow-hidden rounded-[2rem] border border-cyan-500/30 bg-gradient-to-br from-slate-950 via-slate-900/90 to-slate-950 p-6 shadow-2xl shadow-cyan-950/40 backdrop-blur">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-500 text-slate-950 shadow-md shadow-cyan-500/20">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Ask GUIDELY AI Chatbot</h2>
                <p className="text-xs text-slate-400">Ask any question or concept and get an accurate explanation with concrete examples.</p>
              </div>
            </div>
            <Link
              href="/learn"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition"
            >
              Open Learning Studio
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <input
                value={chatQuery}
                onChange={(e) => setChatQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && chatQuery.trim()) {
                    e.preventDefault();
                    void handleAskChatbot();
                  }
                }}
                placeholder="Ask any topic or concept (e.g. 'Binary Search', 'Dynamic Programming', 'REST API Architecture')..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
              />
            </div>
            <button
              type="button"
              onClick={() => void handleAskChatbot()}
              disabled={chatLoading || !chatQuery.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" />
              {chatLoading ? 'Thinking...' : 'Ask AI'}
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400 font-medium">Try asking:</span>
            {DASHBOARD_QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => void handleAskChatbot(p)}
                disabled={chatLoading}
                className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 transition hover:border-cyan-400/40 hover:bg-white/10 hover:text-cyan-200 active:scale-95 disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>

          {chatError ? (
            <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-200">{chatError}</p>
          ) : null}

          {/* Chatbot Response Display */}
          {chatResult ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 space-y-3 rounded-2xl border border-cyan-400/20 bg-cyan-950/20 p-4 text-slate-100"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
                  Question: &quot;{chatResult.topic}&quot;
                </span>
                <Link
                  href="/learn"
                  className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline"
                >
                  Practice in Learning Studio →
                </Link>
              </div>

              {/* Explanation */}
              <div className="rounded-xl bg-slate-900/80 p-3.5 border border-white/5">
                <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                  <BookOpen className="h-3.5 w-3.5" />
                  Explanation
                </div>
                <div className="whitespace-pre-line text-sm leading-relaxed text-slate-200">
                  {chatResult.explanation}
                </div>
              </div>

              {/* Concrete Example */}
              {chatResult.example ? (
                <div className="rounded-xl bg-slate-950 p-3.5 border border-emerald-500/20 text-emerald-100">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      <Code2 className="h-3.5 w-3.5" />
                      Concrete Example & Walkthrough
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (chatResult.example) {
                          navigator.clipboard.writeText(chatResult.example);
                          setChatCopied(true);
                          setTimeout(() => setChatCopied(false), 2000);
                        }
                      }}
                      className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300 hover:bg-emerald-500/20 transition"
                    >
                      {chatCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {chatCopied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre className="overflow-x-auto rounded-lg bg-black/50 p-3 font-mono text-xs text-emerald-200 leading-relaxed whitespace-pre-wrap border border-emerald-500/10">
                    {chatResult.example}
                  </pre>
                </div>
              ) : null}

              {/* Practice Question */}
              <div className="rounded-xl bg-violet-950/40 p-3 border border-violet-500/20 text-violet-100">
                <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-violet-300">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-300" />
                  Follow-Up Practice Check
                </div>
                <p className="text-xs text-slate-300">{chatResult.question}</p>
              </div>
            </motion.div>
          ) : null}
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

      {/* CSE Placement Courses Progress */}
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
              <GraduationCap className="h-4 w-4" />
              CSE Placement Curriculum
            </span>
            <h2 className="mt-1 text-xl font-bold text-white">Your Placement Preparation Courses</h2>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition"
          >
            View All Courses Catalog
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLACEMENT_COURSES.map((course) => {
            const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
            const completedCount = (courseProgress[course.id] || []).length;
            const percent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

            return (
              <div
                key={course.id}
                className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-cyan-400/30 hover:bg-white/[0.04]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      course.level === 'Beginner'
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                        : course.level === 'Moderate'
                        ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
                        : course.level === 'Pro'
                        ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                        : 'border-violet-500/30 bg-violet-500/10 text-violet-300'
                    }`}>
                      {course.level}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {course.modules.length} modules
                    </span>
                  </div>

                  <h3 className="mt-2.5 font-bold text-white text-sm leading-snug line-clamp-2">
                    {course.title}
                  </h3>

                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Progress</span>
                      <span className="font-semibold text-slate-200">{percent}% ({completedCount}/{totalLessons})</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <Link
                  href={`/courses/${course.id}`}
                  className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 py-2 text-xs font-semibold text-white transition hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:text-cyan-200"
                >
                  {completedCount > 0 ? 'Continue Course' : 'Start Course'}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            );
          })}
        </div>
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
