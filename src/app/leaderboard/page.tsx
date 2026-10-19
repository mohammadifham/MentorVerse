'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Crown,
  Flame,
  GraduationCap,
  Medal,
  Sparkles,
  Target,
  Trophy,
  User,
  Zap
} from 'lucide-react';
import { getCurrentUnifiedUser } from '@/lib/firebase';
import type { AchievementBadge, LeaderboardEntry } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userEntry, setUserEntry] = useState<LeaderboardEntry | null>(null);
  const [badges, setBadges] = useState<AchievementBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const user = getCurrentUnifiedUser();
      try {
        const url = user?.uid ? `/api/leaderboard?userId=${user.uid}` : '/api/leaderboard';
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to load leaderboard.');
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
        setUserEntry(data.userEntry || null);
        setBadges(data.availableBadges || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    void fetchLeaderboard();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-10 shadow-2xl shadow-cyan-950/20">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
              <Trophy className="h-3.5 w-3.5" />
              Campus Rankings
            </span>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
              Placement Season 2026
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
            Global Engineering Placement Leaderboard
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Track your coding consistency, earn XP for solving algorithms and passing AI technical mock interviews,
            and benchmark yourself against engineering candidates across top campuses.
          </p>
        </div>
      </section>

      {/* Your Dynamic Rank Card */}
      {userEntry ? (
        <section className="rounded-[2rem] border border-cyan-500/30 bg-gradient-to-r from-cyan-950/30 via-slate-950 to-emerald-950/30 p-6 shadow-xl backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center font-bold text-slate-950 text-xl shadow-lg shadow-cyan-500/25">
                #{userEntry.rank}
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
                  Your Current Standing
                </span>
                <h3 className="text-xl font-bold text-white">{userEntry.name}</h3>
                <p className="text-xs text-slate-400">{userEntry.course}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-3 sm:border-0 sm:pt-0 text-center sm:text-right">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Total XP</p>
                <p className="text-lg font-bold text-cyan-300 font-mono">{userEntry.totalXp} XP</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Solved</p>
                <p className="text-lg font-bold text-emerald-300 font-mono">{userEntry.problemsSolved}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Streak</p>
                <p className="text-lg font-bold text-amber-300 font-mono flex items-center justify-center sm:justify-end gap-1">
                  <Flame className="h-4 w-4" />
                  {userEntry.streakDays}d
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Top 3 Podium Highlights */}
      {!loading && leaderboard.length >= 3 ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Rank 2 */}
          <PodiumCard entry={leaderboard[1]} position="2nd" color="border-slate-400/40 bg-slate-950/80 text-slate-300" medal="🥈" />
          {/* Rank 1 */}
          <PodiumCard entry={leaderboard[0]} position="1st" color="border-amber-400/60 bg-amber-950/20 text-amber-300 ring-1 ring-amber-400/40" medal="👑" />
          {/* Rank 3 */}
          <PodiumCard entry={leaderboard[2]} position="3rd" color="border-amber-700/40 bg-slate-950/80 text-amber-600" medal="🥉" />
        </div>
      ) : null}

      {/* Full Leaderboard Table */}
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 shadow-2xl backdrop-blur">
        <div className="border-b border-white/10 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Top Placement Candidates</h2>
            <p className="text-xs text-slate-400">Ranked by algorithmic accuracy, course progress, and mock interview scores</p>
          </div>
          <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-slate-300">
            Updated Real-Time
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <LoadingSpinner />
            <p className="mt-3 text-xs">Computing placement standings...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3.5 pl-6 pr-3">Rank</th>
                  <th className="py-3.5 px-3">Candidate</th>
                  <th className="py-3.5 px-3">Branch & Major</th>
                  <th className="py-3.5 px-3 text-center">Streak</th>
                  <th className="py-3.5 px-3 text-center">Solved</th>
                  <th className="py-3.5 px-3 text-right">Total XP</th>
                  <th className="py-3.5 pr-6 pl-3 text-right">Achievements</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {leaderboard.map((entry) => (
                  <tr key={entry.userId} className="transition hover:bg-white/[0.02]">
                    <td className="py-4 pl-6 pr-3 font-bold font-mono">
                      {entry.rank === 1 ? (
                        <span className="text-amber-300 flex items-center gap-1">
                          <Crown className="h-4 w-4" /> #1
                        </span>
                      ) : entry.rank === 2 ? (
                        <span className="text-slate-300">#2</span>
                      ) : entry.rank === 3 ? (
                        <span className="text-amber-600">#3</span>
                      ) : (
                        <span className="text-slate-400">#{entry.rank}</span>
                      )}
                    </td>

                    <td className="py-4 px-3 font-semibold text-white">
                      {entry.name}
                    </td>

                    <td className="py-4 px-3 text-xs text-slate-400 truncate max-w-[200px]">
                      {entry.course}
                    </td>

                    <td className="py-4 px-3 text-center font-mono text-xs">
                      <span className="inline-flex items-center gap-1 text-amber-300 font-bold">
                        <Flame className="h-3.5 w-3.5" />
                        {entry.streakDays}d
                      </span>
                    </td>

                    <td className="py-4 px-3 text-center font-mono text-xs text-emerald-300 font-bold">
                      {entry.problemsSolved}
                    </td>

                    <td className="py-4 px-3 text-right font-mono font-bold text-cyan-300">
                      {entry.totalXp} XP
                    </td>

                    <td className="py-4 pr-6 pl-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {entry.badges.map((b) => (
                          <span
                            key={b.id}
                            title={`${b.name}: ${b.description}`}
                            className="text-base cursor-default"
                          >
                            {b.icon}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Available Placement Badges Section */}
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 sm:p-8 backdrop-blur">
        <h2 className="text-lg font-bold text-white mb-1">Placement Achievement Milestones</h2>
        <p className="text-xs text-slate-400 mb-6">Unlock these prestige badges as you progress through GUIDELY</p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-cyan-400/30"
            >
              <div className="text-2xl shrink-0 p-2 rounded-xl bg-white/5 border border-white/10">
                {badge.icon}
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">{badge.name}</h4>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function PodiumCard({ entry, position, color, medal }: { entry: LeaderboardEntry; position: string; color: string; medal: string }) {
  return (
    <div className={`rounded-[2rem] border p-6 flex flex-col items-center text-center backdrop-blur transition hover:scale-[1.02] ${color}`}>
      <span className="text-3xl mb-1">{medal}</span>
      <span className="text-xs font-mono uppercase tracking-widest font-bold">{position} Place</span>
      <h3 className="mt-2 text-lg font-extrabold text-white">{entry.name}</h3>
      <p className="text-xs text-slate-400 truncate max-w-full">{entry.course}</p>

      <div className="mt-4 flex items-center justify-center gap-3 w-full border-t border-white/10 pt-3 text-xs font-mono">
        <div>
          <p className="text-[10px] text-slate-400 uppercase">XP</p>
          <p className="font-bold text-cyan-300">{entry.totalXp}</p>
        </div>
        <div className="h-6 w-px bg-white/10" />
        <div>
          <p className="text-[10px] text-slate-400 uppercase">Solved</p>
          <p className="font-bold text-emerald-300">{entry.problemsSolved}</p>
        </div>
        <div className="h-6 w-px bg-white/10" />
        <div>
          <p className="text-[10px] text-slate-400 uppercase">Streak</p>
          <p className="font-bold text-amber-300">{entry.streakDays}d</p>
        </div>
      </div>
    </div>
  );
}
