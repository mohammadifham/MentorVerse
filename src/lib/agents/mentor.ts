import { generateWithHuggingFace } from '@/lib/huggingface';
import type { MentorResult } from '@/lib/types';

export async function mentorAgent(input: {
  topic: string;
  confidence: number;
  level: string;
  answer?: string;
}): Promise<MentorResult> {
  const feedbackPrompt = `Give supportive feedback for a student learning ${input.topic}. The answer confidence is ${input.confidence.toFixed(2)} and the adaptive difficulty is ${input.level}. If the answer is weak, gently correct it. If it is strong, reinforce success. Keep it under 4 sentences.`;

  const feedback = await generateWithHuggingFace(feedbackPrompt, {
    systemPrompt: 'You are MentorVerse, an encouraging mentor that gives concise, actionable feedback.'
  });

  if (feedback && feedback.trim().length > 0) {
    return { feedback: feedback.trim() };
  }

  return {
    feedback:
      input.confidence < 0.45
        ? 'You are on the right path, but this needs a simpler explanation and a fresh example.'
        : input.confidence < 0.75
          ? 'Good progress. Add one more specific detail to strengthen your answer.'
          : 'Excellent work. You explained the concept with clarity and confidence.'
  };
}
