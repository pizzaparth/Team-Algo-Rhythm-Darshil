/**
 * llmClient.ts — client for the server-proxied mimo-v2.5-pro chat API.
 *
 * Provider abstraction layer. Only this file (plus its server-side
 * counterpart, server/routes/ai.ts) knows about the specific LLM provider.
 *
 * Requests go to this same-origin server route rather than the provider
 * directly — the server holds the real API key so it never ships in the
 * client bundle, and this same code path works in both dev (Vite proxies
 * /api/v1 → the local Express server) and production.
 *
 * Uses raw fetch for streaming support. No SDK dependency.
 */

import type { LLMMessage } from '../../types';
import { isLLMConfigured as isLLMConfiguredCached } from './aiStatus';

// =============================================
// Configuration
// =============================================

const MODEL = import.meta.env.VITE_MIMO_MODEL ?? 'mimo-v2.5-pro';
const BASE_URL = '/api/v1/ai';

interface LLMOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  responseFormat?: { type: 'json_object' | 'text' };
}

const DEFAULT_OPTIONS: LLMOptions = {
  model: MODEL,
  temperature: 0.7,
  maxTokens: 4096,
  stream: false,
};

// =============================================
// Non-streaming completion
// =============================================

/**
 * Sends a chat completion request and returns the full response text.
 * Used for planning, expansion, and structured JSON responses.
 */
export async function chatCompletion(
  messages: LLMMessage[],
  options?: Partial<LLMOptions>
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const body: Record<string, any> = {
    model: opts.model,
    messages,
    temperature: opts.temperature,
    max_tokens: opts.maxTokens,
    stream: false,
  };

  if (opts.responseFormat) {
    body.response_format = opts.responseFormat;
  }

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`LLM API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}

// =============================================
// Streaming completion
// =============================================

/**
 * Sends a streaming chat completion request.
 * Calls onChunk for each text delta. Returns the full accumulated text.
 * Used for conversational responses where we want real-time streaming.
 */
export async function chatCompletionStream(
  messages: LLMMessage[],
  onChunk: (text: string) => void,
  options?: Partial<LLMOptions>
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const body: Record<string, any> = {
    model: opts.model,
    messages,
    temperature: opts.temperature,
    max_tokens: opts.maxTokens,
    stream: true,
  };

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`LLM API error (${response.status}): ${errorText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No readable stream available');

  const decoder = new TextDecoder();
  let accumulated = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Process SSE lines
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? ''; // Keep incomplete line in buffer

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;
      if (!trimmed.startsWith('data: ')) continue;

      try {
        const json = JSON.parse(trimmed.slice(6));
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) {
          accumulated += delta;
          onChunk(delta);
        }
      } catch {
        // Skip malformed SSE chunks
      }
    }
  }

  return accumulated;
}

/**
 * Check if the LLM client is configured with valid credentials.
 * Backed by a cached server-status check (see ./aiStatus) since the
 * client no longer holds the API key itself.
 */
export function isLLMConfigured(): boolean {
  return isLLMConfiguredCached();
}
