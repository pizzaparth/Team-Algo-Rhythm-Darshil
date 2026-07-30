/**
 * responseParser.ts — LLM Response Parser & Validator
 *
 * Safely parses JSON from LLM output. Handles:
 * - Markdown-wrapped JSON (```json ... ```)
 * - Partial/malformed JSON
 * - Missing fields (applies defaults)
 * - Invalid node types (normalises)
 * - Type validation against GeneratedNode schema
 */

import { GeneratedNode, AISuggestion, NodeType, NodeStatus } from '../../types';

// =============================================
// JSON Extraction
// =============================================

/**
 * Extract JSON from LLM output that may contain markdown code blocks,
 * explanatory text, or other wrapping.
 */
export function extractJSON(text: string): any | null {
  // Try 1: Direct parse
  try {
    return JSON.parse(text.trim());
  } catch { /* continue */ }

  // Try 2: Extract from markdown code block
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch { /* continue */ }
  }

  // Try 3: Find first { ... } block
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.slice(firstBrace, lastBrace + 1));
    } catch { /* continue */ }
  }

  // Try 4: Find first [ ... ] block (for arrays)
  const firstBracket = text.indexOf('[');
  const lastBracket = text.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    try {
      return JSON.parse(text.slice(firstBracket, lastBracket + 1));
    } catch { /* continue */ }
  }

  return null;
}

// =============================================
// Node Validation
// =============================================

const VALID_NODE_TYPES: NodeType[] = ['root', 'strategic', 'alternative', 'risk', 'prerequisite', 'outcome'];
const VALID_RISK_FACTORS = ['Low', 'Medium', 'High', 'Critical'];

/**
 * Normalise an internal type string to a valid NodeType.
 */
function normalizeNodeType(type: string): NodeType {
  const lower = type.toLowerCase().trim();
  if (VALID_NODE_TYPES.includes(lower as NodeType)) return lower as NodeType;
  if (lower.includes('strat')) return 'strategic';
  if (lower.includes('alt')) return 'alternative';
  if (lower.includes('risk')) return 'risk';
  if (lower.includes('prereq')) return 'prerequisite';
  if (lower.includes('out')) return 'outcome';
  return 'strategic'; // Default fallback
}

/**
 * Map internalType to displayType label.
 */
function typeToDisplayType(internalType: NodeType): string {
  const map: Record<NodeType, string> = {
    root: 'Root Decision',
    strategic: 'Strategic Option',
    alternative: 'Alternative Option',
    risk: 'Risk Factor',
    prerequisite: 'Prerequisite',
    outcome: 'Expected Outcome',
  };
  return map[internalType] ?? 'Strategic Option';
}

/**
 * Validate and normalise a single raw node from LLM output into a GeneratedNode.
 */
function validateNode(raw: any, parentId: string, index: number): GeneratedNode {
  return {
    tempId: `gen-llm-${Date.now()}-${index}`,
    parentId,
    title: typeof raw.title === 'string' ? raw.title.trim() : `Branch ${index + 1}`,
    summary: typeof raw.summary === 'string' ? raw.summary.trim() : '',
    displayType: typeof raw.displayType === 'string' ? raw.displayType : typeToDisplayType(normalizeNodeType(raw.internalType ?? 'strategic')),
    internalType: normalizeNodeType(raw.internalType ?? 'strategic'),
    status: 'proposed' as NodeStatus,
    confidence: typeof raw.confidence === 'number'
      ? Math.max(0, Math.min(100, Math.round(raw.confidence)))
      : 75,
    pros: Array.isArray(raw.pros) ? raw.pros.filter((p: any) => typeof p === 'string') : [],
    cons: Array.isArray(raw.cons) ? raw.cons.filter((c: any) => typeof c === 'string') : [],
    riskFactor: VALID_RISK_FACTORS.includes(raw.riskFactor) ? raw.riskFactor : 'Medium',
  };
}

// =============================================
// Public Parsing Functions
// =============================================

/**
 * Parse an expansion response from the LLM.
 * Expected format: { nodes: [...], reasoning?: string, suggestions?: [...], ... }
 */
export function parseExpansionResponse(
  raw: string,
  parentId: string,
): {
  nodes: GeneratedNode[];
  reasoning: string;
  suggestions: AISuggestion[];
  historicalReferences: any[];
  expertRecommendations: any[];
} {
  const parsed = extractJSON(raw);

  if (!parsed) {
    console.warn('[ResponseParser] Failed to parse expansion JSON, using empty result');
    return { nodes: [], reasoning: 'Failed to parse AI response.', suggestions: [], historicalReferences: [], expertRecommendations: [] };
  }

  const rawNodes = Array.isArray(parsed.nodes) ? parsed.nodes : [];
  const nodes = rawNodes.map((n: any, i: number) => validateNode(n, parentId, i));

  const suggestions: AISuggestion[] = Array.isArray(parsed.suggestions)
    ? parsed.suggestions
      .filter((s: any) => s.title && s.description)
      .map((s: any, i: number) => ({
        id: `sug-llm-${Date.now()}-${i}`,
        nodeId: s.targetNodeId ?? parentId,
        title: s.title,
        description: s.description,
        suggestedType: s.suggestedType ?? 'Strategic Alternative',
        impactScore: typeof s.impactScore === 'number' ? s.impactScore : 70,
        actionType: 'add_branch' as const,
      }))
    : [];

  return {
    nodes,
    reasoning: typeof parsed.reasoning === 'string' ? parsed.reasoning : '',
    suggestions,
    historicalReferences: Array.isArray(parsed.historicalReferences) ? parsed.historicalReferences : [],
    expertRecommendations: Array.isArray(parsed.expertRecommendations) ? parsed.expertRecommendations : [],
  };
}

/**
 * Parse a clarification response from the LLM.
 */
export function parseClarificationResponse(raw: string): {
  needsClarification: boolean;
  question: string;
  context: string;
  options: string[];
  assumptions: string;
} {
  const parsed = extractJSON(raw);

  if (!parsed) {
    return { needsClarification: false, question: '', context: '', options: [], assumptions: '' };
  }

  return {
    needsClarification: !!parsed.needsClarification,
    question: parsed.question ?? '',
    context: parsed.context ?? '',
    options: Array.isArray(parsed.options) ? parsed.options : [],
    assumptions: parsed.assumptions ?? '',
  };
}

/**
 * Parse a research summary response from the LLM.
 */
export function parseResearchSummary(raw: string): {
  summary: string;
  sources: { title: string; url: string; reliability: 'high' | 'medium' | 'low' }[];
} {
  const parsed = extractJSON(raw);
  if (!parsed) return { summary: raw, sources: [] };

  return {
    summary: parsed.summary ?? raw,
    sources: Array.isArray(parsed.sources) ? parsed.sources : [],
  };
}

/**
 * Parse suggestion response from the LLM.
 */
export function parseSuggestionResponse(raw: string): AISuggestion[] {
  const parsed = extractJSON(raw);
  if (!parsed || !Array.isArray(parsed.suggestions)) return [];

  return parsed.suggestions
    .filter((s: any) => s.title && s.description)
    .map((s: any, i: number) => ({
      id: `sug-llm-${Date.now()}-${i}`,
      nodeId: s.targetNodeId ?? '',
      title: s.title,
      description: s.description,
      suggestedType: s.suggestedType ?? 'Strategic Alternative',
      impactScore: typeof s.impactScore === 'number' ? s.impactScore : 70,
      actionType: 'add_branch' as const,
    }));
}
