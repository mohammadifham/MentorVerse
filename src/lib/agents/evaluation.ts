import type { EvaluationResult } from '@/lib/types';

export function evaluationAgent(input: { confidence: number; previousScore?: number }): EvaluationResult {
  const score = Math.round(input.confidence * 100);
  const previousScore = typeof input.previousScore === 'number' ? input.previousScore : score;
  const delta = score - previousScore;

  return {
    score,
    trend: delta > 8 ? 'improving' : delta < -8 ? 'needs reinforcement' : 'steady'
  };
}
