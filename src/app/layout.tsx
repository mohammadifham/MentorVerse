import type { Metadata } from 'next';
import './globals.css';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/app-shell';

export const metadata: Metadata = {
  title: 'GUIDELY | Multi-Agent AI Learning Ecosystem',
  description: 'GUIDELY is an intelligent multi-agent AI learning platform for personalized coding and engineering education.'
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased" style={{ fontFamily: 'Space Grotesk, IBM Plex Sans, Trebuchet MS, sans-serif' }}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
