'use client';

import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Code2,
  Copy,
  ExternalLink,
  Flame,
  Lightbulb,
  MessageSquare,
  Pause,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  AlertCircle
} from 'lucide-react';
import { getCourseById } from '@/lib/courses-data';
import { getCurrentUnifiedUser } from '@/lib/firebase';
import type { AnswerEvaluation, CourseLesson, CourseModule, LearningResponse, TeachingMode } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';

export default function CoursePlayerPage() {
  const params = useParams();
  const courseId = typeof params?.courseId === 'string' ? params.courseId : '';
  const course = getCourseById(courseId);

  if (!course) {
    notFound();
  }

  // Active module & lesson selection
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeLessonId, setActiveLessonId] = useState(
    course.modules[0]?.lessons[0]?.id || ''
  );

  // Completed lessons progress tracking
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

  // AI Tutor Lesson Generation State
  const [teachingMode, setTeachingMode] = useState<TeachingMode>('standard');
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonData, setLessonData] = useState<LearningResponse | null>(null);
  const [lessonError, setLessonError] = useState<string | null>(null);
  const [copiedExp, setCopiedExp] = useState(false);
  const [copiedEx, setCopiedEx] = useState(false);

  // Audio Speech state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Student Practice Answer State
  const [studentAnswer, setStudentAnswer] = useState('');
  const [gradingLoading, setGradingLoading] = useState(false);
  const [answerEvaluation, setAnswerEvaluation] = useState<AnswerEvaluation | null>(null);

  // Embedded Code Lab State
  const [codeLanguage, setCodeLanguage] = useState<'python' | 'javascript'>('python');
  const [userCode, setUserCode] = useState('');
  const [codeRunning, setCodeRunning] = useState(false);
  const [codeOutput, setCodeOutput] = useState<{ stdout?: string; stderr?: string } | null>(null);

  // Collapsible module groups
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    [course.modules[0]?.id || '']: true
  });

  const evalRef = useRef<HTMLDivElement | null>(null);

  // Find currently active lesson and module
  const currentModule = course.modules[activeModuleIndex] || course.modules[0];
  const currentLesson: CourseLesson | undefined =
    course.modules.flatMap((m) => m.lessons).find((l) => l.id === activeLessonId) ||
    currentModule?.lessons[0];

  // Load progress from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('guidely_course_progress');
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, string[]>;
        setCompletedLessonIds(parsed[course.id] || []);
      }
    } catch {}
  }, [course.id]);

  // Sync starter code when active lesson changes
  useEffect(() => {
    if (currentLesson) {
      const starter =
        codeLanguage === 'python'
          ? currentLesson.starterCode?.python || `# Write your solution for: ${currentLesson.title}\n\ndef solve():\n    pass\n\nprint("Output:", solve())`
          : currentLesson.starterCode?.javascript || `// Write your solution for: ${currentLesson.title}\n\nfunction solve() {\n  return 0;\n}\nconsole.log("Output:", solve());`;
      setUserCode(starter);
      setStudentAnswer('');
      setAnswerEvaluation(null);
      setCodeOutput(null);
      handleStopSpeech();

      // Automatically fetch dynamic lesson from AI tutor
      void fetchLessonContent(currentLesson.topicQuery, teachingMode);
    }
  }, [currentLesson?.id, codeLanguage]);

  // Handle SpeechSynthesis cleanup
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (!lessonData?.explanation) return;

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
    const cleanText = lessonData.explanation.replace(/[*#`_\[\]()]/g, '').replace(/\n+/g, '. ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
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

  const toggleModuleAccordion = (modId: string) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  const toggleLessonComplete = (lessonId: string) => {
    let updated: string[];
    if (completedLessonIds.includes(lessonId)) {
      updated = completedLessonIds.filter((id) => id !== lessonId);
    } else {
      updated = [...completedLessonIds, lessonId];
    }
    setCompletedLessonIds(updated);
    try {
      const stored = localStorage.getItem('guidely_course_progress');
      const allProgress = stored ? (JSON.parse(stored) as Record<string, string[]>) : {};
      allProgress[course.id] = updated;
      localStorage.setItem('guidely_course_progress', JSON.stringify(allProgress));
    } catch {}
  };

  // Fetch Live AI Lesson
  const fetchLessonContent = async (query: string, mode: TeachingMode) => {
    setLessonLoading(true);
    setLessonError(null);
    try {
      const activeUser = getCurrentUnifiedUser();
      const idToken = activeUser ? await activeUser.getIdToken() : 'guest';
      const res = await fetch('/api/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({
          topic: query,
          mode,
          userId: activeUser?.uid || 'guest_student'
        })
      });
      if (!res.ok) throw new Error('Failed to generate lesson from AI Teacher.');
      const data = (await res.json()) as LearningResponse;
      setLessonData(data);
    } catch (err) {
      setLessonError(err instanceof Error ? err.message : 'Could not load AI lesson.');
    } finally {
      setLessonLoading(false);
    }
  };

  // Submit student answer for real AI grading
  const handleGradeAnswer = async () => {
    if (!studentAnswer.trim() || !currentLesson) return;
    setGradingLoading(true);
    try {
      const activeUser = getCurrentUnifiedUser();
      const idToken = activeUser ? await activeUser.getIdToken() : 'guest';
      const res = await fetch('/api/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({
          topic: currentLesson.topicQuery,
          question: lessonData?.question || currentLesson.practiceProblemPrompt || currentLesson.title,
          answer: studentAnswer.trim(),
          mode: teachingMode,
          userId: activeUser?.uid || 'guest_student'
        })
      });
      if (!res.ok) throw new Error('Evaluation request failed.');
      const data = (await res.json()) as LearningResponse;
      if (data.evaluation) {
        setAnswerEvaluation(data.evaluation);
        setTimeout(() => {
          evalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
    } catch (err) {
      console.error('Answer grading error:', err);
    } finally {
      setGradingLoading(false);
    }
  };

  // Run in-browser code snippet
  const handleRunCode = async () => {
    if (!userCode.trim()) return;
    setCodeRunning(true);
    setCodeOutput(null);
    try {
      const res = await fetch('/api/code/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: currentLesson?.id || 'sandbox',
          language: codeLanguage,
          version: codeLanguage === 'python' ? '3.10.0' : '18.15.0',
          code: userCode
        })
      });
      const data = (await res.json()) as { output?: string; error?: string };
      setCodeOutput({ stdout: data.output || '', stderr: data.error || '' });
    } catch (err) {
      setCodeOutput({ stderr: err instanceof Error ? err.message : 'Execution error' });
    } finally {
      setCodeRunning(false);
    }
  };

  const totalLessonsCount = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedPercent =
    totalLessonsCount > 0 ? Math.round((completedLessonIds.length / totalLessonsCount) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Course Header */}
      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-950/70 p-5 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to All Courses
          </Link>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">{course.title}</h1>
          <p className="text-xs text-slate-400">
            {course.subtitle} • <span className="text-cyan-300 font-semibold">{course.level} Level</span>
          </p>
        </div>

        {/* Overall Course Progress */}
        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5">
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Course Progress</p>
            <p className="text-base font-bold text-white">
              {completedPercent}% <span className="text-xs text-slate-400 font-normal">({completedLessonIds.length}/{totalLessonsCount})</span>
            </p>
          </div>
          <div className="h-10 w-10 rounded-full border-2 border-cyan-400/30 flex items-center justify-center font-bold text-xs text-cyan-300">
            {completedPercent}%
          </div>
        </div>
      </div>

      {/* Main Learning Studio: Sidebar + Active Lesson Content */}
      <div className="grid gap-6 lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr]">
        {/* Left Sidebar: Modules & Lessons Navigation */}
        <aside className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/70 p-4 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 px-2">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
              <BookOpen className="h-4 w-4 text-cyan-400" />
              Course Syllabus
            </span>
            <span className="text-[11px] text-slate-500">{course.modules.length} Modules</span>
          </div>

          <div className="space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {course.modules.map((mod, modIdx) => {
              const isExpanded = !!expandedModules[mod.id];
              return (
                <div key={mod.id} className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                  {/* Module Accordion Header */}
                  <button
                    type="button"
                    onClick={() => toggleModuleAccordion(mod.id)}
                    className="flex w-full items-center justify-between p-3 text-left transition hover:bg-white/5"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                        Module {modIdx + 1}
                      </span>
                      <h4 className="text-xs font-semibold text-white leading-snug">{mod.title}</h4>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    )}
                  </button>

                  {/* Lessons in this module */}
                  {isExpanded && (
                    <div className="border-t border-white/5 p-2 space-y-1 bg-black/20">
                      {mod.lessons.map((lesson) => {
                        const isActive = lesson.id === activeLessonId;
                        const isCompleted = completedLessonIds.includes(lesson.id);
                        return (
                          <div
                            key={lesson.id}
                            className={`group flex items-center justify-between rounded-xl px-2.5 py-2 text-xs transition ${
                              isActive
                                ? 'bg-cyan-500/20 text-cyan-100 border border-cyan-400/40 shadow-sm'
                                : 'text-slate-300 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setActiveModuleIndex(modIdx);
                                setActiveLessonId(lesson.id);
                              }}
                              className="flex items-center gap-2 text-left flex-1 truncate pr-2"
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                                  isActive ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'
                                }`}
                              />
                              <span className="truncate">{lesson.title}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleLessonComplete(lesson.id)}
                              className="text-slate-500 hover:text-emerald-400 transition"
                              title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                              ) : (
                                <Circle className="h-4 w-4 text-slate-600" />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right Main Lesson Panel */}
        <main className="space-y-6">
          {currentLesson ? (
            <>
              {/* Lesson Banner Card */}
              <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl backdrop-blur space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-300">
                        {currentModule.title}
                      </span>
                      <span className="text-xs text-slate-400">• {currentLesson.durationMinutes} mins</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white sm:text-3xl">{currentLesson.title}</h2>
                    <p className="text-sm text-slate-300">{currentLesson.description}</p>
                  </div>

                  {/* Mark complete button */}
                  <button
                    type="button"
                    onClick={() => toggleLessonComplete(currentLesson.id)}
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-semibold transition ${
                      completedLessonIds.includes(currentLesson.id)
                        ? 'border border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                        : 'border border-white/15 bg-white/5 text-slate-300 hover:border-emerald-400/50 hover:text-emerald-200'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      {completedLessonIds.includes(currentLesson.id)
                        ? 'Completed ✓'
                        : 'Mark as Completed'}
                    </span>
                  </button>
                </div>

                {/* Key Concepts Pills */}
                {currentLesson.keyConcepts && currentLesson.keyConcepts.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Core Concepts:
                    </span>
                    {currentLesson.keyConcepts.map((concept) => (
                      <span
                        key={concept}
                        className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-slate-300"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Real AI Teacher Instruction Section */}
              <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl backdrop-blur space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        Live AI Teacher Instruction
                      </h3>
                      <p className="text-xs text-slate-400">100% dynamically generated by real AI tutor</p>
                    </div>
                  </div>

                  {/* Mode Selector & Audio Speech */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Teaching Mode Pills */}
                    {(['standard', 'eli5', 'hands_on', 'quick'] as TeachingMode[]).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          setTeachingMode(mode);
                          void fetchLessonContent(currentLesson.topicQuery, mode);
                        }}
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition ${
                          teachingMode === mode
                            ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                            : 'border border-white/10 bg-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        {mode === 'standard' ? 'Comprehensive' : mode === 'eli5' ? 'ELI5' : mode === 'hands_on' ? 'Hands-on' : 'Quick'}
                      </button>
                    ))}

                    {/* Listen to Teacher Audio Button */}
                    {lessonData && (
                      <button
                        type="button"
                        onClick={handleSpeak}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
                          isSpeaking
                            ? 'border-cyan-400 bg-cyan-400/20 text-cyan-200'
                            : 'border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {isSpeaking ? (
                          isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3 animate-pulse" />
                        ) : (
                          <Volume2 className="h-3 w-3" />
                        )}
                        <span>{isSpeaking ? (isPaused ? 'Resume' : 'Speaking') : 'Listen'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Lesson Body Content */}
                {lessonLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-3 text-sm text-cyan-300">
                    <LoadingSpinner />
                    <p className="animate-pulse">AI Teacher is preparing your lesson and code breakdown...</p>
                  </div>
                ) : lessonError ? (
                  <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-200">
                    {lessonError}
                  </div>
                ) : lessonData ? (
                  <div className="space-y-4">
                    {/* Detailed Concept Breakdown */}
                    <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-5 text-slate-100 shadow-md">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-300">
                          <BookOpen className="h-4 w-4 text-cyan-400" />
                          Detailed Explanation & Mental Model
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(lessonData.explanation);
                            setCopiedExp(true);
                            setTimeout(() => setCopiedExp(false), 2000);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/10"
                        >
                          {copiedExp ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          {copiedExp ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <div className="whitespace-pre-line text-sm leading-relaxed text-slate-200">
                        {lessonData.explanation}
                      </div>
                    </div>

                    {/* Concrete Example / Code Walkthrough */}
                    {lessonData.example && (
                      <div className="rounded-2xl border border-emerald-500/25 bg-slate-950/90 p-5 text-emerald-100 shadow-md">
                        <div className="mb-2.5 flex items-center justify-between">
                          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                            <Code2 className="h-4 w-4" />
                            Concrete Code & Placement Example
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (lessonData.example) {
                                navigator.clipboard.writeText(lessonData.example);
                                setCopiedEx(true);
                                setTimeout(() => setCopiedEx(false), 2000);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300 hover:bg-emerald-500/20"
                          >
                            {copiedEx ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            {copiedEx ? 'Copied!' : 'Copy Code'}
                          </button>
                        </div>
                        <pre className="overflow-x-auto rounded-xl bg-black/60 p-4 font-mono text-xs text-emerald-200 leading-relaxed whitespace-pre-wrap border border-emerald-500/10">
                          {lessonData.example}
                        </pre>
                      </div>
                    )}

                    {/* Misconceptions card */}
                    {lessonData.misconceptions && (
                      <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-amber-100">
                        <p className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-1 flex items-center gap-1.5">
                          <AlertCircle className="h-4 w-4 text-amber-400" />
                          Common Interview Misconceptions & Gotchas
                        </p>
                        <p className="text-sm text-amber-200/90 leading-relaxed">
                          {lessonData.misconceptions}
                        </p>
                      </div>
                    )}
                  </div>
                ) : null}
              </section>

              {/* Socratic Practice Challenge & Real Answer Evaluation */}
              <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl backdrop-blur space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Lightbulb className="h-4 w-4 text-amber-300" />
                  Practice Interview Checkpoint
                </div>

                <div className="rounded-2xl border border-violet-500/25 bg-violet-500/10 p-4 text-violet-100">
                  <p className="text-xs font-semibold text-violet-300 uppercase tracking-wider mb-1">
                    Question to Answer:
                  </p>
                  <p className="text-sm font-semibold text-white leading-relaxed">
                    {lessonData?.question ||
                      currentLesson.practiceProblemPrompt ||
                      `How does ${currentLesson.title} work, and what is its time and space complexity?`}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="block text-xs font-medium text-slate-300">
                    Your Answer (Write in your own words to get AI graded):
                  </span>
                  <textarea
                    value={studentAnswer}
                    onChange={(e) => setStudentAnswer(e.target.value)}
                    rows={4}
                    placeholder="Type your explanation or logic here..."
                    className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleGradeAnswer}
                  disabled={gradingLoading || !studentAnswer.trim()}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{gradingLoading ? 'AI Teacher is Grading...' : 'Submit & Grade Answer'}</span>
                </button>

                {/* Real Answer Grading Verdict Card */}
                {answerEvaluation && (
                  <div
                    ref={evalRef}
                    className={`mt-4 rounded-2xl border p-5 shadow-2xl transition-all ${
                      answerEvaluation.verdict === 'correct'
                        ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-100 shadow-emerald-950/40'
                        : answerEvaluation.verdict === 'partially_correct'
                        ? 'border-amber-500/40 bg-amber-950/40 text-amber-100 shadow-amber-950/40'
                        : 'border-rose-500/40 bg-rose-950/40 text-rose-100 shadow-rose-950/40'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          AI Teacher Grading Verdict
                        </p>
                        <h4 className="text-lg font-bold text-white">
                          {answerEvaluation.verdict === 'correct' && '✅ Correct Answer!'}
                          {answerEvaluation.verdict === 'partially_correct' && '⚠️ Partially Correct'}
                          {answerEvaluation.verdict === 'incorrect' && '❌ Needs Reinforcement'}
                        </h4>
                      </div>
                      <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs font-bold text-white">
                        Score: {answerEvaluation.score}%
                      </span>
                    </div>

                    <div className="mt-3 space-y-2 text-xs">
                      <div className="rounded-xl bg-black/30 p-3 border border-emerald-500/20">
                        <p className="font-bold text-emerald-300 uppercase tracking-wider mb-1">
                          ✓ What You Understood:
                        </p>
                        <p className="text-slate-200">{answerEvaluation.whatYouGotRight}</p>
                      </div>

                      <div className="rounded-xl bg-black/30 p-3 border border-amber-500/20">
                        <p className="font-bold text-amber-300 uppercase tracking-wider mb-1">
                          ⚠ What Was Missing / Needs Improvement:
                        </p>
                        <p className="text-slate-200">{answerEvaluation.whatWasMissing}</p>
                      </div>

                      <div className="rounded-xl bg-cyan-950/30 p-3 border border-cyan-500/30">
                        <p className="font-bold text-cyan-300 uppercase tracking-wider mb-1">
                          💡 Teacher Guidance:
                        </p>
                        <p className="text-cyan-100">{answerEvaluation.teacherAdvice}</p>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Integrated Code Execution Lab */}
              <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl backdrop-blur space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-5 w-5 text-cyan-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        Interactive Code Lab
                      </h3>
                      <p className="text-xs text-slate-400">Run & test code for this lesson live</p>
                    </div>
                  </div>

                  {/* Language Selector */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCodeLanguage('python')}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                        codeLanguage === 'python'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                          : 'border border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      Python 3
                    </button>
                    <button
                      type="button"
                      onClick={() => setCodeLanguage('javascript')}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                        codeLanguage === 'javascript'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                          : 'border border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      JavaScript
                    </button>
                    <button
                      type="button"
                      onClick={handleRunCode}
                      disabled={codeRunning}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>{codeRunning ? 'Running...' : 'Run Code'}</span>
                    </button>
                  </div>
                </div>

                {/* Code Editor Area */}
                <textarea
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  rows={8}
                  className="w-full rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-xs text-emerald-300 outline-none focus:border-cyan-400/60 leading-relaxed"
                />

                {/* Console Output */}
                {codeOutput && (
                  <div className="rounded-2xl border border-white/10 bg-black/80 p-4 space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Terminal Output:
                    </p>
                    {codeOutput.stdout ? (
                      <pre className="font-mono text-xs text-emerald-400 whitespace-pre-wrap">
                        {codeOutput.stdout}
                      </pre>
                    ) : null}
                    {codeOutput.stderr ? (
                      <pre className="font-mono text-xs text-rose-400 whitespace-pre-wrap">
                        {codeOutput.stderr}
                      </pre>
                    ) : null}
                  </div>
                )}
              </section>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}
