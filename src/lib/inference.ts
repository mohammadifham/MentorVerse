import { OpenAI } from 'openai';

/**
 * Environment Variables Configuration
 * - API_BASE_URL: Base URL for the inference API (defaults to HuggingFace)
 * - MODEL_NAME: Model identifier (defaults to Mistral-7B)
 * - HF_TOKEN: HuggingFace API token (REQUIRED - no default)
 * - LOCAL_IMAGE_NAME: Local Docker image name (optional, for from_docker_image())
 */

const API_BASE_URL = process.env.API_BASE_URL ?? 'https://api-inference.huggingface.co/v1';
const MODEL_NAME = process.env.MODEL_NAME ?? 'mistralai/Mistral-7B-Instruct';
const HF_TOKEN = process.env.HF_TOKEN;
const LOCAL_IMAGE_NAME = process.env.LOCAL_IMAGE_NAME;

/**
 * Structured logging functions following START/STEP/END format
 */
function logStart(message: string): void {
  console.log(`[START] ${message}`);
}

function logStep(message: string): void {
  console.log(`[STEP] ${message}`);
}

function logEnd(message: string): void {
  console.log(`[END] ${message}`);
}

/**
 * Initialize OpenAI client configured with environment variables
 */
function initializeClient(): OpenAI {
  if (!HF_TOKEN) {
    logStart('OpenAI Client Initialization');
    logStep('Validating environment variables');
    logEnd('ERROR: HF_TOKEN environment variable is required but not set');
    throw new Error('HF_TOKEN environment variable is required');
  }

  logStart('OpenAI Client Initialization');
  logStep(`Using API Base URL: ${API_BASE_URL}`);
  logStep(`Using Model: ${MODEL_NAME}`);
  logStep(`HF_TOKEN is configured`);

  const client = new OpenAI({
    apiKey: HF_TOKEN,
    baseURL: API_BASE_URL,
  });

  logEnd('OpenAI Client initialized successfully');
  return client;
}

/**
 * Run inference with OpenAI client
 *
 * @param prompt The input prompt for the model
 * @param systemPrompt Optional system prompt
 * @param maxTokens Maximum tokens for the response (default: 220)
 * @returns The model's generated response
 */
export async function runInference(
  prompt: string,
  systemPrompt?: string,
  maxTokens: number = 220
): Promise<string> {
  logStart(`Inference Request: ${prompt.substring(0, 100)}...`);

  try {
    const client = initializeClient();

    logStep('Preparing request to LLM');
    logStep(`System Prompt: ${systemPrompt ? 'Provided' : 'None'}`);
    logStep(`Max Tokens: ${maxTokens}`);

    const messages: Array<{ role: 'system' | 'user'; content: string }> = [];

    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      });
    }

    messages.push({
      role: 'user',
      content: prompt,
    });

    logStep('Sending request to OpenAI-compatible API');

    const response = await client.chat.completions.create({
      model: MODEL_NAME,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    });

    logStep('Received response from API');

    const generatedText =
      response.choices[0]?.message?.content?.trim() ||
      'No response generated';

    logStep(`Generated text length: ${generatedText.length} characters`);
    logEnd(`Inference completed successfully`);

    return generatedText;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep(`Error occurred: ${errorMessage}`);
    logEnd('Inference failed');
    throw error;
  }
}

/**
 * Run inference from a Docker image (optional feature)
 * Requires LOCAL_IMAGE_NAME environment variable to be set
 *
 * @param prompt The input prompt
 * @param systemPrompt Optional system prompt
 * @param maxTokens Maximum tokens for the response
 * @returns The model's generated response
 */
export async function runInferenceFromDockerImage(
  prompt: string,
  systemPrompt?: string,
  maxTokens: number = 220
): Promise<string> {
  logStart('Inference from Docker Image');

  if (!LOCAL_IMAGE_NAME) {
    logStep('Checking LOCAL_IMAGE_NAME environment variable');
    logEnd('ERROR: LOCAL_IMAGE_NAME not set');
    throw new Error('LOCAL_IMAGE_NAME environment variable is required for Docker image inference');
  }

  logStep(`Using Docker image: ${LOCAL_IMAGE_NAME}`);
  logStep('Docker-based inference not fully implemented');
  logEnd('Falling back to standard API inference');

  // Fall back to standard inference
  return runInference(prompt, systemPrompt, maxTokens);
}

/**
 * Validate that required environment variables are set
 *
 * @throws Error if required variables are missing
 */
export function validateEnvironmentVariables(): void {
  logStart('Environment Variables Validation');

  const missingVars: string[] = [];

  if (!HF_TOKEN) {
    missingVars.push('HF_TOKEN');
  }

  logStep(`API_BASE_URL: ${API_BASE_URL}`);
  logStep(`MODEL_NAME: ${MODEL_NAME}`);
  logStep(`HF_TOKEN: ${HF_TOKEN ? 'configured' : 'NOT SET'}`);
  logStep(`LOCAL_IMAGE_NAME: ${LOCAL_IMAGE_NAME ?? 'not set (optional)'}`);

  if (missingVars.length > 0) {
    logEnd(`ERROR: Missing required environment variables: ${missingVars.join(', ')}`);
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  logEnd('All required environment variables are properly configured');
}
