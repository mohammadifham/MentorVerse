'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState, type ReactNode } from 'react';
import { SiteNavbar } from '@/components/site-navbar';
import { SiteFooter } from '@/components/site-footer';
import { SplashScreen } from '@/components/splash-screen';
import { getFirebaseAuth, onAuthStateChanged } from '@/lib/firebase';

export function AppShell({ children }: { children: ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowSplash(false);
    }, 1500);

    // Heartbeat function to report real-time user presence
    const sendHeartbeat = (uid?: string, name?: string, email?: string) => {
      fetch('/api/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: uid || 'guest_visitor',
          userName: name || 'Online Visitor',
          userEmail: email || 'visitor@guidely.ai'
        })
      }).catch(() => {});
    };

    // Initial heartbeat
    try {
      const auth = getFirebaseAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          sendHeartbeat(user.uid, user.displayName || 'Learner', user.email || 'learner@guidely.ai');
        } else {
          sendHeartbeat();
        }
      });
    } catch {
      sendHeartbeat();
    }

    // Recurring heartbeat every 60 seconds
    const interval = window.setInterval(() => {
      try {
        const auth = getFirebaseAuth();
        const user = auth.currentUser;
        if (user) {
          sendHeartbeat(user.uid, user.displayName || 'Learner', user.email || 'learner@guidely.ai');
        } else {
          sendHeartbeat();
        }
      } catch {
        sendHeartbeat();
      }
    }, 60000);

    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
    };
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
