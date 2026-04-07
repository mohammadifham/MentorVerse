'use client';

import { motion } from 'framer-motion';

export function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45, ease: 'easeInOut' } }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.16),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(16,185,129,0.16),transparent_35%)]" />
      <div className="relative flex flex-col items-center gap-5 text-center">
        <motion.div
          initial={{ scale: 0.9, rotate: -6 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex h-16 w-16 items-center justify-center rounded-3xl border border-cyan-300/30 bg-gradient-to-br from-cyan-400 to-emerald-500 text-2xl font-semibold text-slate-950 shadow-[0_0_45px_rgba(34,211,238,0.45)]"
        >
          M
        </motion.div>

        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-cyan-100">MentorVerse</p>
          <p className="mt-2 text-xs text-slate-400">Booting adaptive learning agents...</p>
        </div>

        <div className="h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
            className="h-full w-1/2 rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300"
          />
        </div>
      </div>
    </motion.div>
  );
}
