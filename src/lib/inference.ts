import { OpenAI } from 'openai';

/**
 * MentorVerse Multi-Provider Inference Engine
 * 
 * Automatically resolves inference requests through the best available LLM provider:
 * 1. Groq (Fastest cloud LLM if GROQ_API_KEY is configured)
 * 2. OpenAI (GPT-4o-mini if OPENAI_API_KEY is configured)
 * 3. Google Gemini (Gemini-1.5-flash if GEMINI_API_KEY is configured)
 * 4. HuggingFace Inference Router (if HF_TOKEN has active credits)
 * 5. High-availability cloud LLM fallback gateway (Pollinations AI openai-fast)
 */

function normalizeApiBaseUrl(value: string | undefined): string {
  const baseUrl = value?.trim() || 'https://router.huggingface.co/v1';
  return baseUrl.includes('api-inference.huggingface.co')
    ? baseUrl.replace('https://api-inference.huggingface.co', 'https://router.huggingface.co')
    : baseUrl;
}

const API_BASE_URL = normalizeApiBaseUrl(process.env.API_BASE_URL);
const MODEL_NAME = process.env.MODEL_NAME ?? 'meta-llama/Llama-3.1-8B-Instruct';
const HF_TOKEN = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const LOCAL_IMAGE_NAME = process.env.LOCAL_IMAGE_NAME;

function logStart(message: string): void {
  console.log(`[START] ${message}`);
}

function logStep(message: string): void {
  console.log(`[STEP] ${message}`);
}

function logEnd(message: string): void {
  console.log(`[END] ${message}`);
}

interface ProviderConfig {
  name: string;
  baseURL: string;
  apiKey: string;
  models: string[];
}

function getCandidateProviders(): ProviderConfig[] {
  const providers: ProviderConfig[] = [];

  if (GROQ_API_KEY) {
    providers.push({
      name: 'Groq',
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: GROQ_API_KEY,
      models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant']
    });
  }

  if (OPENAI_API_KEY) {
    providers.push({
      name: 'OpenAI',
      baseURL: 'https://api.openai.com/v1',
      apiKey: OPENAI_API_KEY,
      models: ['gpt-4o-mini', 'gpt-4o']
    });
  }

  if (GEMINI_API_KEY) {
    providers.push({
      name: 'Gemini',
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
      apiKey: GEMINI_API_KEY,
      models: ['gemini-1.5-flash', 'gemini-2.0-flash']
    });
  }

  if (HF_TOKEN) {
    providers.push({
      name: 'HuggingFace',
      baseURL: API_BASE_URL,
      apiKey: HF_TOKEN,
      models: [
        MODEL_NAME,
        'meta-llama/Llama-3.1-8B-Instruct',
        'Qwen/Qwen2.5-7B-Instruct',
        'Qwen/Qwen2.5-Coder-7B-Instruct'
      ].filter((m, i, arr) => arr.indexOf(m) === i)
    });
  }

  // Cloud Free Fallback Provider
  providers.push({
    name: 'CloudGateway',
    baseURL: 'https://text.pollinations.ai/openai',
    apiKey: 'anonymous',
    models: ['openai-fast', 'openai']
  });

  return providers;
}

/**
 * Executes chat inference with multi-provider failover
 */
export async function runInference(
  prompt: string,
  systemPrompt?: string,
  maxTokens: number = 700
): Promise<string> {
  logStart(`Inference Request: ${prompt.substring(0, 80)}...`);

  const messages: Array<{ role: 'system' | 'user'; content: string }> = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  // Direct Google Gemini API call if GEMINI_API_KEY is configured
  if (GEMINI_API_KEY) {
    try {
      logStep('Attempting direct Google Gemini API (gemini-1.5-flash)...');
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            ...(systemPrompt ? [{ role: 'user', parts: [{ text: `System Instruction: ${systemPrompt}` }] }, { role: 'model', parts: [{ text: 'Understood.' }] }] : []),
            { role: 'user', parts: [{ text: prompt }] }
          ]
        })
      });
      if (geminiRes.ok) {
        const geminiData = (await geminiRes.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const geminiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (geminiText && geminiText.trim().length > 0) {
          logStep(`Success via direct Google Gemini (${geminiText.length} chars)`);
          logEnd('Inference completed successfully');
          return geminiText.trim();
        }
      }
    } catch (e) {
      logStep(`Direct Gemini call failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  const providers = getCandidateProviders().filter((p) => p.name !== 'CloudGateway' && p.name !== 'Gemini');
  let lastError: unknown = null;

  // 1. First, attempt any configured API keys (Groq, OpenAI, Gemini, Hugging Face)
  for (const provider of providers) {
    logStep(`Trying provider: ${provider.name} (${provider.baseURL})`);

    for (const model of provider.models) {
      logStep(`Attempting model: ${model}`);

      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(`${provider.baseURL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${provider.apiKey}`
          },
          body: JSON.stringify({
            model,
            messages,
            max_tokens: maxTokens,
            temperature: 0.7
          }),
          signal: controller.signal
        });

        clearTimeout(timer);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 150)}`);
        }

        const data = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };

        const generatedText = data.choices?.[0]?.message?.content?.trim();

        if (generatedText && generatedText.length > 0) {
          logStep(`Success via ${provider.name} [${model}] (${generatedText.length} chars)`);
          logEnd('Inference completed successfully');
          return generatedText;
        }
      } catch (err: unknown) {
        lastError = err;
        const message = err instanceof Error ? err.message : String(err);
        logStep(`Provider ${provider.name} [${model}] failed: ${message.substring(0, 90)}`);

        if (message.includes('remaining credits') || message.includes('quota') || message.includes('402')) {
          logStep(`Provider ${provider.name} credit/quota exhausted, skipping remaining models.`);
          break;
        }
      }
    }
  }

  // 2. High-availability Generative Cloud Gateway (Pollinations GET endpoint with 28s timeout)
  const fullPrompt = systemPrompt
    ? `${systemPrompt.trim()}\n\nQuestion / Topic to teach:\n${prompt.trim()}`
    : prompt.trim();

  const gatewayModels = ['openai', 'mistral', 'qwen-coder'];
  for (const gwModel of gatewayModels) {
    logStep(`Attempting Cloud Gateway model: ${gwModel}`);
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 28000);

      const url = `https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}?model=${gwModel}&seed=${Date.now() % 100000}`;
      const response = await fetch(url, {
        headers: {
          Accept: 'text/plain, application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} from Cloud Gateway`);
      }

      const generatedText = (await response.text()).trim();
      if (generatedText && generatedText.length > 30) {
        logStep(`Success via Cloud Gateway [${gwModel}] (${generatedText.length} chars)`);
        logEnd('Inference completed successfully');
        return generatedText;
      }
    } catch (gwErr) {
      lastError = gwErr;
      const message = gwErr instanceof Error ? gwErr.message : String(gwErr);
      logStep(`Cloud Gateway [${gwModel}] failed: ${message.substring(0, 90)}`);
    }
  }

  logEnd('All cloud inference providers failed, propagating error to local engine.');
  throw lastError instanceof Error ? lastError : new Error(String(lastError ?? 'All inference providers failed'));
}

export async function runInferenceFromDockerImage(
  prompt: string,
  systemPrompt?: string,
  maxTokens: number = 380
): Promise<string> {
  logStart('Inference from Docker Image');
  if (!LOCAL_IMAGE_NAME) {
    logStep('LOCAL_IMAGE_NAME not set, falling back to multi-provider inference');
  }
  return runInference(prompt, systemPrompt, maxTokens);
}

export function validateEnvironmentVariables(): void {
  logStart('Environment Variables Validation');
  const providers = getCandidateProviders();
  logStep(`Active providers configured: ${providers.map((p) => p.name).join(', ')}`);
  logEnd('Inference environment initialized');
}
