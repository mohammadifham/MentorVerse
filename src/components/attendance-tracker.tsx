'use client';

import { BarChart3, TrendingUp, Calendar } from 'lucide-react';
import { attendanceAgent, calculateAttendancePercentage, getAttendanceStatus } from '@/lib/agents/attendance';
import type { AttentionStatus } from '@/lib/types';

interface AttendanceTrackerProps {
  existingSessions: number;
  responseTime?: number;
  answerProvided?: boolean;
  attentionStatus?: AttentionStatus;
  voiceCommandUsed?: boolean;
}

export function AttendanceTracker({
  existingSessions,
  responseTime,
  answerProvided,
  attentionStatus,
  voiceCommandUsed
}: AttendanceTrackerProps) {
  // Run attendance agent
  const attendanceResult = attendanceAgent({
    existingSessions,
    responseTime,
    answerProvided,
    attentionStatus,
    voiceCommandUsed
  });

  // Calculate additional metrics
  const attendancePercentage = calculateAttendancePercentage(attendanceResult.sessionCount);
  const statusInfo = getAttendanceStatus(attendanceResult.activityScore);

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 backdrop-blur">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
        <Calendar className="h-4 w-4 text-cyan-300" />
        Attendance & Engagement
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {/* Session Count */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Sessions</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{attendanceResult.sessionCount}</p>
          <p className="mt-1 text-xs text-slate-400">Learning sessions completed</p>
        </div>

        {/* Activity Score */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className={`h-5 w-5 ${statusInfo.color}`} />
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Activity</p>
          </div>
          <p className={`mt-2 text-2xl font-bold ${statusInfo.color}`}>
            {attendanceResult.activityScore}%
          </p>
          <p className={`mt-1 text-xs ${statusInfo.color}`}>{statusInfo.status}</p>
        </div>
      </div>

      {/* Attendance Percentage */}
      <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-slate-300">Attendance Rate</p>
          <p className="text-lg font-bold text-cyan-400">{attendancePercentage}%</p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/30">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-violet-400 transition-all duration-300"
            style={{ width: `${attendancePercentage}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-400">Target: 3 sessions per week</p>
      </div>

      {/* Engagement Badges */}
      <div className="mt-4 flex flex-wrap gap-2">
        {answerProvided && (
          <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
            ✓ Answered Question
          </span>
        )}
        {voiceCommandUsed && (
          <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
            🎙️ Voice Input Used
          </span>
        )}
        {attentionStatus === 'Focused' && (
          <span className="rounded-full bg-violet-400/10 px-3 py-1 text-xs font-medium text-violet-300">
            👁️ Stayed Focused
          </span>
        )}
        {responseTime && responseTime < 30 && (
          <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300">
            ⚡ Quick Response
          </span>
        )}
      </div>
    </section>
  );
}
