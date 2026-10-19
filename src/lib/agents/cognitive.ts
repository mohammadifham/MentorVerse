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
  const topicTokens = normalizeText(input.topic).split(/\s+/).filter(Boolean);
  const answerTokens = normalizeText(answer).split(/\s+/).filter(Boolean);
  const questionTokens = normalizeText(question).split(/\s+/).filter(Boolean);

  const topicHits = topicTokens.filter((token) => answerTokens.includes(token) || questionTokens.includes(token)).length;
  const questionHits = questionTokens.filter((token) => answerTokens.includes(token)).length;

  const topicCoverage = topicTokens.length > 0 ? topicHits / topicTokens.length : 0.5;
  const questionCoverage = questionTokens.length > 0 ? clamp(questionHits / 4, 0, 1) : 0.5;

  const answerLengthScore = clamp(answerTokens.length / 18, 0.2, 1);
  const structureScore = clamp(answer.includes('.') || answer.includes(',') || answer.includes('\n') ? 0.9 : 0.6, 0.4, 1);
  const timingScore = typeof input.responseTime === 'number'
    ? clamp(input.responseTime <= 25 ? 1 : 1 - (input.responseTime - 25) / 120, 0.3, 1)
    : 0.7;

  const correctness = clamp(0.35 + topicCoverage * 0.3 + questionCoverage * 0.15 + answerLengthScore * 0.1 + structureScore * 0.1, 0.2, 1);
  const confidence = clamp(correctness * 0.6 + timingScore * 0.4, 0.2, 1);

  return {
    correctness,
    confidence,
    understandingLevel: confidence < 0.45 ? 'low' : confidence < 0.75 ? 'medium' : 'high',
    reasoning:
      confidence < 0.45
        ? 'The answer is brief; consider elaborating with definitions and examples.'
        : confidence < 0.75
        ? 'The response shows good foundational understanding and structure.'
        : 'The response is specific, well-structured, and aligns accurately with the topic.'
  };
}
