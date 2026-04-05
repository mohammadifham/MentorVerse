'use client';

import dynamic from 'next/dynamic';
import { useMemo, useRef, useState } from 'react';
import { Brain, CheckCircle2, Lightbulb, Sparkles } from 'lucide-react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { AuthPanel } from '@/components/auth-panel';
import type { AttentionStatus, LearningResponse } from '@/lib/types';

const AttentionMonitor = dynamic(
  () => import('@/components/attention-monitor').then((module) => module.AttentionMonitor),
  {
    ssr: false,
    loading: () => (
      <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-2xl shadow-violet-900/20 backdrop-blur">
        <div className="h-56 animate-pulse rounded-2xl bg-white/5" />
      </section>
    )
  }
);

interface LessonState extends LearningResponse {
  mentorMessage?: string;
}

export function LearnWorkspace() {
  const [topic, setTopic] = useState('Binary Search');
  const [question, setQuestion] = useState('');
  const [explanation, setExplanation] = useState('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [level, setLevel] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attentionStatus, setAttentionStatus] = useState<AttentionStatus>('Preparing');
  const [lessonLoaded, setLessonLoaded] = useState(false);
  const startedAtRef = useRef<number | null>(null);

  const confidencePercent = useMemo(() => Math.round(confidence * 100), [confidence]);

  const fetchLesson = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });

      if (!response.ok) {
        throw new Error('Failed to load lesson.');
      }

      const data = (await response.json()) as LearningResponse;
      setExplanation(data.explanation);
      setQuestion(data.question);
      setConfidence(data.confidence);
      setLevel(data.level);
      setFeedback(data.feedback);
      setWeakTopics(data.weak_topics);
      startedAtRef.current = Date.now();
      setLessonLoaded(true);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!question) {
      setError('Generate a lesson first.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const responseTime = startedAtRef.current ? Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000)) : undefined;
      const response = await fetch('/api/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, answer, responseTime, question })
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate answer.');
      }

      const data = (await response.json()) as LearningResponse;
      setExplanation(data.explanation);
      setQuestion(data.question);
      setConfidence(data.confidence);
      setLevel(data.level);
      setFeedback(data.feedback);
      setWeakTopics(data.weak_topics);
      setLessonLoaded(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">MentorVerse Learning Studio</p>
          <h1 className="text-3xl font-semibold text-white md:text-4xl">Build your understanding with multiple AI agents.</h1>
          <p className="text-sm leading-6 text-slate-300">Enter a topic, let the teacher agent explain it, and let the cognitive, adaptive, mentor, evaluation, and analysis agents personalize the lesson.</p>
        </div>
        <AuthPanel />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-2xl shadow-violet-900/20 backdrop-blur">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">Learning topic</span>
                <input
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  placeholder="Binary Search"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
                />
              </label>
              <button
                type="button"
                onClick={fetchLesson}
                disabled={loading || topic.trim().length < 2}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-3 font-medium text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4" />
                Start Learning
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-4 text-sm text-cyan-100">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-cyan-200/80">
                <Brain className="h-4 w-4" />
                AI Conversation
              </div>
              {explanation ? (
                <div className="mt-3 space-y-3">
                  <div className="rounded-2xl rounded-tl-md bg-white/5 p-4 text-slate-100">{explanation}</div>
                  <div className="rounded-2xl rounded-tr-md border border-violet-400/20 bg-violet-400/10 p-4 text-violet-50">{question}</div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-300">Generate a topic to see a chat-style explanation and question.</p>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-2xl shadow-cyan-900/10 backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
              <Lightbulb className="h-4 w-4 text-amber-300" />
              Question Card
            </div>
            <p className="mt-3 text-lg font-semibold text-white">{question || 'Your question will appear here after the lesson starts.'}</p>
            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-medium text-slate-200">Your answer</span>
              <textarea
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                rows={5}
                placeholder="Write your response in a few sentences..."
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
              />
            </label>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={submitAnswer}
                disabled={loading || !lessonLoaded || answer.trim().length === 0}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-medium text-white transition hover:border-cyan-400/50 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircle2 className="h-4 w-4" />
                Submit Answer
              </button>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                Difficulty: <span className="font-semibold text-white">{level}</span>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                Confidence: <span className="font-semibold text-white">{confidencePercent}%</span>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <MetricCard title="Confidence" value={`${confidencePercent}%`} helper="Cognitive agent output" />
            <MetricCard title="Difficulty" value={level} helper="Adaptive agent output" />
            <MetricCard title="Attention" value={attentionStatus} helper="Attention agent output" />
          </section>

          <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              Feedback
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-300">{feedback || 'Your personalized mentor feedback will appear here after a response is evaluated.'}</p>
            {weakTopics.length > 0 ? (
              <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-amber-200/80">Weak topics</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {weakTopics.map((item) => (
                    <span key={item} className="rounded-full bg-black/20 px-3 py-1 text-sm text-amber-100">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        </div>

        <div className="space-y-6">
          <AttentionMonitor onStatusChange={setAttentionStatus} />
          <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Session Summary</p>
            <div className="mt-4 space-y-4 text-sm text-slate-300">
              <SummaryRow label="Topic" value={topic || '—'} />
              <SummaryRow label="Status" value={attentionStatus} />
              <SummaryRow label="Response" value={lessonLoaded ? 'Tracked' : 'Waiting'} />
            </div>
            {loading ? <div className="mt-5"><LoadingSpinner /></div> : null}
            {error ? <p className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">{error}</p> : null}
          </section>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, helper }: { title: string; value: string; helper: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{helper}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <span>{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}
