'use client';

import Link from 'next/link';
import type { ComponentType, MouseEvent } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { ArrowRight, BookOpenCheck, Bot, Brain, ChartNoAxesCombined, CheckCircle2, LineChart, ShieldCheck, Sparkles, TimerReset, Users } from 'lucide-react';

const highlights = [
  {
    title: 'DSA, CS core, and engineering roadmaps',
    description: 'Learn with structured paths for coding interviews, core CSE subjects, and semester-focused engineering prep.'
  },
  {
    title: 'Coding progress analytics',
    description: 'Track topic mastery across DSA, OOP, DBMS, OS, CN, and aptitude with confidence and speed trends.'
  },
  {
    title: 'Career-focused learner profiles',
    description: 'Maintain a single profile for learning goals, course stream, coding level, and placement readiness.'
  }
];

const stats = [
  { label: 'Coding learners onboarded', value: '12k+' },
  { label: 'Practice questions mentored', value: '180k+' },
  { label: 'Average confidence lift', value: '34%' },
  { label: 'Weekly learning consistency', value: '92%' }
];

const tracks = [
  {
    title: 'Coding Fundamentals Track',
    level: 'Beginner',
    duration: '4 weeks',
    points: ['C++/Java/Python basics', 'Arrays, strings, recursion', 'Daily coding habit with guided practice']
  },
  {
    title: 'CSE Core Subjects Track',
    level: 'Intermediate',
    duration: '6 weeks',
    points: ['OOP, DBMS, OS, CN revision', 'Concept-to-question mapping', 'Exam and interview focused checkpoints']
  },
  {
    title: 'Placement and Interview Track',
    level: 'Advanced',
    duration: '8 weeks',
    points: ['DSA patterns and mock rounds', 'System design and CS fundamentals', 'Company-style timed assessments']
  }
];

const outcomes = [
  'Personalized coding lesson sequencing based on confidence and response quality',
  'Actionable engineering dashboard metrics for mastery, revision, and weak-topic recovery',
  'Unified learner profile for semester goals, coding prep, and placement outcomes'
];

export default function HomePage() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spotlight = useMotionTemplate`radial-gradient(420px circle at ${mouseX}px ${mouseY}px, rgba(45, 212, 191, 0.2), transparent 45%)`;

  const handleHeroMouseMove = (event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set(event.clientX - rect.left);
    mouseY.set(event.clientY - rect.top);
  };

  return (
    <div className="space-y-10 pb-4">
      <motion.section
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-hero-radial px-6 py-16 shadow-2xl shadow-emerald-900/20 sm:px-10 lg:px-16"
        onMouseMove={handleHeroMouseMove}
      >
        <div className="pointer-events-none absolute inset-0 bg-grid-tech opacity-35" />
        <motion.div className="pointer-events-none absolute inset-0" style={{ background: spotlight }} />
        <div className="pointer-events-none absolute -left-10 top-10 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-8 h-44 w-44 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08, duration: 0.45 }}
            className="space-y-6"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-cyan-100">
              <ShieldCheck className="h-4 w-4" />
              Production-ready learning platform
            </span>
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-white md:text-6xl">
              MentorVerse
            </h1>
            <p className="max-w-2xl text-xl text-slate-300">The AI edtech workspace for coders, CSE students, and engineering learners to master DSA, core subjects, and placement skills.</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/learn"
                className="btn-primary rounded-2xl px-6 py-3"
              >
                Start Learning
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="btn-secondary rounded-2xl px-6 py-3"
              >
                View Learner Dashboard
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12, duration: 0.45 }}
            className="grid gap-4 rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5 backdrop-blur"
          >
            <FeatureRow icon={Bot} title="Coding Coach Agent" text="Explains concepts and generates coding drills." />
            <FeatureRow icon={Brain} title="Concept Mastery Agent" text="Estimates understanding across CS and engineering modules." />
            <FeatureRow icon={LineChart} title="Placement Analysis Agent" text="Finds weak patterns and plans targeted interview prep." />
          </motion.div>
        </div>
      </motion.section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item, index) => (
          <motion.article
            key={item.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: index * 0.05, duration: 0.35 }}
            className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 backdrop-blur"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{item.value}</p>
          </motion.article>
        ))}
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {highlights.map((item, index) => (
          <motion.article
            key={item.title}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ delay: 0.06 * index, duration: 0.42 }}
            className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-xl shadow-black/10 backdrop-blur"
          >
            <h2 className="text-lg font-semibold text-white">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
          </motion.article>
        ))}
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Learning tracks</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Choose your coding and engineering path</h2>
          </div>
          <Link href="/signup" className="btn-secondary">
            Enroll now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {tracks.map((track, index) => (
            <motion.article
              key={track.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.07, duration: 0.35 }}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-white">{track.title}</h3>
                <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">{track.level}</span>
              </div>
              <p className="mt-2 text-sm text-slate-400">Duration: {track.duration}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-200">
                {track.points.map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">How it works</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">From CSE onboarding to placement-ready skills</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <FlowCard icon={Users} title="1. Profile setup" text="Set your branch, target role, and current coding level." />
            <FlowCard icon={BookOpenCheck} title="2. Guided learning" text="Study DSA and CS core modules through adaptive sessions." />
            <FlowCard icon={TimerReset} title="3. Practice sprints" text="Solve timed questions and revisit weak topics automatically." />
            <FlowCard icon={ChartNoAxesCombined} title="4. Placement tracking" text="Follow confidence, speed, and interview readiness trends." />
          </div>
        </article>

        <article className="rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-cyan-400/10 to-emerald-400/10 p-6">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-cyan-100">
            <Sparkles className="h-4 w-4" />
            Why coding learners pick MentorVerse
          </p>
          <ul className="mt-5 space-y-3 text-sm text-slate-100">
            {outcomes.map((item) => (
              <li key={item} className="rounded-xl border border-white/15 bg-slate-950/45 p-3">
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/signup" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
              Create Account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="btn-secondary border-white/30 bg-transparent">
              Login as learner
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}

function FeatureRow({ icon: Icon, title, text }: { icon: ComponentType<{ className?: string }>; title: string; text: string }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-200">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm text-slate-300">{text}</p>
      </div>
    </div>
  );
}

function FlowCard({ icon: Icon, title, text }: { icon: ComponentType<{ className?: string }>; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="inline-flex rounded-xl bg-cyan-400/10 p-2 text-cyan-200">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="mt-3 text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-300">{text}</p>
    </div>
  );
}
