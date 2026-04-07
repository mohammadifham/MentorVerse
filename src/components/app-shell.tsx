'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState, type ReactNode } from 'react';
import { SiteNavbar } from '@/components/site-navbar';
import { SiteFooter } from '@/components/site-footer';
import { SplashScreen } from '@/components/splash-screen';

export function AppShell({ children }: { children: ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowSplash(false);
    }, 1500);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>{showSplash ? <SplashScreen /> : null}</AnimatePresence>
      <motion.div
        initial={{ opacity: 0.98 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="min-h-screen"
      >
        <SiteNavbar />
        <main className="container-shell py-10">{children}</main>
        <SiteFooter />
      </motion.div>
    </>
  );
}
