'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpenCheck, Cpu, Headphones, Mail, Orbit, Radar } from 'lucide-react';

const links = [
  { href: '/', label: 'Home' },
  { href: '/learn', label: 'Learn workspace' },
  { href: '/dashboard', label: 'Analytics dashboard' }
];

export function SiteFooter() {
  return (
    <footer className="relative mt-12 overflow-hidden border-t border-white/10 bg-slate-950/90">
      <div className="pointer-events-none absolute -left-16 bottom-8 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-6 h-52 w-52 rounded-full bg-emerald-400/20 blur-3xl" />

      <div className="container-shell pt-10">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45 }}
          className="rounded-3xl border border-cyan-300/20 bg-gradient-to-r from-cyan-400/10 to-emerald-400/10 p-6"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">MentorVerse for coders and engineers</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Master DSA, CSE core, and placement prep with AI-guided practice.</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/signup" className="btn-primary">
                Create learner account
              </Link>
              <Link href="/learn" className="btn-secondary">
                Open learning studio
              </Link>
            </div>
          </div>
        </motion.section>
      </div>

      <div className="container-shell grid gap-8 py-12 lg:grid-cols-[1.15fr_0.85fr]">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.45 }}
          className="space-y-4"
        >
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-200">MentorVerse Neural Stack</p>
          <h2 className="max-w-xl text-2xl font-semibold text-white sm:text-3xl">Built for focused coding and engineering learners who want measurable outcomes.</h2>
          <p className="max-w-xl text-sm text-slate-300">
            Real-time tutoring, coding analytics, and confidence-aware planning across DSA, core CS subjects, and interview workflows.
          </p>

          <div className="grid gap-3 pt-2 text-sm text-slate-200 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="inline-flex items-center gap-2"><BookOpenCheck className="h-4 w-4 text-cyan-300" /> DSA and CSE structured tracks</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="inline-flex items-center gap-2"><Headphones className="h-4 w-4 text-cyan-300" /> Interview-style mentor feedback</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ delay: 0.08, duration: 0.45 }}
          className="grid gap-4 sm:grid-cols-2"
        >
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Navigate</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-200">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition hover:text-cyan-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-white/10 pt-3 text-sm">
              <Link href="/login" className="text-cyan-200 transition hover:text-cyan-100">Learner login</Link>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-emerald-100">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/90">Runtime status</p>
            <ul className="mt-3 space-y-3 text-sm">
              <li className="flex items-center gap-2"><Cpu className="h-4 w-4" /> Agents online</li>
              <li className="flex items-center gap-2"><Radar className="h-4 w-4" /> Attention tracking ready</li>
              <li className="flex items-center gap-2"><Orbit className="h-4 w-4" /> Adaptive loop active</li>
            </ul>
            <a href="mailto:support@mentorverse.ai" className="mt-4 inline-flex items-center gap-2 text-sm text-emerald-100 transition hover:text-white">
              <Mail className="h-4 w-4" /> Contact support
            </a>
          </div>
        </motion.div>
      </div>

      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-slate-400 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} MentorVerse. Personalized learning intelligence.
      </div>
    </footer>
  );
}
