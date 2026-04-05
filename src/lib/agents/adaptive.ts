import type { AdaptiveResult, LearningLevel } from '@/lib/types';

export function adaptiveAgent(confidence: number): AdaptiveResult {
  const level: LearningLevel = confidence < 0.45 ? 'easy' : confidence < 0.75 ? 'medium' : 'hard';

  return {
    level,
    message:
      level === 'easy'
        ? 'The system will slow down and reinforce the foundational idea.'
        : level === 'medium'
          ? 'The system will keep the current pace and add guided practice.'
          : 'The system will challenge you with more advanced reasoning.'
  };
}
