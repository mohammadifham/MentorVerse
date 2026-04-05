import { generateWithHuggingFace } from '@/lib/huggingface';
import type { TeacherResult } from '@/lib/types';

export async function teacherAgent(topic: string): Promise<TeacherResult> {
  const explanationPrompt = `Explain ${topic} in a clear, beginner-friendly way. Use 2 short paragraphs, include one real-world analogy, and keep it concise.`;
  const questionPrompt = `Create one open-ended practice question about ${topic}. The question should test understanding and be answerable in 2 to 4 sentences.`;

  const [explanation, question] = await Promise.all([
    generateWithHuggingFace(explanationPrompt, {
      systemPrompt: 'You are a patient expert teacher for students learning technical concepts.'
    }),
    generateWithHuggingFace(questionPrompt, {
      systemPrompt: 'You are a quiz generator that writes one high-quality learning question.'
    })
  ]);

  return {
    explanation: explanation || `Let's break down ${topic} into its core ideas, one step at a time.`,
    question: question || `How would you explain the main idea behind ${topic} in your own words?`
  };
}
