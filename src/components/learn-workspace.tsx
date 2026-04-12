'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Brain, CheckCircle2, Lightbulb, Sparkles, Mic, MicOff, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { AuthPanel } from '@/components/auth-panel';
import { AttendanceTracker } from '@/components/attendance-tracker';
import { getFirebaseAuth } from '@/lib/firebase';
import { voiceCommandService } from '@/lib/voice-service';
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
  const [notice, setNotice] = useState<string | null>(null);
  const [attentionStatus, setAttentionStatus] = useState<AttentionStatus>('Preparing');
  const [lessonLoaded, setLessonLoaded] = useState(false);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [sessionCount, setSessionCount] = useState(0);
  const [responseTime, setResponseTime] = useState(0);
  const startedAtRef = useRef<number | null>(null);
  const voiceUsingRef = useRef<boolean>(false);

  const confidencePercent = useMemo(() => Math.round(confidence * 100), [confidence]);

  useEffect(() => {
    try {
      const auth = getFirebaseAuth();
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUserId(currentUser?.uid);
      });

      return () => unsubscribe();
    } catch {
      setUserId(undefined);
    }
  }, []);

  useEffect(() => {
    // Check if voice commands are supported (client-side only)
    const checkVoiceSupport = () => {
      const supported = voiceCommandService.isSupported();
      setVoiceSupported(supported);
    };

    // Small delay to ensure DOM is ready
    setTimeout(checkVoiceSupport, 0);

    // Setup voice recognition handlers
    const setupVoiceHandlers = () => {
      if (voiceCommandService.isSupported()) {
        voiceCommandService.onStart(() => {
          setIsListening(true);
          setVoiceTranscript('');
        });

        voiceCommandService.onResult((result) => {
          setVoiceTranscript(result.transcript);
        });

        voiceCommandService.onError((error) => {
          setError(`Voice recognition error: ${error}`);
          setIsListening(false);
        });

        voiceCommandService.onEnd(() => {
          setIsListening(false);
        });
      }
    };

    setupVoiceHandlers();

    return () => {
      if (voiceCommandService.isSupported()) {
        voiceCommandService.abort();
      }
    };
  }, []);

  const fetchLesson = async () => {
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setError('Please sign in to start a learning session.');
      return;
    }

    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const idToken = await currentUser.getIdToken();
      const response = await fetch('/api/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ topic, userId })
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || 'Failed to load lesson.');
      }

      const data = (await response.json()) as LearningResponse;
      setExplanation(data.explanation);
      setQuestion(data.question);
      
      // Handle confidence - convert to 0-1 range if needed
      const confValue = typeof data.confidence === 'number' 
        ? (data.confidence > 1 ? data.confidence / 100 : data.confidence)
        : 0.5;
      setConfidence(confValue);
      
      setLevel(data.level);
      setFeedback(data.feedback);
      setWeakTopics(data.weak_topics);
      setSessionCount(prev => prev + 1); // Increment session count
      setResponseTime(0); // Reset response time for new session
      startedAtRef.current = Date.now();
      setLessonLoaded(true);
      setAnswer(''); // Clear previous answer
      setNotice('Lesson loaded. You can now submit your answer using text or voice!');
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

    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setError('Please sign in to submit your answer.');
      return;
    }

    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const idToken = await currentUser.getIdToken();
      const responseTime = startedAtRef.current ? Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000)) : 0;
      setResponseTime(responseTime);
      
      const response = await fetch('/api/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ topic, answer, responseTime, question, userId })
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || 'Failed to evaluate answer.');
      }

      const data = (await response.json()) as LearningResponse;
      setExplanation(data.explanation);
      setQuestion(data.question);
      
      // Handle confidence update
      const confValue = typeof data.confidence === 'number' 
        ? (data.confidence > 1 ? data.confidence / 100 : data.confidence)
        : confidence;
      setConfidence(confValue);
      
      setLevel(data.level);
      setFeedback(data.feedback);
      setWeakTopics(data.weak_topics);
      setLessonLoaded(true);
      setNotice(`Answer evaluated! Response time: ${responseTime}s. Voice used: ${voiceUsingRef.current ? 'Yes' : 'No'}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const startVoiceCommand = () => {
    if (!voiceCommandService.isSupported()) {
      setError('Voice recognition is not supported in your browser. Please use Chrome, Edge, Safari, or another modern browser.');
      return;
    }

    if (!lessonLoaded) {
      setError('Please start a learning session first by clicking "Start Learning".');
      return;
    }

    setError(null);
    voiceUsingRef.current = true;
    voiceCommandService.startListening({
      language: 'en-US',
      continuous: false,
      interimResults: true
    });
  };

  const stopVoiceCommand = () => {
    const transcript = voiceCommandService.stopListening();

    if (transcript) {
      // Append voice input to existing answer or replace if empty
      const updatedAnswer = answer
        ? `${answer} ${transcript}`
        : transcript;
      setAnswer(updatedAnswer);
      setNotice(`✓ Voice input captured (${transcript.length} characters). You can now submit your answer.`);
    } else {
      setNotice('No speech detected. Please try again.');
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
              {voiceSupported && isListening && (
                <div className="mt-2 rounded-lg border border-cyan-400/30 bg-cyan-400/5 p-3">
                  <p className="flex items-center gap-2 text-sm text-cyan-300">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                    Listening... Say your answer now.
                  </p>
                  {voiceTranscript && (
                    <p className="mt-2 text-sm text-cyan-100">
                      <strong>Heard:</strong> {voiceTranscript}
                    </p>
                  )}
                </div>
              )}
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
              {voiceSupported && (
                <button
                  type="button"
                  onClick={isListening ? stopVoiceCommand : startVoiceCommand}
                  disabled={loading}
                  className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-medium transition ${
                    isListening
                      ? 'border border-cyan-400/50 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/20'
                      : 'border border-white/10 bg-white/5 text-white hover:border-cyan-400/50 hover:bg-white/10'
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-4 w-4" />
                      Stop Listening
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4" />
                      Voice Answer
                    </>
                  )}
                </button>
              )}
              {!voiceSupported && (
                <div className="inline-flex items-center gap-2 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-2">
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                  <span className="text-xs text-amber-300">Voice not supported</span>
                </div>
              )}
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
          <AttendanceTracker
            existingSessions={sessionCount}
            responseTime={responseTime}
            answerProvided={answer.trim().length > 0}
            attentionStatus={attentionStatus}
            voiceCommandUsed={voiceUsingRef.current}
          />
          <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Session Summary</p>
            <div className="mt-4 space-y-4 text-sm text-slate-300">
              <SummaryRow label="Topic" value={topic || '—'} />
              <SummaryRow label="Status" value={attentionStatus} />
              <SummaryRow label="Sessions" value={sessionCount.toString()} />
              <SummaryRow label="Response Time" value={responseTime > 0 ? `${responseTime}s` : '—'} />
            </div>
            {loading ? <div className="mt-5"><LoadingSpinner /></div> : null}
            {notice ? <p className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">{notice}</p> : null}
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
