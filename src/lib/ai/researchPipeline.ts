/**
 * researchPipeline.ts — Tavily Research Integration
 *
 * Search → Filter → Deduplicate → Rank → Summarise → Feed into Planning Engine
 *
 * Uses Tavily via the server-side proxy (/api/v1/ai/search) — the real
 * Tavily key stays server-side (see server/routes/ai.ts) rather than
 * shipping in the client bundle.
 * Raw results are summarised by the LLM before being consumed.
 */

import type { ResearchResult, ProcessedResearch, EnhancedAIContext } from '../../types';
import { chatCompletion } from './llmClient';
import { buildResearchSummaryPrompt } from './prompts/research';
import { planningMemory } from './planningMemory';
import { isSearchConfigured } from './aiStatus';

interface TavilySearchOptions {
  searchDepth?: 'basic' | 'advanced';
  maxResults?: number;
  includeAnswer?: boolean;
  includeDomains?: string[];
  excludeDomains?: string[];
}

/**
 * Execute a full research pipeline:
 * 1. Tavily search
 * 2. Filter low-quality results
 * 3. Deduplicate by URL
 * 4. Rank by relevance score
 * 5. Summarise via LLM
 * 6. Return structured ProcessedResearch
 */
export async function research(
  query: string,
  context: EnhancedAIContext,
  options?: TavilySearchOptions,
): Promise<ProcessedResearch> {
  // Record the query in planning memory
  planningMemory.recordResearchQuery(query);

  // Step 1: Tavily search
  const rawResults = await tavilySearch(query, options);

  // Step 2: Filter — remove low-score results
  const filtered = rawResults.filter(r => r.score >= 0.3);

  // Step 3: Deduplicate by URL
  const seen = new Set<string>();
  const deduped = filtered.filter(r => {
    if (seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });

  // Step 4: Rank by score (already sorted by Tavily, but ensure)
  const ranked = deduped.sort((a, b) => b.score - a.score).slice(0, 8);

  // Step 5: Summarise via LLM
  let summary = '';
  let sources: ProcessedResearch['sources'] = [];

  if (ranked.length > 0) {
    try {
      const messages = buildResearchSummaryPrompt(query, ranked, context);
      const raw = await chatCompletion(messages, {
        temperature: 0.3,
        maxTokens: 1500,
        responseFormat: { type: 'json_object' },
      });

      const parsed = JSON.parse(raw);
      summary = parsed.summary ?? 'Research completed but summary generation failed.';
      sources = (parsed.sources ?? []).map((s: any) => ({
        title: s.title ?? 'Unknown',
        url: s.url ?? '',
        reliability: s.reliability ?? 'medium',
      }));
    } catch {
      // Fallback: concatenate snippets
      summary = ranked.slice(0, 3).map(r => r.content.slice(0, 200)).join('\n\n');
      sources = ranked.slice(0, 5).map(r => ({
        title: r.title,
        url: r.url,
        reliability: 'medium' as const,
      }));
    }
  } else {
    summary = `No relevant results found for "${query}". Try rephrasing or broadening your search.`;
  }

  return {
    query,
    results: ranked,
    summary,
    sources,
    timestamp: Date.now(),
  };
}

/**
 * Low-level Tavily API call.
 */
async function tavilySearch(
  query: string,
  options?: TavilySearchOptions,
): Promise<ResearchResult[]> {
  if (!isSearchConfigured()) {
    console.warn('[ResearchPipeline] Tavily is not configured on the server');
    return [];
  }

  try {
    const response = await fetch('/api/v1/ai/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        search_depth: options?.searchDepth ?? 'advanced',
        max_results: options?.maxResults ?? 10,
        include_answer: options?.includeAnswer ?? false,
        include_domains: options?.includeDomains,
        exclude_domains: options?.excludeDomains,
      }),
    });

    if (!response.ok) {
      console.error(`[ResearchPipeline] Tavily API error: ${response.status}`);
      return [];
    }

    const data = await response.json();

    return (data.results ?? []).map((r: any) => ({
      title: r.title ?? '',
      url: r.url ?? '',
      content: r.content ?? '',
      score: r.score ?? 0,
      publishedDate: r.published_date,
    }));
  } catch (err) {
    console.error('[ResearchPipeline] Tavily search failed:', err);
    return [];
  }
}

/**
 * Check if Tavily is configured.
 */
export function isTavilyConfigured(): boolean {
  return isSearchConfigured();
}
