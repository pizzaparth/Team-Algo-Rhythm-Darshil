/**
 * server/routes/ai.ts
 *
 * Server-side proxy for the LLM (mimo) and search (Tavily) providers.
 *
 * Why this exists: the client used to call these providers directly via
 * `/api/mimo` and `/api/tavily`, which only resolved to the real APIs
 * through Vite's *dev-server-only* proxy (vite.config.ts). In production
 * there is no such proxy, so those requests fell through to the SPA's
 * catch-all route and returned index.html instead of a real response —
 * breaking every AI feature (chat, node expansion, research) outside of
 * `npm run dev`. Worse, the client held the real provider API keys via
 * `VITE_*` env vars, which get inlined into the public JS bundle.
 *
 * Fix: the client no longer holds any provider credentials. It calls
 * these same-origin routes, and this server (which does hold the keys,
 * read from process.env — no VITE_ prefix required) forwards the
 * request upstream. This works identically in dev (proxied by Vite's
 * existing `/api/v1` → localhost:3002 rule) and in production.
 */

import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger.js';

const router = Router();

const MIMO_BASE_URL = 'https://api.xiaomimimo.com/v1';
const TAVILY_BASE_URL = 'https://api.tavily.com';

// Read lazily (inside handlers) rather than caching into a module-level
// const. Route modules are imported — and therefore fully evaluated — by
// ES module hoisting before index.ts's own top-level `dotenv.config()`
// call runs, so a module-scope `process.env.X` read here would always
// see an empty value. Reading inside each handler guarantees env vars
// are populated by then (requests only arrive after startup completes).
// Reuses the existing VITE_-prefixed names (that prefix is a Vite
// client-bundling convention only — Node reads any process.env var
// regardless of prefix) so nothing in .env needs to be renamed.
function getMimoApiKey(): string {
  return process.env.VITE_MIMO_API_KEY ?? '';
}
function getMimoModel(): string {
  return process.env.VITE_MIMO_MODEL ?? 'mimo-v2.5-pro';
}
function getTavilyApiKey(): string {
  return process.env.VITE_TAVILY_API_KEY ?? '';
}

// GET /api/v1/ai/status — lets the client know (without ever seeing the
// keys themselves) whether each provider is configured on this server.
router.get('/status', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      llmConfigured: getMimoApiKey().length > 0,
      searchConfigured: getTavilyApiKey().length > 0,
    },
  });
});

// POST /api/v1/ai/chat/completions — forwards to the mimo chat completions
// API, injecting the server-held key. Supports both streaming (SSE) and
// non-streaming responses, matching the shape llmClient.ts already expects.
router.post('/chat/completions', async (req: Request, res: Response) => {
  const apiKey = getMimoApiKey();
  if (!apiKey) {
    return res.status(503).json({
      success: false,
      error: { code: 'AI_NOT_CONFIGURED', message: 'VITE_MIMO_API_KEY is not set on the server.' },
    });
  }

  try {
    const upstream = await fetch(`${MIMO_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ ...req.body, model: req.body?.model ?? getMimoModel() }),
    });

    if (req.body?.stream) {
      res.status(upstream.status);
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      if (!upstream.body) {
        return res.end();
      }
      const reader = upstream.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(decoder.decode(value, { stream: true }));
      }
      return res.end();
    }

    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    logger.error(`[AI Proxy] mimo chat completions failed: ${err}`);
    res.status(502).json({
      success: false,
      error: { code: 'UPSTREAM_ERROR', message: err instanceof Error ? err.message : 'Unknown upstream error' },
    });
  }
});

// POST /api/v1/ai/search — forwards to Tavily, injecting the server-held key.
router.post('/search', async (req: Request, res: Response) => {
  const apiKey = getTavilyApiKey();
  if (!apiKey) {
    return res.status(503).json({
      success: false,
      error: { code: 'SEARCH_NOT_CONFIGURED', message: 'VITE_TAVILY_API_KEY is not set on the server.' },
    });
  }

  try {
    const upstream = await fetch(`${TAVILY_BASE_URL}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...req.body, api_key: apiKey }),
    });

    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    logger.error(`[AI Proxy] Tavily search failed: ${err}`);
    res.status(502).json({
      success: false,
      error: { code: 'UPSTREAM_ERROR', message: err instanceof Error ? err.message : 'Unknown upstream error' },
    });
  }
});

export default router;
