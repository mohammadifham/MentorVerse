import { generateWithHuggingFace } from '@/lib/huggingface';
import { generateIntelligentMentorFeedback } from '@/lib/ai-engine';
import type { MentorResult } from '@/lib/types';

export async function mentorAgent(input: {
  topic: string;
  confidence: number;
  level: string;
  answer?: string;
}): Promise<MentorResult> {
  if (process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY || process.env.OPENAI_API_KEY) {
    try {
      const feedbackPrompt = `Give supportive feedback for a student learning ${input.topic}. The answer confidence is ${input.confidence.toFixed(2)} and the adaptive difficulty is ${input.level}. Student's answer: "${input.answer || 'No answer'}". If the answer is weak, gently correct it. If it is strong, reinforce success. Keep it under 4 sentences.`;

      const feedback = await generateWithHuggingFace(feedbackPrompt, {
        systemPrompt: 'You are MentorVerse, an encouraging mentor that gives concise, actionable feedback.'
      });

      if (feedback && feedback.trim().length > 0) {
        return { feedback: feedback.trim() };
      }
    } catch {
      // Fall through to domain generator
    }
  }

  const feedback = await generateIntelligentMentorFeedback(input);
  return { feedback };
}
