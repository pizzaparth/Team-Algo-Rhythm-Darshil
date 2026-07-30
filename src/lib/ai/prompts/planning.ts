/**
 * planning.ts — Node Expansion & Planning Prompts
 *
 * Generates prompts that instruct the LLM to produce GeneratedNode[]
 * for graph expansion. Uses structured JSON output.
 */

import { LLMMessage, EnhancedAIContext } from '../../../types';
import { buildSystemPrompt, buildGraphContextBlock, buildResearchContextBlock } from './system';

/**
 * Build messages for expanding a specific node.
 * The LLM must return JSON matching the GeneratedNode[] schema.
 */
export function buildExpansionPrompt(
  nodeId: string,
  context: EnhancedAIContext,
  userHint?: string,
): LLMMessage[] {
  const system = buildSystemPrompt(context);
  const graphBlock = buildGraphContextBlock(context);
  const researchBlock = buildResearchContextBlock(context);

  const node = context.selectedNode ?? context.graphSnapshot.serializedNodes.find(n => n.id === nodeId);
  const nodeTitle = node ? (context.selectedNode?.data.title ?? (node as any).title ?? nodeId) : nodeId;

  // Include recent conversation for topic context
  const conversationStr = context.conversationHistory
    ?.slice(-6)
    .map(m => `${m.sender === 'user' ? 'USER' : 'AI'}: ${m.content.slice(0, 200)}`)
    .join('\n') || '';

  const conversationBlock = conversationStr
    ? `\nRECENT CONVERSATION (for topic context):\n${conversationStr}\n`
    : '';

  const userMessage = `${graphBlock}${researchBlock}${conversationBlock}

TASK: Expand the node "${nodeTitle}" [${nodeId}].

Generate 2-4 child nodes that represent the most important sub-strategies, risks, alternatives, prerequisites, or outcomes for this node. Each child should add genuine analytical value.

CRITICAL: The child nodes MUST be directly relevant to the topic "${nodeTitle}" and the conversation context above. Do NOT generate generic business strategy nodes unless the topic is actually about business strategy.

${userHint ? `USER CONTEXT: ${userHint}\n` : ''}
Respond with ONLY a valid JSON object in this exact format:
{
  "nodes": [
    {
      "title": "string — concise, descriptive title",
      "summary": "string — 1-3 sentence detailed description of this node's strategic value",
      "displayType": "string — one of: Strategic Option, Alternative Option, Risk Factor, Prerequisite, Expected Outcome",
      "internalType": "string — one of: strategic, alternative, risk, prerequisite, outcome",
      "confidence": "number — 0-100, your confidence in this recommendation",
      "pros": ["string — key advantage 1", "string — key advantage 2"],
      "cons": ["string — key risk/downside 1", "string — key risk/downside 2"],
      "riskFactor": "string — one of: Low, Medium, High, Critical"
    }
  ],
  "reasoning": "string — brief explanation of why you chose these specific branches",
  "suggestions": [
    {
      "title": "string — optional proactive suggestion title",
      "description": "string — why this suggestion matters",
      "suggestedType": "string — type label",
      "impactScore": "number — 0-100"
    }
  ],
  "historicalReferences": [
    {
      "entity": "string — company, country, or person",
      "caseStudy": "string — what happened",
      "outcome": "string — result",
      "relevance": "string — why it matters here"
    }
  ],
  "expertRecommendations": [
    {
      "name": "string — expert name",
      "title": "string — job title",
      "organization": "string — org name",
      "practiceArea": "string — area of expertise",
      "relevance": "string — why this expert matters"
    }
  ]
}

RULES:
- Generate 2-4 nodes. Quality over quantity.
- Each node must be genuinely distinct — no overlapping strategies.
- Each node MUST be directly relevant to "${nodeTitle}" — stay on topic.
- Confidence scores should reflect your actual certainty. Don't default to 85+.
- historicalReferences and expertRecommendations are optional. Include only when genuinely relevant.
- suggestions are optional. Include only if you discover a branch the user hasn't considered.`;

  return [system, { role: 'user', content: userMessage }];
}

/**
 * Build messages for the initial planning phase (first expansion from root).
 */
export function buildInitialPlanPrompt(
  rootTitle: string,
  userDescription: string,
  context: EnhancedAIContext,
): LLMMessage[] {
  const system = buildSystemPrompt(context);
  const researchBlock = buildResearchContextBlock(context);

  const userMessage = `The user wants to plan: "${rootTitle}"

Their description: "${userDescription}"
${researchBlock}

TASK: Generate the initial planning branches for this decision. Create 3-5 top-level child nodes that represent the major strategic directions, key risks, and critical prerequisites.

Respond with ONLY a valid JSON object in this exact format:
{
  "nodes": [
    {
      "title": "string",
      "summary": "string",
      "displayType": "string — Strategic Option | Alternative Option | Risk Factor | Prerequisite | Expected Outcome",
      "internalType": "string — strategic | alternative | risk | prerequisite | outcome",
      "confidence": "number 0-100",
      "pros": ["string"],
      "cons": ["string"],
      "riskFactor": "string — Low | Medium | High | Critical"
    }
  ],
  "reasoning": "string"
}`;

  return [system, { role: 'user', content: userMessage }];
}

/**
 * Build messages for clarification — when the AI needs more info before expanding.
 */
export function buildClarificationPrompt(
  nodeId: string,
  context: EnhancedAIContext,
): LLMMessage[] {
  const system = buildSystemPrompt(context);
  const graphBlock = buildGraphContextBlock(context);

  const node = context.selectedNode;
  const nodeTitle = node?.data.title ?? nodeId;

  const userMessage = `${graphBlock}

TASK: You are about to expand the node "${nodeTitle}" [${nodeId}], but it has high risk or complexity.

Determine if you need clarification from the user before proceeding. If you can proceed with reasonable assumptions, say so. If you genuinely need input, generate a clarification question.

Respond with ONLY a valid JSON object:
{
  "needsClarification": true/false,
  "question": "string — the question to ask (only if needsClarification is true)",
  "context": "string — why this question matters",
  "options": ["string — option 1", "string — option 2", "string — option 3"],
  "assumptions": "string — what you would assume if the user doesn't answer"
}`;

  return [system, { role: 'user', content: userMessage }];
}
