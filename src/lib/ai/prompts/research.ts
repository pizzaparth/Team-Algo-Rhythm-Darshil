/**
 * research.ts — Research Summarisation Prompt
 *
 * Generates prompts for the LLM to summarise Tavily search results
 * into structured, actionable research briefs.
 */

import type { LLMMessage, ResearchResult, EnhancedAIContext } from '../../../types';

/**
 * Build messages for summarising raw research results.
 */
export function buildResearchSummaryPrompt(
  query: string,
  results: ResearchResult[],
  context: EnhancedAIContext,
): LLMMessage[] {
  const resultsStr = results
    .slice(0, 8)
    .map((r, i) => `[${i + 1}] Title: "${r.title}"\n    URL: ${r.url}\n    Score: ${r.score}\n    Content: ${r.content.slice(0, 500)}${r.content.length > 500 ? '...' : ''}`)
    .join('\n\n');

  const systemMsg: LLMMessage = {
    role: 'system',
    content: `You are a research analyst. Summarise search results into concise, actionable briefs. Focus on facts, data, and insights relevant to strategic planning. Cite sources by number [1], [2], etc.`,
  };

  const userMsg: LLMMessage = {
    role: 'user',
    content: `Research query: "${query}"

Context: This research supports planning for the "${context.currentProject.name}" project (${context.domainConfig.displayName}).

SEARCH RESULTS:
${resultsStr}

Respond with ONLY a valid JSON object:
{
  "summary": "string — 2-4 paragraph synthesis of key findings. Use [1], [2] citation markers.",
  "keyInsights": ["string — insight 1", "string — insight 2", "string — insight 3"],
  "sources": [
    {
      "title": "string — source title",
      "url": "string — source URL",
      "reliability": "string — high, medium, or low based on source type"
    }
  ],
  "relevanceToPlanning": "string — how these findings should influence the planning process"
}`,
  };

  return [systemMsg, userMsg];
}
