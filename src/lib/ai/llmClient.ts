/**
 * llmClient.ts — OpenAI-compatible HTTP client for mimo-v2.5-pro
 *
 * Provider abstraction layer. Only this file knows about the specific
 * LLM provider. To swap providers (OpenAI, Anthropic, Google), change
 * only this file.
 *
 * Uses raw fetch for streaming support. No SDK dependency.
 */

import { LLMMessage } from '../../types';

// =============================================
// Configuration
// =============================================

const API_KEY = import.meta.env.VITE_MIMO_API_KEY ?? '';
const MODEL = import.meta.env.VITE_MIMO_MODEL ?? 'mimo-v2.5-pro';
const BASE_URL = '/api/mimo/v1'; // Proxied by Vite → https://api.xiaomimimo.com/v1

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
      'Authorization': `Bearer ${API_KEY}`,
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
      'Authorization': `Bearer ${API_KEY}`,
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
 */
export function isLLMConfigured(): boolean {
  return API_KEY.length > 0;
}
