import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { AuthPanel } from '@/components/auth-panel';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'MentorVerse',
  description: 'MentorVerse is a multi-agent AI learning ecosystem for personalized learning.'
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased" style={{ fontFamily: 'Space Grotesk, IBM Plex Sans, Trebuchet MS, sans-serif' }}>
        <div className="min-h-screen">
          <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <Link href="/" className="group flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-600 text-lg font-semibold text-white shadow-lg shadow-violet-500/30">
                  M
                </span>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">MentorVerse</p>
                  <p className="text-xs text-slate-400">Multi-Agent AI Learning Ecosystem</p>
                </div>
              </Link>
              <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
                <Link href="/" className="transition hover:text-white">Home</Link>
                <Link href="/learn" className="transition hover:text-white">Learn</Link>
                <Link href="/dashboard" className="transition hover:text-white">Dashboard</Link>
              </nav>
              <AuthPanel />
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
