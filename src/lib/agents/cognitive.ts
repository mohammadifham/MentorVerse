import type { CognitiveResult } from '@/lib/types';

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
}

export function cognitiveAgent(input: {
  topic: string;
  question?: string;
  answer?: string;
  responseTime?: number;
}): CognitiveResult {
  const answer = input.answer?.trim() ?? '';
  const question = input.question?.trim() ?? '';
  const topicTokens = normalizeText(input.topic)
    .split(/\s+/)
    .filter(Boolean);
  const answerTokens = normalizeText(answer)
    .split(/\s+/)
    .filter(Boolean);
  const questionTokens = normalizeText(question)
    .split(/\s+/)
    .filter(Boolean);

  const keywordHits = topicTokens.filter((token) => answerTokens.includes(token) || questionTokens.includes(token)).length;
  const keywordCoverage = topicTokens.length > 0 ? keywordHits / topicTokens.length : 0;
  const answerLengthScore = clamp(answerTokens.length / 24, 0, 1);
  const timingScore = typeof input.responseTime === 'number' ? clamp(input.responseTime <= 20 ? 1 : 1 - (input.responseTime - 20) / 120, 0.2, 1) : 0.6;
  const structureScore = clamp(answer.includes('.') ? 0.85 : 0.55, 0, 1);
  const correctness = clamp(0.3 + keywordCoverage * 0.4 + answerLengthScore * 0.2 + structureScore * 0.1, 0, 1);
  const confidence = clamp(correctness * 0.55 + timingScore * 0.45, 0, 1);

  return {
    correctness,
    confidence,
    understandingLevel: confidence < 0.45 ? 'low' : confidence < 0.75 ? 'medium' : 'high',
    reasoning: confidence < 0.45 ? 'The answer is brief or misses core topic words.' : confidence < 0.75 ? 'The response shows partial understanding and some structure.' : 'The response is specific, structured, and aligns well with the topic.'
  };
}
