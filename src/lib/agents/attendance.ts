import type { AttendanceResult } from '@/lib/types';

/**
 * Attendance Agent - Tracks user engagement and participation metrics
 * 
 * Monitors:
 * - Session count: Total number of learning sessions
 * - Activity score: Based on participation level and response time
 * - Engagement: Whether user answered questions and submitted responses
 */
export function attendanceAgent(input: { 
  existingSessions: number; 
  responseTime?: number; 
  answerProvided?: boolean;
  attentionStatus?: 'Focused' | 'Distracted' | 'Preparing';
  voiceCommandUsed?: boolean;
}): AttendanceResult {
  const sessionCount = input.existingSessions + 1;
  
  // Base score: 35 points for participating, 60 points for providing answer
  let activityScore = input.answerProvided ? 60 : 35;
  
  // Time bonus: up to 30 points based on response time
  // Faster responses get more points (max 30 points for < 5 seconds)
  const responseTimeBonus = Math.max(0, 30 - Math.max(0, (input.responseTime ?? 0) - 5) * 0.5);
  activityScore += responseTimeBonus;
  
  // Attention bonus: +10 points if user was focused during session
  if (input.attentionStatus === 'Focused') {
    activityScore += 10;
  }
  
  // Voice command bonus: +15 points for using voice commands
  // Demonstrates active engagement and accessibility usage
  if (input.voiceCommandUsed) {
    activityScore += 15;
  }
  
  // Session streak bonus: Encourage consecutive day participation
  // 1 point per session (scales up engagement over time)
  if (sessionCount > 5) {
    activityScore += Math.min(10, sessionCount / 5);
  }
  
  // Cap score at 100
  const finalScore = Math.min(100, Math.round(activityScore));
  
  return {
    sessionCount,
    activityScore: finalScore
  };
}

/**
 * Calculate attendance percentage based on sessions
 * Useful for tracking learning consistency
 */
export function calculateAttendancePercentage(
  sessionCount: number,
  targetSessionsPerWeek: number = 3
): number {
  const expectedSessions = Math.ceil(sessionCount / 7) * targetSessionsPerWeek;
  return Math.min(100, Math.round((sessionCount / (expectedSessions || 1)) * 100));
}

/**
 * Get attendance status badge based on activity score
 */
export function getAttendanceStatus(activityScore: number): {
  status: 'Excellent' | 'Good' | 'Fair' | 'Needs Improvement';
  color: string;
} {
  if (activityScore >= 85) {
    return { status: 'Excellent', color: 'text-emerald-400' };
  } else if (activityScore >= 70) {
    return { status: 'Good', color: 'text-cyan-400' };
  } else if (activityScore >= 50) {
    return { status: 'Fair', color: 'text-amber-400' };
  } else {
    return { status: 'Needs Improvement', color: 'text-rose-400' };
  }
}
