/**
 * conversation.ts — Chat & Analysis Prompt Builders
 *
 * Generates prompts for natural conversation, node analysis,
 * and branch summarisation. Returns markdown, not JSON.
 */

import { LLMMessage, EnhancedAIContext } from '../../../types';
import { buildSystemPrompt, buildGraphContextBlock, buildResearchContextBlock } from './system';

/**
 * Build messages for a general chat/analysis response.
 */
export function buildConversationPrompt(
  userMessage: string,
  context: EnhancedAIContext,
): LLMMessage[] {
  const system = buildSystemPrompt(context);
  const graphBlock = buildGraphContextBlock(context);
  const researchBlock = buildResearchContextBlock(context);

  // Include recent conversation history (last 10 messages)
  const historyStr = context.conversationHistory
    .slice(-10)
    .map(m => `${m.sender === 'user' ? 'USER' : 'AI'}: ${m.content.slice(0, 300)}`)
    .join('\n');

  const content = `${graphBlock}${researchBlock}

CONVERSATION HISTORY:
${historyStr || '(Start of conversation)'}

USER MESSAGE: ${userMessage}

INSTRUCTIONS:
- Respond naturally in markdown format.
- Be context-aware: reference the selected node, branch path, and graph state when relevant.
- Be analytical and insightful, not generic.
- If the user's question relates to a specific node, provide deep analysis.
- If you identify a potential new branch or risk, mention it as a suggestion (don't create it automatically).
- Keep responses focused and actionable. Avoid being verbose.
- Use bold, bullet points, and headers for clarity.`;

  return [system, { role: 'user', content }];
}

/**
 * Build messages for branch summarisation.
 */
export function buildSummarisationPrompt(
  nodeId: string,
  context: EnhancedAIContext,
): LLMMessage[] {
  const system = buildSystemPrompt(context);
  const graphBlock = buildGraphContextBlock(context);

  const node = context.selectedNode;
  const branchNodes = context.selectedBranch;

  const branchStr = branchNodes
    .map(n => `  [${n.id}] "${n.data.title}" — ${n.data.displayType}, confidence ${n.data.confidence}%, risk ${n.data.riskFactor}`)
    .join('\n');

  const content = `${graphBlock}

TASK: Summarise the branch rooted at "${node?.data.title ?? nodeId}" [${nodeId}].

Branch nodes:
${branchStr || 'No sub-nodes in this branch.'}

Generate a comprehensive branch summary in markdown that includes:
1. **Branch Overview** — what this branch covers
2. **Key Strengths** — top 2-3 advantages
3. **Key Risks** — top 2-3 risks or concerns
4. **Statistics** — node count, average confidence, creator breakdown
5. **Recommendation** — should this branch be expanded further, or is it ready for review?

Be specific. Reference actual node titles and data.`;

  return [system, { role: 'user', content }];
}
