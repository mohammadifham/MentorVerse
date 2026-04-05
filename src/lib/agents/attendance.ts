import type { AttendanceResult } from '@/lib/types';

export function attendanceAgent(input: { existingSessions: number; responseTime?: number; answerProvided?: boolean }): AttendanceResult {
  const sessionCount = input.existingSessions + 1;
  const activityScore = Math.min(
    100,
    Math.round((input.answerProvided ? 60 : 35) + Math.max(0, 30 - (input.responseTime ?? 0)))
  );

  return {
    sessionCount,
    activityScore
  };
}
