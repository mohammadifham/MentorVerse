import { generateContent } from './ai-engine';

/**
 * Generate text using HuggingFace inference API / MentorVerse AI Engine.
 * Uses OpenAI-compatible cloud inference if credentials are provided,
 * and seamlessly provides intelligent domain-aware generative reasoning otherwise.
 */
export async function generateWithHuggingFace(
  prompt: string,
  options?: { systemPrompt?: string; maxNewTokens?: number }
): Promise<string> {
  return generateContent(prompt, options);
}
