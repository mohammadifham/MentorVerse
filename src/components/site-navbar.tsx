'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, GraduationCap, Menu, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { AuthPanel } from '@/components/auth-panel';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/learn', label: 'Learn' },
  { href: '/dashboard', label: 'Dashboard' }
];

export function SiteNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.13),transparent_40%),radial-gradient(circle_at_85%_30%,rgba(16,185,129,0.15),transparent_35%)]" />
      <div className="hidden border-b border-white/10 bg-white/[0.02] px-4 py-2 text-center text-xs text-slate-300 md:block">
        <span className="inline-flex items-center gap-2">
          <GraduationCap className="h-3.5 w-3.5 text-cyan-300" />
          Built for coders, CSE students, and engineering placement preparation
        </span>
      </div>
      <div className="container-shell flex items-center justify-between gap-4 py-4">
        <Link href="/" className="group flex items-center gap-3" onClick={() => setMobileOpen(false)}>
          <motion.span
            initial={{ rotate: -6, scale: 0.94 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.45 }}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/30 bg-gradient-to-br from-cyan-400 to-emerald-500 text-lg font-semibold text-slate-900 shadow-[0_0_35px_rgba(16,185,129,0.35)]"
          >
            M
          </motion.span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-100">MentorVerse</p>
            <p className="text-xs text-slate-400">EdTech for Coding and Engineering</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index + 0.05, duration: 0.35 }}
                whileHover={{ y: -2, scale: 1.03 }}
              >
                <Link
                  href={item.href}
                  className="group relative inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-slate-200 transition hover:text-white"
                >
                  {isActive ? (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full border border-cyan-300/40 bg-cyan-300/10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  ) : null}
                  <span className="relative z-10">{item.label}</span>
                  <span className="pointer-events-none absolute bottom-1 left-1/2 h-px w-0 -translate-x-1/2 bg-gradient-to-r from-cyan-300 to-emerald-300 opacity-70 transition-all duration-300 group-hover:w-3/4" />
                </Link>
              </motion.div>
            );
          })}
          <span className="ml-1 h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
          <Link
            href="/learn"
            className="btn-primary ml-2 rounded-full px-4 py-2 text-sm"
          >
            Start coding practice
            <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>

        <div className="hidden lg:block">
          <AuthPanel />
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 p-2.5 text-slate-200 transition hover:border-cyan-300/40 hover:bg-white/10 md:hidden"
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-white/10 bg-slate-950/90 px-4 py-4 backdrop-blur md:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-3">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-xl border px-4 py-3 text-sm transition ${
                      isActive
                        ? 'border-cyan-300/40 bg-cyan-300/10 text-cyan-100'
                        : 'border-white/10 bg-white/5 text-slate-200 hover:border-white/20'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <div className="rounded-xl border border-emerald-300/30 bg-emerald-300/10 p-3 text-xs text-emerald-100">
                <div className="inline-flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Live DSA and CS core practice enabled
                </div>
              </div>
              <AuthPanel />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
