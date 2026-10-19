'use client';

import Link from 'next/link';
import type { ComponentType, MouseEvent } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import {
  ArrowRight,
  Award,
  BookOpen,
  BookOpenCheck,
  Bot,
  Brain,
  CheckCircle2,
  Code2,
  Cpu,
  FileText,
  GraduationCap,
  Laptop,
  Layers,
  LineChart,
  Rocket,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trophy,
  Users,
  Volume2,
  Zap
} from 'lucide-react';
import { PLACEMENT_COURSES } from '@/lib/courses-data';

const edtechEcosystem = [
  {
    icon: Laptop,
    badge: 'Live Technical Round',
    badgeColor: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300',
    title: 'AI Technical Mock Interviewer',
    description: 'Simulate high-pressure tech interviews with live AI Senior Engineers across DSA, System Design, and Full Stack. Receive instant Hiring Committee scorecards.',
    href: '/interview',
    cta: 'Start Mock Interview'
  },
  {
    icon: FileText,
    badge: 'Quick Revision',
    badgeColor: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
    title: 'CS Core & DSA Cheat Sheets',
    description: 'Instant recall guides for Top 75 DSA patterns, Operating Systems (Deadlocks, Paging), DBMS (ACID, B+ Trees), Computer Networks, and System Design.',
    href: '/cheat-sheets',
    cta: 'Browse Cheat Sheets'
  },
  {
    icon: Award,
    badge: 'Verifiable Credentials',
    badgeColor: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
    title: 'Official Placement Certificates',
    description: 'Complete curricula to earn cryptographic verifiable certificates with credential hash IDs, printable luxury layouts, and one-click LinkedIn sharing.',
    href: '/certificates',
    cta: 'Claim & Verify'
  },
  {
    icon: Users,
    badge: 'Faculty AI & Peers',
    badgeColor: 'border-violet-400/30 bg-violet-400/10 text-violet-300',
    title: 'Student Doubt Resolution Forum',
    description: 'Stuck on a tricky algorithm or bug? Post your doubt to receive immediate algorithmic breakdowns from our verified AI Professor and peer community.',
    href: '/community',
    cta: 'Join Discussion'
  },
  {
    icon: Trophy,
    badge: 'Placement Readiness',
    badgeColor: 'border-yellow-400/30 bg-yellow-400/10 text-yellow-300',
    title: 'Global Placement Leaderboard',
    description: 'Compete for top engineering rankings with daily streaks, problem solve points, and tiered placement readiness achievement badges.',
    href: '/leaderboard',
    cta: 'View Standings'
  }
];

const platformFeatures = [
  {
    icon: Brain,
    title: '100% Live AI Teacher',
    description: 'Intelligent real-time pedagogical engine. Every lesson, drill, and explanation is generated dynamically with deep technical rigor.'
  },
  {
    icon: Terminal,
    title: 'In-Browser Code Execution',
    description: 'Write, debug, and run Python and JavaScript directly in your browser with real-time stdout and error telemetry.'
  },
  {
    icon: ShieldCheck,
    title: 'Automated AI Answer Grading',
    description: 'Submit your solution for instant evaluation: Verdict (Correct / Partial / Incorrect), score %, strengths, and omissions.'
  },
  {
    icon: Volume2,
    title: 'Voice Audio Narration',
    description: 'Listen to your AI professor teach complex engineering concepts with built-in voice playback and audio controls.'
  }
];

const stats = [
  { label: 'Placement Curricula', value: '4 Comprehensive Tracks', sub: 'Beginner to Hard Pro DSA & Web Dev' },
  { label: 'Live AI Grading', value: 'Instant Verdict', sub: 'Correctness %, Strengths & Missing Points' },
  { label: 'Code Runtime', value: 'Python 3 & JS', sub: 'Interactive Browser Sandbox' },
  { label: 'Real-Time Inference', value: 'Live Neural Engine', sub: 'Direct Real-Time Model Grading' }
];

const outcomes = [
  'Placement readiness tailored for tier-1 tech companies, product startups, and engineering campus drives',
  'Deep conceptual mastery of algorithms, space/time trade-offs, and software architectures',
  'Hands-on coding muscle memory with instant automated test case verification and teacher feedback'
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
    <div className="space-y-12 pb-8">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-hero-radial px-6 py-16 shadow-2xl shadow-emerald-900/20 sm:px-10 lg:px-16"
        onMouseMove={handleHeroMouseMove}
      >
        <div className="pointer-events-none absolute inset-0 bg-grid-tech opacity-35" />
        <motion.div className="pointer-events-none absolute inset-0" style={{ background: spotlight }} />
        <div className="pointer-events-none absolute -left-10 top-10 h-44 w-44 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-8 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl" />

        <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08, duration: 0.45 }}
            className="space-y-6"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">
                <Rocket className="h-3.5 w-3.5 text-cyan-300" />
                CSE Placement Launch Ready
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                <Sparkles className="h-3 w-3" />
                Live AI Intelligence • Production Ready
              </span>
            </div>

            <h1 className="max-w-3xl text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Crack Top Engineering Placements with <span className="bg-gradient-to-r from-cyan-300 via-emerald-300 to-teal-200 bg-clip-text text-transparent">GUIDELY AI</span>
            </h1>

            <p className="max-w-2xl text-lg text-slate-300 sm:text-xl">
              The ultimate computer science placement preparation suite: Beginner to Toughest Pro DSA, Full-Stack Web Development, live interactive compiler, and personalized AI grading.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/courses"
                className="btn-primary rounded-2xl px-7 py-3.5 text-base font-semibold shadow-lg shadow-cyan-500/25"
              >
                <BookOpen className="h-5 w-5" />
                Explore All 4 Courses
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/learn"
                className="btn-secondary rounded-2xl px-6 py-3.5 text-base font-medium"
              >
                <Bot className="h-5 w-5 text-cyan-300" />
                Open AI Learning Studio
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12, duration: 0.45 }}
            className="grid gap-3.5 rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 backdrop-blur"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Curriculum Highlights</p>
              <span className="rounded-full bg-cyan-400/10 px-2.5 py-0.5 text-[11px] font-medium text-cyan-300">
                4 Flagship Tracks
              </span>
            </div>

            <HeroTrackRow
              number="1"
              title="Beginner DSA"
              desc="Time complexity, arrays, strings, linear & binary search, recursion."
              href="/courses/beginner-dsa"
            />
            <HeroTrackRow
              number="2"
              title="Moderate DSA"
              desc="Linked lists, stacks, queues, trees, hashing, two-pointers & practice."
              href="/courses/moderate-dsa"
            />
            <HeroTrackRow
              number="3"
              title="Pro DSA (A-to-Z)"
              desc="Graphs, DP (1D/2D), Tries, and hardest tier-1 placement questions."
              href="/courses/pro-dsa"
            />
            <HeroTrackRow
              number="4"
              title="Full-Stack Web Dev"
              desc="HTML5, CSS3, ES6+ JS, React, Node/Express, and MongoDB."
              href="/courses/fullstack-web-dev"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Real Capabilities Bar */}
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
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">{item.label}</p>
            <p className="mt-2 text-2xl font-bold text-white">{item.value}</p>
            <p className="mt-1 text-xs text-slate-400">{item.sub}</p>
          </motion.article>
        ))}
      </section>

      {/* Course Showcase Grid */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
              <GraduationCap className="h-4 w-4" />
              CSE Placement Curriculum
            </span>
            <h2 className="mt-1 text-3xl font-extrabold text-white">4 Comprehensive Engineering Courses</h2>
            <p className="mt-1.5 text-sm text-slate-300">
              Structured step-by-step from zero to toughest placement interview challenges.
            </p>
          </div>
          <Link href="/courses" className="btn-secondary rounded-xl text-sm">
            Browse All Lessons
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {PLACEMENT_COURSES.map((course, idx) => (
            <motion.article
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 transition hover:border-cyan-400/40 hover:bg-slate-950 hover:shadow-2xl hover:shadow-cyan-950/30 backdrop-blur"
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
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
                  <span className="text-xs font-mono text-slate-400">
                    {course.modules.length} Modules • {course.estimatedHours}
                  </span>
                </div>

                <h3 className="mt-4 text-2xl font-bold text-white group-hover:text-cyan-200 transition">
                  {course.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {course.overview}
                </p>

                <div className="mt-5 space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Core Curriculum Modules:</p>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {course.modules.slice(0, 4).map((mod) => (
                      <li key={mod.id} className="flex items-center gap-2 text-xs text-slate-200">
                        <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{mod.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Code2 className="h-4 w-4 text-cyan-300" />
                  <span>Includes Hands-on Coding Drill</span>
                </div>
                <Link
                  href={`/courses/${course.id}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500/15 border border-cyan-400/30 px-4 py-2 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-500/25 hover:text-white"
                >
                  Start Course
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Complete Enterprise EdTech Platform Suite */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
              <Sparkles className="h-4 w-4" />
              Complete EdTech Platform Suite
            </span>
            <h2 className="mt-1 text-3xl font-extrabold text-white">Full-Fledged Placement Ecosystem</h2>
            <p className="mt-1.5 text-sm text-slate-300">
              Beyond standard video courses: simulate live technical interviews, verify credentials, solve peer doubts, and compete globally.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {edtechEcosystem.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: index * 0.07, duration: 0.35 }}
              className="group flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-950/80 p-6 backdrop-blur transition hover:border-cyan-400/40 hover:bg-slate-950 hover:shadow-xl hover:shadow-cyan-950/20"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-300 transition group-hover:scale-110">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>

                <h3 className="mt-4 text-xl font-bold text-white group-hover:text-cyan-200 transition">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 border-t border-white/10 pt-4">
                <Link
                  href={item.href}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-500/15 hover:text-cyan-200"
                >
                  {item.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Real AI Engine Features */}
      <section className="rounded-[2.5rem] border border-white/10 bg-slate-950/70 p-7 sm:p-10 backdrop-blur">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
            <Cpu className="h-4 w-4" />
            Cutting-Edge EdTech Architecture
          </span>
          <h2 className="mt-2 text-3xl font-extrabold text-white">Why GUIDELY Outperforms Traditional Tutorials</h2>
          <p className="mt-2 text-sm text-slate-300">
            Static video lectures leave students stuck. GUIDELY pairs each student with an adaptive AI tutor and real-time execution engine.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {platformFeatures.map((feat, index) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.06, duration: 0.35 }}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
            >
              <div className="inline-flex rounded-xl bg-cyan-500/10 p-2.5 text-cyan-300 border border-cyan-500/20">
                <feat.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-base font-semibold text-white">{feat.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">{feat.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Placement Call to Action */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-slate-950 to-emerald-950/30 p-8 sm:p-12">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">
            <Zap className="h-4 w-4 text-cyan-300" />
            Get Campus & Off-Campus Ready
          </span>
          <h2 className="mt-4 max-w-2xl text-3xl font-extrabold text-white sm:text-4xl">
            Begin Your Placement Preparation Today
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-slate-300">
            Join thousands of computer science students preparing for Amazon, Google, Microsoft, TCS Digital, and leading tech companies.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-7 py-3.5 text-base font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:scale-[1.02] active:scale-[0.98]"
            >
              Create Student Account
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-7 py-3.5 text-base font-medium text-white backdrop-blur transition hover:bg-white/10"
            >
              Browse Curricula
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function HeroTrackRow({ number, title, desc, href }: { number: string; title: string; desc: string; href: string }) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 transition hover:border-cyan-400/30 hover:bg-white/[0.06]"
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 font-mono text-xs font-bold text-cyan-300 border border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-slate-950 transition">
        {number}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white group-hover:text-cyan-200 transition">{title}</p>
        <p className="text-xs text-slate-400 truncate">{desc}</p>
      </div>
      <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-slate-500 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition" />
    </Link>
  );
}
