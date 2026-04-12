import { runInference } from './inference';

function extractTextFromPrompt(prompt: string): string {
  const cleaned = prompt.replace(/\s+/g, ' ').trim();
  return cleaned.length > 180 ? `${cleaned.slice(0, 180).trim()}...` : cleaned;
}

function extractTopic(prompt: string): string {
  const explainMatch = prompt.match(/Explain\s+(.+?)\s+in a clear, beginner-friendly way/i);
  if (explainMatch?.[1]) {
    return explainMatch[1].trim();
  }

  const questionMatch = prompt.match(/practice question about\s+(.+?)\./i);
  if (questionMatch?.[1]) {
    return questionMatch[1].trim();
  }

  return extractTextFromPrompt(prompt);
}

function fallbackResponse(prompt: string): string {
  const topic = extractTopic(prompt);
  if (/question/i.test(prompt)) {
    return `What is the main idea of ${topic}, and how would you explain it in your own words?`;
  }
  if (/feedback|mentor/i.test(prompt)) {
    return 'Good effort. Revisit the core idea once, then try to explain it back in your own words.';
  }
  return `Here is a clear explanation of ${topic}. Focus on the definition, the core pattern, and one concrete example.`;
}

/**
 * Generate text using HuggingFace inference API
 * Uses the OpenAI-compatible inference client with structured logging
 */
export async function generateWithHuggingFace(prompt: string, options?: { systemPrompt?: string; maxNewTokens?: number }): Promise<string> {
  try {
    const result = await runInference(
      prompt,
      options?.systemPrompt,
      options?.maxNewTokens ?? 220
    );
    return result;
  } catch (error) {
    console.error('Inference failed, using fallback:', error);
    return fallbackResponse(prompt);
  }
}
