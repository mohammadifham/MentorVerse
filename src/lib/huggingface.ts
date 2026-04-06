const DEFAULT_MODEL = process.env.NEXT_PUBLIC_HUGGINGFACE_MODEL ?? 'mistralai/Mistral-7B-Instruct';

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

export async function generateWithHuggingFace(prompt: string, options?: { systemPrompt?: string; maxNewTokens?: number }): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    return fallbackResponse(prompt);
  }

  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${DEFAULT_MODEL}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: options?.systemPrompt ? `${options.systemPrompt}\n\n${prompt}` : prompt,
        parameters: {
          max_new_tokens: options?.maxNewTokens ?? 220,
          temperature: 0.7,
          return_full_text: false
        },
        options: {
          wait_for_model: true
        }
      })
    });

    const payload = (await response.json()) as Array<{ generated_text?: string }> | { generated_text?: string; error?: string };

    if (!response.ok) {
      const errorMessage = Array.isArray(payload) ? 'Hugging Face request failed.' : payload.error ?? 'Hugging Face request failed.';
      throw new Error(errorMessage);
    }

    if (Array.isArray(payload)) {
      const text = payload[0]?.generated_text?.trim();
      if (text) {
        return text;
      }
    } else if (typeof payload.generated_text === 'string' && payload.generated_text.trim()) {
      return payload.generated_text.trim();
    }

    return fallbackResponse(prompt);
  } catch {
    return fallbackResponse(prompt);
  }
}
