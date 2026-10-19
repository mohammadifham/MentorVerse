'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Brain,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  Mic,
  MicOff,
  AlertCircle,
  BookOpen,
  Check,
  Code2,
  Copy,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Send,
  Bookmark,
  BookmarkCheck,
  Trash2,
  HelpCircle,
  Layers,
  Zap,
  Baby,
  FileText,
  MessageSquare
} from 'lucide-react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { AuthPanel } from '@/components/auth-panel';
import { AttendanceTracker } from '@/components/attendance-tracker';
import {
  getFirebaseAuth,
  onAuthStateChanged,
  getCurrentUnifiedUser,
  type UnifiedUser
} from '@/lib/firebase';
import { voiceCommandService } from '@/lib/voice-service';
import type { AnswerEvaluation, AttentionStatus, LearningResponse, TeachingMode } from '@/lib/types';

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

interface ChatMessage {
  id: string;
  sender: 'user' | 'teacher';
  text: string;
  example?: string;
  timestamp: string;
}

interface SavedNote {
  id: string;
  topic: string;
  mode: string;
  explanation: string;
  example?: string;
  savedAt: string;
}

const QUICK_PROMPTS = [
  'Binary Search in Python',
  'Quicksort algorithm step-by-step',
  'Dynamic Programming 0/1 Knapsack',
  'React useState vs useEffect',
  'REST API vs GraphQL architecture',
  'Dijkstra shortest path algorithm'
];

const TEACHING_MODES: Array<{
  id: TeachingMode;
  label: string;
  icon: typeof Brain;
  desc: string;
}> = [
  { id: 'standard', label: 'Comprehensive', icon: Brain, desc: 'Deep conceptual foundations & engineering mechanics' },
  { id: 'eli5', label: "Explain Like I'm 5", icon: Baby, desc: 'Everyday analogies & zero confusing jargon' },
  { id: 'hands_on', label: 'Hands-on Code', icon: Code2, desc: 'Code walkthroughs, syntax logic & implementation' },
  { id: 'quick', label: 'Quick Revision', icon: Zap, desc: 'High-yield cheat sheet & exam/interview takeaways' }
];

export function LearnWorkspace() {
  const [topic, setTopic] = useState('Binary Search');
  const [teachingMode, setTeachingMode] = useState<TeachingMode>('standard');
  const [question, setQuestion] = useState('');
  const [explanation, setExplanation] = useState('');
  const [example, setExample] = useState('');
  const [misconceptions, setMisconceptions] = useState('');
  const [copiedExp, setCopiedExp] = useState(false);
  const [copiedEx, setCopiedEx] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);

  // Audio / Speech State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Follow-Up Q&A Thread
  const [followUpQuery, setFollowUpQuery] = useState('');
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [followUpMessages, setFollowUpMessages] = useState<ChatMessage[]>([]);

  // Socratic Evaluation State
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
  const [user, setUser] = useState<UnifiedUser | null>(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [responseTime, setResponseTime] = useState(0);

  // Speech Recognition (Voice Input for student answers)
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  const [evaluation, setEvaluation] = useState<AnswerEvaluation | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const voiceUsingRef = useRef<boolean>(false);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const evalCardRef = useRef<HTMLDivElement | null>(null);

  const confidencePercent = useMemo(() => Math.round(confidence * 100), [confidence]);

  // Load saved notes from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mentorverse_study_notes');
      if (stored) {
        setSavedNotes(JSON.parse(stored) as SavedNote[]);
      }
    } catch {}
  }, []);

  // Save notes helper
  const saveCurrentLessonToNotes = () => {
    if (!explanation) return;
    const newNote: SavedNote = {
      id: `note_${Date.now()}`,
      topic: topic || 'Lesson',
      mode: teachingMode,
      explanation,
      example: example || undefined,
      savedAt: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    const updated = [newNote, ...savedNotes.filter((n) => n.topic !== topic)];
    setSavedNotes(updated);
    try {
      localStorage.setItem('mentorverse_study_notes', JSON.stringify(updated));
    } catch {}
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2500);
  };

  const deleteNote = (id: string) => {
    const updated = savedNotes.filter((n) => n.id !== id);
    setSavedNotes(updated);
    try {
      localStorage.setItem('mentorverse_study_notes', JSON.stringify(updated));
    } catch {}
  };

  // Auth synchronization
  useEffect(() => {
    try {
      const auth = getFirebaseAuth();
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });
      return () => unsubscribe();
    } catch {
      setUser(null);
    }
  }, []);

  // Browser Text-To-Speech SpeechSynthesis Integration
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setError('Text-to-speech is not supported in this browser.');
      return;
    }

    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      return;
    }

    if (isSpeaking && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown syntax for smooth spoken narration
    const cleanSpeech = explanation
      .replace(/[*#`_\[\]()]/g, '')
      .replace(/\n+/g, '. ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
  };

  // Voice Recognition Handlers (Student Voice Answer)
  useEffect(() => {
    const checkVoiceSupport = () => {
      setVoiceSupported(voiceCommandService.isSupported());
    };
    setTimeout(checkVoiceSupport, 0);

    if (voiceCommandService.isSupported()) {
      voiceCommandService.onStart(() => {
        setIsListening(true);
        setVoiceTranscript('');
      });
      voiceCommandService.onResult((result) => {
        setVoiceTranscript(result.transcript);
      });
      voiceCommandService.onError((err) => {
        setError(`Voice recognition error: ${err}`);
        setIsListening(false);
      });
      voiceCommandService.onEnd(() => {
        setIsListening(false);
      });
    }

    return () => {
      if (voiceCommandService.isSupported()) {
        voiceCommandService.abort();
      }
    };
  }, []);

  // Main Lesson Request via Real Chatbot API
  const fetchLesson = async (overrideTopic?: string, selectedMode?: TeachingMode) => {
    handleStopSpeech();
    const activeUser = user || getCurrentUnifiedUser();
    if (!activeUser) {
      setError('Please log in or create an account to start your learning session.');
      return;
    }

    const currentTopic = (typeof overrideTopic === 'string' ? overrideTopic : topic).trim();
    if (currentTopic.length < 1) {
      setError('Please enter a question or topic to ask the AI.');
      return;
    }

    const activeMode = selectedMode ?? teachingMode;

    if (overrideTopic && overrideTopic !== topic) {
      setTopic(overrideTopic);
    }

    setLoading(true);
    setError(null);
    setNotice(null);
    setEvaluation(null);
    setFollowUpMessages([]);

    try {
      const idToken = await activeUser.getIdToken();
      const response = await fetch('/api/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({
          topic: currentTopic,
          mode: activeMode,
          userId: activeUser.uid
        })
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || 'Failed to generate lesson.');
      }

      const data = (await response.json()) as LearningResponse;
      setExplanation(data.explanation);
      setExample(data.example || '');
      setQuestion(data.question);
      setMisconceptions(data.misconceptions || '');

      const confValue =
        typeof data.confidence === 'number'
          ? data.confidence > 1
            ? data.confidence / 100
            : data.confidence
          : 0.5;
      setConfidence(confValue);

      setLevel(data.level);
      setFeedback(data.feedback);
      setWeakTopics(data.weak_topics);
      setSessionCount((prev) => prev + 1);
      setResponseTime(0);
      startedAtRef.current = Date.now();
      setLessonLoaded(true);
      setAnswer('');
      setNotice('Lesson dynamically generated by live AI tutor! Ready for study & practice.');
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // Follow-Up Q&A with Teacher Agent
  const handleAskFollowUp = async () => {
    if (!followUpQuery.trim() || followUpLoading) return;

    const activeUser = user || getCurrentUnifiedUser();
    if (!activeUser) {
      setError('Please log in to continue the discussion.');
      return;
    }

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: followUpQuery.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setFollowUpMessages((prev) => [...prev, userMsg]);
    const sentQuery = followUpQuery.trim();
    setFollowUpQuery('');
    setFollowUpLoading(true);

    try {
      const idToken = await activeUser.getIdToken();
      const response = await fetch('/api/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({
          topic,
          followUp: sentQuery,
          mode: teachingMode,
          userId: activeUser.uid
        })
      });

      if (!response.ok) throw new Error('Could not get teacher follow-up answer.');

      const data = (await response.json()) as LearningResponse;
      const teacherMsg: ChatMessage = {
        id: `msg_teacher_${Date.now()}`,
        sender: 'teacher',
        text: data.explanation,
        example: data.example,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setFollowUpMessages((prev) => [...prev, teacherMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Follow-up query failed.');
    } finally {
      setFollowUpLoading(false);
      setTimeout(() => {
        chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // Submit Answer to Practice Question
  const submitAnswer = async () => {
    if (!question) {
      setError('Ask a question or generate a lesson first.');
      return;
    }

    const activeUser = user || getCurrentUnifiedUser();
    if (!activeUser) {
      setError('Please log in to submit your answer for evaluation.');
      return;
    }

    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const idToken = await activeUser.getIdToken();
      const calcResponseTime = startedAtRef.current
        ? Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000))
        : 0;
      setResponseTime(calcResponseTime);

      const response = await fetch('/api/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({
          topic,
          answer,
          responseTime: calcResponseTime,
          question,
          mode: teachingMode,
          userId: activeUser.uid
        })
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || 'Failed to evaluate answer.');
      }

      const data = (await response.json()) as LearningResponse;
      if (data.explanation) setExplanation(data.explanation);
      if (data.example) setExample(data.example);
      if (data.question) setQuestion(data.question);
      if (data.evaluation) {
        setEvaluation(data.evaluation);
        setTimeout(() => {
          evalCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 120);
      }

      const confValue =
        typeof data.confidence === 'number'
          ? data.confidence > 1
            ? data.confidence / 100
            : data.confidence
          : confidence;
      setConfidence(confValue);

      setLevel(data.level);
      setFeedback(data.feedback);
      setWeakTopics(data.weak_topics);
      setLessonLoaded(true);
      const verdictText = data.evaluation?.verdict === 'correct'
        ? '✓ Correct answer!'
        : data.evaluation?.verdict === 'partially_correct'
        ? '⚠ Partially correct!'
        : 'Answer evaluated.';
      setNotice(`${verdictText} Graded by AI Teacher! Score: ${data.evaluation?.score ?? Math.round(confValue * 100)}%.`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const startVoiceCommand = () => {
    if (!voiceCommandService.isSupported()) {
      setError('Voice recognition is not supported in your browser.');
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
      setAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setNotice(`Voice input captured (${transcript.length} chars). Click "Submit Answer" to evaluate.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80 font-medium">
              Live Real AI Tutor & Chatbot Ecosystem
            </p>
          </div>
          <h1 className="text-3xl font-semibold text-white md:text-4xl">
            Learn anything with a real interactive AI Teacher.
          </h1>
          <p className="text-sm leading-6 text-slate-300">
            Powered 100% by live generative AI (OpenAI, Gemini & Groq architectures). Ask questions, switch
            teaching modes, listen to audio narration, and engage in multi-turn follow-up conversations.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={() => setShowNotesDrawer(!showNotesDrawer)}
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-cyan-400/50 hover:bg-white/10"
          >
            <Bookmark className="h-4 w-4 text-cyan-400" />
            Study Notes ({savedNotes.length})
          </button>
          <AuthPanel />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          {/* Query & Mode Selection Card */}
          <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-2xl shadow-violet-900/20 backdrop-blur">
            {/* Teaching Mode Selector */}
            <div className="mb-4">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Select Teaching Mode
              </span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {TEACHING_MODES.map((mode) => {
                  const Icon = mode.icon;
                  const active = teachingMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => {
                        setTeachingMode(mode.id);
                        if (explanation) {
                          void fetchLesson(topic, mode.id);
                        }
                      }}
                      className={`flex flex-col items-start gap-1 rounded-2xl border p-3 text-left transition ${
                        active
                          ? 'border-cyan-400 bg-cyan-500/10 text-cyan-200 shadow-md shadow-cyan-500/10'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        <Icon className={`h-3.5 w-3.5 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                        <span>{mode.label}</span>
                      </div>
                      <span className="text-[10px] leading-tight text-slate-400">{mode.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Bar */}
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">
                  Ask the AI Teacher anything or type any topic
                </span>
                <input
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey && topic.trim()) {
                      event.preventDefault();
                      void fetchLesson();
                    }
                  }}
                  placeholder="e.g. 'Binary Search in Python', 'Dynamic Programming', 'React Hooks', 'REST API Architecture'..."
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
                />
              </label>
              <button
                type="button"
                onClick={() => void fetchLesson()}
                disabled={loading || topic.trim().length < 1}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-3 font-medium text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4" />
                Ask Teacher
              </button>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Quick suggestions:</span>
              {QUICK_PROMPTS.map((promptText) => (
                <button
                  key={promptText}
                  type="button"
                  onClick={() => void fetchLesson(promptText)}
                  disabled={loading}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 transition hover:border-cyan-400/40 hover:bg-white/10 hover:text-cyan-200 active:scale-95 disabled:opacity-50"
                >
                  {promptText}
                </button>
              ))}
            </div>

            {/* Live Teacher Lesson Display */}
            <div className="mt-5 rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-4 text-sm text-cyan-100">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-[0.25em] text-cyan-200/80">
                <span className="flex items-center gap-2 font-semibold">
                  <Brain className="h-4 w-4 text-cyan-400" />
                  AI Teacher Lesson
                </span>
                <div className="flex items-center gap-2 tracking-normal lowercase">
                  {explanation && (
                    <>
                      {/* Audio Narration Button */}
                      <button
                        type="button"
                        onClick={handleSpeak}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
                          isSpeaking
                            ? 'border-cyan-400 bg-cyan-400/20 text-cyan-200 shadow-md shadow-cyan-500/20'
                            : 'border-white/15 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {isSpeaking ? (
                          isPaused ? (
                            <Play className="h-3 w-3" />
                          ) : (
                            <Pause className="h-3 w-3 animate-pulse" />
                          )
                        ) : (
                          <Volume2 className="h-3 w-3" />
                        )}
                        <span>{isSpeaking ? (isPaused ? 'Resume' : 'Speaking...') : 'Listen to Teacher'}</span>
                      </button>

                      {isSpeaking && (
                        <button
                          type="button"
                          onClick={handleStopSpeech}
                          className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/20"
                          title="Stop voice"
                        >
                          <VolumeX className="h-3 w-3" />
                        </button>
                      )}

                      {/* Bookmark / Save to Notes */}
                      <button
                        type="button"
                        onClick={saveCurrentLessonToNotes}
                        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300 hover:bg-emerald-500/20 transition"
                      >
                        {noteSaved ? <BookmarkCheck className="h-3 w-3" /> : <Bookmark className="h-3 w-3" />}
                        <span>{noteSaved ? 'Saved!' : 'Save Note'}</span>
                      </button>
                    </>
                  )}

                  {lessonLoaded && topic && (
                    <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-0.5 text-[10px] text-cyan-300">
                      topic: {topic}
                    </span>
                  )}
                </div>
              </div>

              {explanation ? (
                <div className="mt-4 space-y-4">
                  {/* Explanation Card */}
                  <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-4 text-slate-100 shadow-lg">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-300">
                        <BookOpen className="h-4 w-4 text-cyan-400" />
                        Teacher Explanation & Concept Breakdown
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(explanation);
                          setCopiedExp(true);
                          setTimeout(() => setCopiedExp(false), 2000);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 transition hover:bg-white/10"
                      >
                        {copiedExp ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedExp ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="whitespace-pre-line text-sm leading-relaxed text-slate-200">
                      {explanation}
                    </div>
                  </div>

                  {/* Concrete Example Card */}
                  {example ? (
                    <div className="rounded-2xl border border-emerald-500/25 bg-slate-950/85 p-4 text-emerald-100 shadow-lg">
                      <div className="mb-2.5 flex items-center justify-between">
                        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                          <Code2 className="h-4 w-4" />
                          Concrete Example & Real-World Walkthrough
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(example);
                            setCopiedEx(true);
                            setTimeout(() => setCopiedEx(false), 2000);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300 transition hover:bg-emerald-500/20"
                        >
                          {copiedEx ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          {copiedEx ? 'Copied!' : 'Copy Code'}
                        </button>
                      </div>
                      <pre className="overflow-x-auto rounded-xl bg-black/60 p-3.5 font-mono text-xs text-emerald-200 leading-relaxed whitespace-pre-wrap border border-emerald-500/10">
                        {example}
                      </pre>
                    </div>
                  ) : null}

                  {/* Common Misconceptions (if present) */}
                  {misconceptions ? (
                    <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 text-amber-100 shadow-md">
                      <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300">
                        <AlertCircle className="h-4 w-4 text-amber-400" />
                        Common Misconceptions & Traps
                      </div>
                      <p className="text-sm leading-relaxed text-amber-200/90">{misconceptions}</p>
                    </div>
                  ) : null}

                  {/* Practice Question Banner */}
                  <div className="rounded-2xl border border-violet-400/25 bg-violet-400/10 p-4 text-violet-50">
                    <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-300">
                      <Lightbulb className="h-4 w-4 text-amber-300" />
                      Interactive Practice Question
                    </div>
                    <p className="text-sm font-medium leading-relaxed">{question}</p>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-300">
                  Ask any question or pick a quick suggestion above to see an accurate, detailed explanation
                  with concrete examples.
                </p>
              )}
            </div>
          </section>

          {/* Interactive Multi-Turn Follow-Up Q&A Thread */}
          {explanation && (
            <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-2xl shadow-cyan-900/10 backdrop-blur">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <MessageSquare className="h-4 w-4 text-cyan-400" />
                Ask Teacher a Follow-Up Question
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Have a question about this lesson? Ask for simpler explanations, more examples, or how it
                applies to other languages/scenarios.
              </p>

              {/* Chat Thread Messages */}
              {followUpMessages.length > 0 && (
                <div className="mt-4 max-h-80 space-y-3 overflow-y-auto rounded-2xl border border-white/5 bg-black/40 p-4">
                  {followUpMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.sender === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-gradient-to-r from-cyan-600 to-violet-600 text-white'
                            : 'border border-white/10 bg-slate-900 text-slate-200'
                        }`}
                      >
                        <p className="font-semibold text-[11px] mb-1 opacity-70">
                          {msg.sender === 'user' ? 'You' : 'AI Teacher'} • {msg.timestamp}
                        </p>
                        <div className="whitespace-pre-line">{msg.text}</div>
                        {msg.example && (
                          <pre className="mt-2 overflow-x-auto rounded-xl bg-black/50 p-2.5 font-mono text-xs text-emerald-300 whitespace-pre-wrap border border-emerald-500/20">
                            {msg.example}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={chatScrollRef} />
                </div>
              )}

              {/* Follow-up input */}
              <div className="mt-3 flex gap-2">
                <input
                  value={followUpQuery}
                  onChange={(e) => setFollowUpQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      void handleAskFollowUp();
                    }
                  }}
                  disabled={followUpLoading}
                  placeholder="e.g. 'Can you explain step 2 simpler?', 'How would I write this in Java?'"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
                />
                <button
                  type="button"
                  onClick={() => void handleAskFollowUp()}
                  disabled={followUpLoading || !followUpQuery.trim()}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-cyan-500 px-4 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-cyan-400 active:scale-95 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  Ask
                </button>
              </div>
            </section>
          )}

          {/* Socratic Student Answer & Evaluation Card */}
          <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-2xl shadow-cyan-900/10 backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
              <Lightbulb className="h-4 w-4 text-amber-300" />
              Practice Question Assessment
            </div>
            <p className="mt-3 text-lg font-semibold text-white">
              {question || 'Your practice question will appear here after the lesson starts.'}
            </p>
            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-medium text-slate-200">Your answer</span>
              <textarea
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                rows={4}
                placeholder="Write your explanation or code in a few sentences..."
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
              />
              {voiceSupported && isListening && (
                <div className="mt-2 rounded-lg border border-cyan-400/30 bg-cyan-400/5 p-3">
                  <p className="flex items-center gap-2 text-sm text-cyan-300">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                    Listening... Speak your answer now.
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
                  <span className="text-xs text-amber-300">Voice not supported in this browser</span>
                </div>
              )}
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                Difficulty: <span className="font-semibold text-white">{level}</span>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                Confidence: <span className="font-semibold text-white">{confidencePercent}%</span>
              </div>
            </div>

            {/* Real AI Grading & Answer Verdict Card */}
            {evaluation && (
              <div
                ref={evalCardRef}
                className={`mt-5 rounded-2xl border p-5 shadow-2xl transition-all ${
                  evaluation.verdict === 'correct'
                    ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-100 shadow-emerald-950/40'
                    : evaluation.verdict === 'partially_correct'
                    ? 'border-amber-500/40 bg-amber-950/40 text-amber-100 shadow-amber-950/40'
                    : 'border-rose-500/40 bg-rose-950/40 text-rose-100 shadow-rose-950/40'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${
                        evaluation.verdict === 'correct'
                          ? 'border-emerald-400/40 bg-emerald-500/20 text-emerald-300'
                          : evaluation.verdict === 'partially_correct'
                          ? 'border-amber-400/40 bg-amber-500/20 text-amber-300'
                          : 'border-rose-400/40 bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {evaluation.verdict === 'correct' ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <AlertCircle className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Teacher Evaluation Verdict
                      </p>
                      <h4 className="text-xl font-bold text-white flex items-center gap-2">
                        {evaluation.verdict === 'correct' && '✅ Correct Answer!'}
                        {evaluation.verdict === 'partially_correct' && '⚠️ Partially Correct'}
                        {evaluation.verdict === 'incorrect' && '❌ Incorrect / Incomplete'}
                      </h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-white/20 bg-black/40 px-3.5 py-1 text-sm font-bold text-white">
                      Score: {evaluation.score}%
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                        evaluation.verdict === 'correct'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : evaluation.verdict === 'partially_correct'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {evaluation.verdictTitle}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-3 text-sm">
                  {/* What you got right */}
                  <div className="rounded-xl border border-emerald-500/20 bg-black/40 p-4">
                    <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5">
                      <Check className="h-4 w-4" />
                      What You Understood Correctly
                    </p>
                    <p className="text-slate-200 leading-relaxed">{evaluation.whatYouGotRight}</p>
                  </div>

                  {/* What was missing or needs improvement */}
                  <div className="rounded-xl border border-amber-500/20 bg-black/40 p-4">
                    <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5">
                      <AlertCircle className="h-4 w-4" />
                      What Was Missing or Needs Clarification
                    </p>
                    <p className="text-slate-200 leading-relaxed">{evaluation.whatWasMissing}</p>
                  </div>

                  {/* Teacher guidance & model answer */}
                  <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/40 p-4">
                    <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-300 mb-1.5">
                      <Sparkles className="h-4 w-4" />
                      Teacher Guidance & Model Answer
                    </p>
                    <p className="text-cyan-100 leading-relaxed">{evaluation.teacherAdvice}</p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Metric Cards */}
          <section className="grid gap-4 md:grid-cols-3">
            <MetricCard title="Confidence" value={`${confidencePercent}%`} helper="Cognitive agent output" />
            <MetricCard title="Difficulty" value={level} helper="Adaptive agent output" />
            <MetricCard title="Attention" value={attentionStatus} helper="Attention agent output" />
          </section>

          {/* Mentor Feedback Card */}
          <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              Socratic Mentor Feedback
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {feedback ||
                'Your personalized mentor feedback will appear here after a response is evaluated.'}
            </p>
            {weakTopics.length > 0 ? (
              <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-amber-200/80">Reinforce Topics</p>
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

        {/* Right Sidebar: Attention, Attendance & Study Notes */}
        <div className="space-y-6">
          <AttentionMonitor onStatusChange={setAttentionStatus} />
          <AttendanceTracker
            existingSessions={sessionCount}
            responseTime={responseTime}
            answerProvided={answer.trim().length > 0}
            attentionStatus={attentionStatus}
            voiceCommandUsed={voiceUsingRef.current}
          />

          {/* Saved Study Notes Widget */}
          {showNotesDrawer && (
            <section className="rounded-3xl border border-cyan-500/30 bg-slate-950/90 p-5 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Bookmark className="h-4 w-4 text-cyan-400" />
                  Saved Study Notes
                </span>
                <span className="text-xs text-slate-400">{savedNotes.length} saved</span>
              </div>
              {savedNotes.length === 0 ? (
                <p className="text-xs text-slate-400">
                  No notes saved yet. Click &quot;Save Note&quot; during any lesson to bookmark it here!
                </p>
              ) : (
                <div className="max-h-72 space-y-2.5 overflow-y-auto">
                  {savedNotes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-slate-200 space-y-1"
                    >
                      <div className="flex items-center justify-between font-semibold text-cyan-300">
                        <span>{note.topic}</span>
                        <button
                          type="button"
                          onClick={() => deleteNote(note.id)}
                          className="text-slate-500 hover:text-rose-400 transition"
                          title="Delete note"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="line-clamp-2 text-slate-400">{note.explanation}</p>
                      <p className="text-[10px] text-slate-500">
                        Mode: {note.mode} • {note.savedAt}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Session Overview */}
          <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Session Summary</p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <SummaryRow label="Topic" value={topic || '—'} />
              <SummaryRow label="Teaching Mode" value={teachingMode.toUpperCase()} />
              <SummaryRow label="Attention" value={attentionStatus} />
              <SummaryRow label="Completed Sessions" value={sessionCount.toString()} />
              <SummaryRow label="Response Time" value={responseTime > 0 ? `${responseTime}s` : '—'} />
            </div>
            {loading ? (
              <div className="mt-5">
                <LoadingSpinner />
              </div>
            ) : null}
            {notice ? (
              <p className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
                {notice}
              </p>
            ) : null}
            {error ? (
              <p className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
                {error}
              </p>
            ) : null}
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
