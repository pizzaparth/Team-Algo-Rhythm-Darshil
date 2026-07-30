/**
 * expert.ts — Expert Recommendation Prompt
 *
 * Generates prompts for the LLM to recommend relevant domain experts.
 * Only used when the context genuinely warrants expert consultation.
 */

import type { LLMMessage, EnhancedAIContext } from '../../../types';
import { buildSystemPrompt, buildGraphContextBlock } from './system';

/**
 * Build messages for generating expert recommendations.
 */
export function buildExpertPrompt(
  context: EnhancedAIContext,
): LLMMessage[] {
  const system = buildSystemPrompt(context);
  const graphBlock = buildGraphContextBlock(context);

  const expertTypes = context.domainConfig.expertTypes.join(', ');

  const userMsg: LLMMessage = {
    role: 'user',
    content: `${graphBlock}

TASK: Based on the current planning context and the selected node, recommend 1-3 domain experts who could provide valuable input.

Expert types relevant to this domain: ${expertTypes}

Respond with ONLY a valid JSON object:
{
  "experts": [
    {
      "name": "string — realistic expert name",
      "title": "string — job title / position",
      "organization": "string — company / university / firm",
      "practiceArea": "string — specific area of expertise",
      "relevance": "string — why this expert matters for the current planning context",
      "website": "string — professional website URL if plausible"
    }
  ]
}

RULES:
- Only recommend experts when genuinely relevant. Return empty array otherwise.
- Use realistic names and organisations. Don't fabricate contact details like phone or email.
- Focus on publicly known experts in the field.`,
  };

  return [system, userMsg];
}
