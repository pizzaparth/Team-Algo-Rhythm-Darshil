/**
 * aiStatus.ts — cached "is the AI/search provider configured" check.
 *
 * The client no longer holds provider API keys (see server/routes/ai.ts),
 * so this can no longer be a synchronous `apiKey.length > 0` check. Instead
 * we fetch the server's `/api/v1/ai/status` once on module load and cache
 * the result, defaulting optimistically to `true` until it resolves so
 * nothing blocks on startup — real failures still surface cleanly via the
 * actual request's error handling either way.
 */

interface AIStatus {
  llmConfigured: boolean;
  searchConfigured: boolean;
}

let cached: AIStatus = { llmConfigured: true, searchConfigured: true };

const statusPromise: Promise<void> = fetch('/api/v1/ai/status')
  .then((res) => res.json())
  .then((body) => {
    cached = {
      llmConfigured: Boolean(body?.data?.llmConfigured),
      searchConfigured: Boolean(body?.data?.searchConfigured),
    };
  })
  .catch(() => {
    // Network error checking status — stay optimistic; the real call will
    // fail with a clear error if the server truly isn't reachable/configured.
  });

// Kick off immediately; callers don't need to await this for the
// synchronous getters below, but it's exposed for anything that wants to
// wait for the first real answer.
void statusPromise;

export function isLLMConfigured(): boolean {
  return cached.llmConfigured;
}

export function isSearchConfigured(): boolean {
  return cached.searchConfigured;
}
