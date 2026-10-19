import { generateIntelligentMentorFeedback } from '@/lib/ai-engine';
import type { MentorResult } from '@/lib/types';

export async function mentorAgent(input: {
  topic: string;
  confidence: number;
  level: string;
  answer?: string;
  question?: string;
}): Promise<MentorResult> {
  const feedback = await generateIntelligentMentorFeedback(input);
  return { feedback };
}

