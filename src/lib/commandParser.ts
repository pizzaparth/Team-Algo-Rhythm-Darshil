/**
 * commandParser.ts — Natural Language Command Parser
 *
 * Mocked regex-based parser that converts free-text user input
 * into graphCommands calls. Phase 4 replaces this with a real LLM parser.
 *
 * Per PRD §FR-8: "Natural-language instructions that manipulate the graph"
 *
 * Usage:
 *   const result = parseCommand("expand this node", selectedNodeId);
 *   if (result.recognized) { /* command was executed * / }
 */

import { graphCommands } from './graphCommands';
import { GraphCommand } from '../types';

export interface CommandParseResult {
  recognized: boolean;
  command?: GraphCommand;
  executed?: boolean;
  error?: string;
}

/**
 * Attempts to parse a natural language string into a graph command.
 * Returns { recognized: false } if the input doesn't match any command pattern,
 * allowing the caller to fall through to normal chat.
 */
export function parseCommand(input: string, selectedNodeId: string | null): CommandParseResult {
  const text = input.trim().toLowerCase();

  // === EXPAND ===
  // "expand this node", "expand selected", "expand node-3", "expand Strategy A"
  if (/^expand\b/.test(text)) {
    const nodeIdMatch = text.match(/expand\s+(?:node[- ]?)(\S+)/i);
    const targetId = nodeIdMatch ? `node-${nodeIdMatch[1]}` : selectedNodeId;
    if (!targetId) return { recognized: true, executed: false, error: 'No node selected to expand' };

    graphCommands.expandNode(targetId);
    return {
      recognized: true,
      executed: true,
      command: { commandName: 'expandNode', args: [targetId], description: `Expanding node ${targetId}` },
    };
  }

  // === DELETE ===
  // "delete this branch", "delete this node", "delete node-3"
  if (/^delete\b/.test(text)) {
    const nodeIdMatch = text.match(/delete\s+(?:node[- ]?)(\S+)/i);
    const targetId = nodeIdMatch ? `node-${nodeIdMatch[1]}` : selectedNodeId;
    if (!targetId) return { recognized: true, executed: false, error: 'No node selected to delete' };

    if (text.includes('branch')) {
      graphCommands.deleteBranch(targetId);
      return { recognized: true, executed: true, command: { commandName: 'deleteBranch', args: [targetId], description: `Deleting branch at ${targetId}` } };
    }
    graphCommands.deleteNode(targetId);
    return { recognized: true, executed: true, command: { commandName: 'deleteNode', args: [targetId], description: `Deleting node ${targetId}` } };
  }

  // === RENAME ===
  // "rename to Infrastructure Plan", "rename this node to New Title"
  if (/^rename\b/.test(text)) {
    const titleMatch = input.trim().match(/rename\s+(?:this\s+node\s+)?to\s+(.+)/i);
    if (!titleMatch || !selectedNodeId) {
      return { recognized: true, executed: false, error: titleMatch ? 'No node selected' : 'Usage: rename to <title>' };
    }
    const newTitle = titleMatch[1].trim();
    graphCommands.renameNode(selectedNodeId, newTitle);
    return { recognized: true, executed: true, command: { commandName: 'renameNode', args: [selectedNodeId, newTitle], description: `Renamed to "${newTitle}"` } };
  }

  // === COMPARE ===
  // "compare with node 2", "compare branches"
  if (/^compare\b/.test(text)) {
    const nodeIdMatch = text.match(/compare\s+(?:with\s+)?(?:node[- ]?)(\S+)/i);
    if (nodeIdMatch && selectedNodeId) {
      const targetId = `node-${nodeIdMatch[1]}`;
      graphCommands.compareBranches(selectedNodeId, targetId);
      return { recognized: true, executed: true, command: { commandName: 'compareBranches', args: [selectedNodeId, targetId], description: `Comparing branches` } };
    }
    return { recognized: true, executed: false, error: 'Usage: compare with node <id>' };
  }

  // === FOCUS ===
  // "focus this node", "focus node-3"
  if (/^focus\b/.test(text)) {
    const nodeIdMatch = text.match(/focus\s+(?:node[- ]?)(\S+)/i);
    const targetId = nodeIdMatch ? `node-${nodeIdMatch[1]}` : selectedNodeId;
    if (!targetId) return { recognized: true, executed: false, error: 'No node selected to focus' };

    graphCommands.focusNode(targetId);
    return { recognized: true, executed: true, command: { commandName: 'focusNode', args: [targetId], description: `Focused on ${targetId}` } };
  }

  // === BOOKMARK ===
  // "bookmark this", "bookmark node-3"
  if (/^bookmark\b/.test(text)) {
    const nodeIdMatch = text.match(/bookmark\s+(?:node[- ]?)(\S+)/i);
    const targetId = nodeIdMatch ? `node-${nodeIdMatch[1]}` : selectedNodeId;
    if (!targetId) return { recognized: true, executed: false, error: 'No node selected to bookmark' };

    graphCommands.bookmarkNode(targetId);
    return { recognized: true, executed: true, command: { commandName: 'bookmarkNode', args: [targetId], description: `Toggled bookmark on ${targetId}` } };
  }

  // === COLLAPSE ALL ===
  if (/^collapse\s+all\b/.test(text)) {
    graphCommands.collapseAll();
    return { recognized: true, executed: true, command: { commandName: 'collapseAll', args: [], description: 'Collapsed all subtrees' } };
  }

  // === EXPAND ALL ===
  if (/^expand\s+all\b/.test(text)) {
    graphCommands.expandAll();
    return { recognized: true, executed: true, command: { commandName: 'expandAll', args: [], description: 'Expanded all subtrees' } };
  }

  // === JUMP TO ROOT ===
  if (/^(?:jump\s+to\s+root|go\s+to\s+root|root)\b/.test(text)) {
    graphCommands.jumpToRoot();
    return { recognized: true, executed: true, command: { commandName: 'jumpToRoot', args: [], description: 'Jumped to root node' } };
  }

  // === DUPLICATE ===
  if (/^duplicate\b/.test(text)) {
    const targetId = selectedNodeId;
    if (!targetId) return { recognized: true, executed: false, error: 'No node selected to duplicate' };

    if (text.includes('branch')) {
      graphCommands.duplicateBranch(targetId);
      return { recognized: true, executed: true, command: { commandName: 'duplicateBranch', args: [targetId], description: `Duplicated branch at ${targetId}` } };
    }
    graphCommands.duplicateNode(targetId);
    return { recognized: true, executed: true, command: { commandName: 'duplicateNode', args: [targetId], description: `Duplicated node ${targetId}` } };
  }

  // === FIT VIEW ===
  if (/^(?:fit\s+view|fit|zoom\s+to\s+fit)\b/.test(text)) {
    graphCommands.fitView();
    return { recognized: true, executed: true, command: { commandName: 'fitView', args: [], description: 'Fit view' } };
  }

  // === LAYOUT ===
  if (/^(?:re-?layout|auto\s+layout|layout)\b/.test(text)) {
    graphCommands.applyLayout();
    return { recognized: true, executed: true, command: { commandName: 'applyLayout', args: [], description: 'Applied auto-layout' } };
  }

  // === CREATE CHILD ===
  if (/^(?:create\s+child|add\s+child|new\s+child)\b/.test(text)) {
    if (!selectedNodeId) return { recognized: true, executed: false, error: 'No node selected. Select a parent node first.' };
    const titleMatch = input.trim().match(/(?:create|add|new)\s+child\s+(?:named?\s+)?(.+)/i);
    const title = titleMatch ? titleMatch[1].trim() : 'New Child Node';
    graphCommands.createUserNode(selectedNodeId, { title, summary: 'User-created node.', creator: 'user' });
    return { recognized: true, executed: true, command: { commandName: 'createUserNode', args: [selectedNodeId, title], description: `Created child "${title}"` } };
  }

  // === UNDO / REDO ===
  if (/^undo\b/.test(text)) {
    graphCommands.undoLastAction();
    return { recognized: true, executed: true, command: { commandName: 'undo', args: [], description: 'Undo' } };
  }
  if (/^redo\b/.test(text)) {
    graphCommands.redoLastAction();
    return { recognized: true, executed: true, command: { commandName: 'redo', args: [], description: 'Redo' } };
  }

  // Not recognized — fall through to chat
  return { recognized: false };
}
