/**
 * system.ts — Base System Prompt Builder
 *
 * Assembles the system prompt from domain config, output format
 * instructions, and planning principles.
 */

import { LLMMessage, DomainConfig, EnhancedAIContext } from '../../../types';

/**
 * Builds the base system message used in all planning/conversation requests.
 */
export function buildSystemPrompt(context: EnhancedAIContext): LLMMessage {
  const { domainConfig, graphSnapshot, planningMemory } = context;

  const nodeTypesStr = Object.entries(domainConfig.nodeTypeLabels)
    .map(([key, label]) => `  - ${key}: ${label}`)
    .join('\n');

  const graphSummary = graphSnapshot.serializedNodes.length > 0
    ? `The current decision graph has ${graphSnapshot.serializedNodes.length} nodes. Root: "${graphSnapshot.rootTitle}".`
    : 'The decision graph is empty. The user is starting a new planning session.';

  const memoryStr = planningMemory.expansionHistory.length > 0
    ? `\nPrevious expansions: ${planningMemory.expansionHistory.slice(-5).map(e => `Node ${e.nodeId} → ${e.childCount} children`).join(', ')}.`
    : '';

  const rejectedStr = planningMemory.rejectedSuggestions.length > 0
    ? `\nRejected suggestions (do not re-propose): ${planningMemory.rejectedSuggestions.map(s => s.title).join(', ')}.`
    : '';

  const prefsStr = Object.keys(planningMemory.userPreferences).length > 0
    ? `\nUser preferences: ${Object.entries(planningMemory.userPreferences).map(([k, v]) => `${k}=${v}`).join(', ')}.`
    : '';

  return {
    role: 'system',
    content: `You are an AI Planning Engine for the "${context.currentProject.name}" project.
Domain: ${domainConfig.displayName}.

${domainConfig.systemPromptFragment}

PLANNING PRINCIPLES:
1. Think step-by-step. Assess the complexity and scope of the problem before generating branches.
2. Default to incremental generation — produce 2-4 high-quality child nodes per expansion, not large trees.
3. Go deeper only when the problem genuinely requires additional decomposition.
4. Never generate filler or obvious placeholder nodes. Every node must add meaningful analytical value.
5. Ask clarification questions only when you genuinely cannot proceed without user input. Prefer to make reasonable assumptions and state them explicitly.
6. Treat user-created nodes exactly like AI-created nodes. Understand their position, context, and relationship in the graph.
7. When relevant, cite historical parallels (extract patterns, never copy events).
8. When appropriate, recommend domain experts with publicly available information.
9. Support your reasoning with evidence. Cite sources when available.

AVAILABLE NODE TYPES:
${nodeTypesStr}

GRAPH STATE:
${graphSummary}${memoryStr}${rejectedStr}${prefsStr}

IMPORTANT: When asked to generate nodes or plan, respond with valid JSON matching the requested schema. When in conversation mode, respond naturally in markdown.`,
  };
}

/**
 * Builds a compact graph context block for inclusion in prompts.
 */
export function buildGraphContextBlock(context: EnhancedAIContext): string {
  const { graphSnapshot, selectedNode, pathFromRoot } = context;

  if (graphSnapshot.serializedNodes.length === 0) {
    return 'GRAPH: Empty — no nodes yet.';
  }

  const nodesStr = graphSnapshot.serializedNodes
    .map(n => `  [${n.id}] "${n.title}" (${n.type}, confidence:${n.confidence}%, risk:${n.risk}, depth:${n.depth})`)
    .join('\n');

  const edgesStr = graphSnapshot.serializedEdges
    .map(e => `  ${e.source} → ${e.target}`)
    .join('\n');

  const selectedStr = selectedNode
    ? `\nSELECTED NODE: "${selectedNode.data.title}" [${selectedNode.id}]\n  Type: ${selectedNode.data.displayType}\n  Confidence: ${selectedNode.data.confidence}%\n  Risk: ${selectedNode.data.riskFactor}\n  Pros: ${selectedNode.data.pros.join('; ')}\n  Cons: ${selectedNode.data.cons.join('; ')}\n  Summary: ${selectedNode.data.summary}`
    : '\nNo node currently selected.';

  const pathStr = pathFromRoot.length > 0
    ? `\nBRANCH PATH: ${pathFromRoot.map(n => `"${n.data.title}"`).join(' → ')}`
    : '';

  return `GRAPH NODES:\n${nodesStr}\n\nGRAPH EDGES:\n${edgesStr}${selectedStr}${pathStr}`;
}

/**
 * Builds a research context block from processed research results.
 */
export function buildResearchContextBlock(context: EnhancedAIContext): string {
  if (context.researchContext.length === 0) return '';

  return '\nRESEARCH CONTEXT:\n' + context.researchContext
    .slice(-3) // Include last 3 research results
    .map(r => `  Query: "${r.query}"\n  Summary: ${r.summary}\n  Sources: ${r.sources.map(s => `${s.title} (${s.url})`).join(', ')}`)
    .join('\n\n');
}
