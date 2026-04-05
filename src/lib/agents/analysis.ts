import type { AnalysisResult } from '@/lib/types';

export function analysisAgent(input: {
  topic: string;
  confidence: number;
  history: Array<{ topic: string; confidence: number }>;
}): AnalysisResult {
  const topicScores = new Map<string, { total: number; count: number }>();

  for (const session of input.history) {
    const current = topicScores.get(session.topic) ?? { total: 0, count: 0 };
    current.total += session.confidence;
    current.count += 1;
    topicScores.set(session.topic, current);
  }

  const rankedTopics = Array.from(topicScores.entries()).map(([topic, stats]) => ({
    topic,
    average: stats.count > 0 ? stats.total / stats.count : 0
  }));

  const weakTopics = rankedTopics.filter((entry) => entry.average < 0.55).map((entry) => entry.topic);
  const strongTopics = rankedTopics.filter((entry) => entry.average >= 0.75).map((entry) => entry.topic);

  if (weakTopics.length === 0 && input.confidence < 0.6) {
    weakTopics.push(input.topic);
  }

  if (strongTopics.length === 0 && input.confidence >= 0.75) {
    strongTopics.push(input.topic);
  }

  return {
    weakTopics,
    strongTopics
  };
}
