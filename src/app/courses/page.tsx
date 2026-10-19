'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Code2,
  Compass,
  GraduationCap,
  Layers,
  Sparkles,
  Trophy,
  Zap
} from 'lucide-react';
import { PLACEMENT_COURSES } from '@/lib/courses-data';
import type { Course } from '@/lib/types';

export default function CoursesPage() {
  const [completedLessonsMap, setCompletedLessonsMap] = useState<Record<string, string[]>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem('guidely_course_progress');
      if (stored) {
        setCompletedLessonsMap(JSON.parse(stored) as Record<string, string[]>);
      }
    } catch {}
  }, []);

  const getCourseProgress = (course: Course) => {
    const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    const completed = (completedLessonsMap[course.id] || []).length;
    const percent = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;
    return { completed, totalLessons, percent };
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 p-8 shadow-2xl shadow-cyan-950/30 sm:p-12">
        <div className="pointer-events-none absolute -left-12 -top-12 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">
            <GraduationCap className="h-4 w-4" />
            CSE Placement Engineering Curriculum
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Placement-Ready Engineering Courses
          </h1>
          <p className="text-base text-slate-300 sm:text-lg leading-relaxed">
            Curated roadmaps for Computer Science students preparing for top technical placement rounds.
            From fundamental DSA to hard Tier-1 company challenges and production full-stack web engineering,
            every lesson is taught live by our Real AI Teacher with interactive coding practice.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>100% Real-Time Live AI Instruction</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5">
              <Code2 className="h-3.5 w-3.5 text-cyan-400" />
              <span>Real Python & JS Compiler in Every Lesson</span>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Compass className="h-6 w-6 text-cyan-400" />
              Available Placement Tracks
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Select your current preparation stage and start interactive learning immediately.
            </p>
          </div>
          <span className="hidden sm:inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
            4 Comprehensive Tracks
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {PLACEMENT_COURSES.map((course, index) => {
            const { completed, totalLessons, percent } = getCourseProgress(course);
            return (
              <motion.article
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-xl backdrop-blur transition hover:border-cyan-400/40 hover:shadow-2xl hover:shadow-cyan-900/10"
              >
                <div className="space-y-4">
                  {/* Badge & Level Bar */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                        course.level === 'Beginner'
                          ? 'border border-cyan-400/30 bg-cyan-400/10 text-cyan-300'
                          : course.level === 'Moderate'
                          ? 'border border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                          : course.level === 'Pro'
                          ? 'border border-violet-400/30 bg-violet-400/10 text-violet-300'
                          : 'border border-amber-400/30 bg-amber-400/10 text-amber-300'
                      }`}
                    >
                      <Sparkles className="h-3 w-3" />
                      {course.level}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      {course.estimatedHours} hrs • {totalLessons} Lessons
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <h3 className="text-xl font-bold text-white transition group-hover:text-cyan-300">
                      {course.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">
                      {course.subtitle}
                    </p>
                  </div>

                  {/* Target Placement Companies */}
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5 text-cyan-400" />
                      Placement Target Companies:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {course.companyTags.map((company) => (
                        <span
                          key={company}
                          className="rounded-lg border border-white/5 bg-white/5 px-2.5 py-1 text-xs text-slate-300"
                        >
                          {company}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Modules Preview List */}
                  <div className="rounded-2xl border border-white/5 bg-black/30 p-3.5 space-y-1.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Curriculum Highlights:
                    </p>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {course.modules.slice(0, 3).map((mod) => (
                        <li key={mod.id} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                          <span className="truncate">{mod.title}</span>
                        </li>
                      ))}
                      {course.modules.length > 3 && (
                        <li className="text-[11px] text-slate-400 pl-3.5">
                          + {course.modules.length - 3} more modules...
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Bottom Action & Progress Bar */}
                <div className="mt-6 border-t border-white/10 pt-4 space-y-3">
                  {/* Progress info if started */}
                  {completed > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>Progress</span>
                        <span className="font-semibold text-cyan-300">{percent}% ({completed}/{totalLessons})</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <Link
                    href={`/courses/${course.id}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <span>{completed > 0 ? 'Continue Learning' : 'Start Course & Practice'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      {/* Placement Preparation Roadmap Banner */}
      <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 sm:p-8 backdrop-blur">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
          <Trophy className="h-4 w-4 text-amber-400" />
          Recommended Placement Timeline for CSE Students
        </div>
        <h3 className="mt-2 text-2xl font-bold text-white">How to Prepare for Campus Placements</h3>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Step 1: 1st/2nd Year</span>
            <h4 className="font-semibold text-white">Beginner DSA Track</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Build rock-solid command over time/space complexity, arrays, strings, basic recursion, and pointer math.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 2: 3rd Year</span>
            <h4 className="font-semibold text-white">Moderate DSA Track</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Master Linked Lists, Trees, Stacks, Queues, HashMaps, and two-pointer/sliding window patterns.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
            <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">Step 3: Pre-Final / Final</span>
            <h4 className="font-semibold text-white">Pro DSA Track</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Crack Tier-1 Product Companies with Graphs (Dijkstra, TopoSort), 1D/2D Dynamic Programming, and Tries.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Step 4: Capstone</span>
            <h4 className="font-semibold text-white">Full-Stack Track</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Build deployment-ready projects in React, Node.js, Express, and MongoDB to stand out in interviews.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
