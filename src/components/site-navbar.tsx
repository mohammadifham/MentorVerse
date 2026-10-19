'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, GraduationCap, Menu, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { AuthPanel } from '@/components/auth-panel';

const navItems = [
  { href: '/courses', label: 'Courses' },
  { href: '/interview', label: 'AI Interview' },
  { href: '/cheat-sheets', label: 'Cheat Sheets' },
  { href: '/community', label: 'Community' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/certificates', label: 'Certificates' },
  { href: '/learn', label: 'AI Tutor' },
  { href: '/dashboard', label: 'Dashboard' }
];

export function SiteNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.13),transparent_40%),radial-gradient(circle_at_85%_30%,rgba(16,185,129,0.15),transparent_35%)]" />
      <div className="hidden border-b border-white/10 bg-white/[0.02] px-4 py-1.5 text-center text-xs text-slate-300 md:block">
        <span className="inline-flex items-center gap-2">
          <GraduationCap className="h-3.5 w-3.5 text-cyan-300" />
          GUIDELY - Enterprise AI EdTech Ecosystem for Engineering Placements
        </span>
      </div>
      <div className="container-shell flex items-center justify-between gap-4 py-3.5">
        <Link href="/" className="group flex items-center gap-3" onClick={() => setMobileOpen(false)}>
          <motion.span
            initial={{ rotate: -6, scale: 0.94 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.45 }}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/30 bg-gradient-to-br from-cyan-400 to-emerald-500 text-lg font-bold text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.35)]"
          >
            G
          </motion.span>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-100">GUIDELY</p>
            <p className="text-[11px] text-slate-400">AI EdTech & Placement Ecosystem</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 xl:gap-1.5 md:flex">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * index + 0.05, duration: 0.3 }}
                whileHover={{ y: -1 }}
              >
                <Link
                  href={item.href}
                  className={`group relative inline-flex items-center rounded-xl px-2.5 py-1.5 text-xs font-medium xl:px-3 xl:text-sm transition ${
                    isActive ? 'text-cyan-200' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {isActive ? (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-xl border border-cyan-400/40 bg-cyan-400/10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  ) : null}
                  <span className="relative z-10">{item.label}</span>
                </Link>
              </motion.div>
            );
          })}
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
