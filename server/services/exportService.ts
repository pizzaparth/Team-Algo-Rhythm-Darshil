/**
 * server/services/exportService.ts
 * Modular export engine: Markdown, JSON, Mermaid, graph format.
 * PDF export uses a lightweight html-to-text approach (no headless browser needed in dev).
 */

import { projectRepository } from '../repositories/projectRepository.js';
import { exportRepository } from '../repositories/exportRepository.js';
import { uid } from '../utils/id.js';
import { NotFoundError } from '../utils/errors.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXPORT_DIR = path.join(__dirname, '../../data/exports');

if (!fs.existsSync(EXPORT_DIR)) fs.mkdirSync(EXPORT_DIR, { recursive: true });

// ============================================================
// Graph types (mirrors frontend types)
// ============================================================

interface NodeData {
  title: string;
  summary: string;
  displayType: string;
  internalType: string;
  confidence: number;
  riskFactor: string;
  pros: string[];
  cons: string[];
  notes?: string;
  creator: string;
  depth: number;
}

interface GraphNode {
  id: string;
  data: NodeData;
  position: { x: number; y: number };
}

interface GraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
}

// ============================================================
// Markdown Export
// ============================================================

function exportMarkdown(nodes: GraphNode[], edges: GraphEdge[], projectName: string): string {
  const childMap = new Map<string, string[]>();
  edges.forEach(e => {
    if (!childMap.has(e.sourceId)) childMap.set(e.sourceId, []);
    childMap.get(e.sourceId)!.push(e.targetId);
  });

  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const roots = nodes.filter(n => n.data.internalType === 'root' || !edges.find(e => e.targetId === n.id));

  const lines: string[] = [
    `# ${projectName}`,
    '',
    `*Exported from AI Reasoning Workspace — ${new Date().toLocaleDateString()}*`,
    '',
    '---',
    '',
  ];

  function renderNode(nodeId: string, depth: number): void {
    const node = nodeMap.get(nodeId);
    if (!node) return;
    const d = node.data;
    const indent = '#'.repeat(Math.min(depth + 1, 6));

    lines.push(`${indent} ${d.title}`);
    lines.push('');
    if (d.summary) lines.push(`> ${d.summary}`);
    lines.push('');
    lines.push(`| Attribute | Value |`);
    lines.push(`|-----------|-------|`);
    lines.push(`| Type | ${d.displayType} |`);
    lines.push(`| Confidence | ${d.confidence}% |`);
    lines.push(`| Risk | ${d.riskFactor} |`);
    lines.push(`| Creator | ${d.creator === 'ai' ? '🤖 AI' : '👤 User'} |`);
    lines.push('');

    if (d.pros?.length) {
      lines.push('**Advantages:**');
      d.pros.forEach(p => lines.push(`- ✅ ${p}`));
      lines.push('');
    }
    if (d.cons?.length) {
      lines.push('**Risks/Challenges:**');
      d.cons.forEach(c => lines.push(`- ⚠️ ${c}`));
      lines.push('');
    }
    if (d.notes) {
      lines.push(`**Notes:** ${d.notes}`);
      lines.push('');
    }

    const children = childMap.get(nodeId) ?? [];
    children.forEach(childId => renderNode(childId, depth + 1));
  }

  roots.forEach(r => renderNode(r.id, 1));
  return lines.join('\n');
}

// ============================================================
// Mermaid Export
// ============================================================

function exportMermaid(nodes: GraphNode[], edges: GraphEdge[]): string {
  const lines = ['flowchart LR'];
  const sanitize = (s: string) => s.replace(/["`\n\r]/g, ' ').slice(0, 50);

  nodes.forEach(n => {
    const label = sanitize(n.data.title);
    const shape = n.data.internalType === 'root' ? `["${label}"]`
      : n.data.internalType === 'risk' ? `{{"${label}"}}`
      : n.data.internalType === 'outcome' ? `(("${label}"))`
      : `["${label}"]`;
    lines.push(`    ${n.id}${shape}`);
  });

  edges.forEach(e => {
    lines.push(`    ${e.sourceId} --> ${e.targetId}`);
  });

  return lines.join('\n');
}

// ============================================================
// JSON Export
// ============================================================

function exportJSON(nodes: GraphNode[], edges: GraphEdge[], projectName: string): string {
  return JSON.stringify({
    version: '1.0',
    format: 'ai-reasoning-workspace',
    exportedAt: new Date().toISOString(),
    project: { name: projectName },
    nodes,
    edges,
    nodeCount: nodes.length,
    edgeCount: edges.length,
  }, null, 2);
}

// ============================================================
// Public Service
// ============================================================

export const exportService = {
  async export(projectId: string, userId: string, format: string, options: any = {}): Promise<{
    content: string;
    filename: string;
    mimeType: string;
    exportId: string;
  }> {
    const snapshot = projectRepository.getLatestSnapshot(projectId);
    if (!snapshot) throw new NotFoundError('No graph data to export');

    const nodes: GraphNode[] = JSON.parse(snapshot.nodes_json);
    const edges: GraphEdge[] = JSON.parse(snapshot.edges_json);

    // Get project name from DB (approximate — repository gives us what we need)
    const projectName = options.projectName ?? 'Planning Workspace';

    let content: string;
    let filename: string;
    let mimeType: string;

    switch (format) {
      case 'markdown': {
        content = exportMarkdown(nodes, edges, projectName);
        filename = `${slugify(projectName)}.md`;
        mimeType = 'text/markdown';
        break;
      }
      case 'json': {
        content = exportJSON(nodes, edges, projectName);
        filename = `${slugify(projectName)}.json`;
        mimeType = 'application/json';
        break;
      }
      case 'mermaid': {
        content = exportMermaid(nodes, edges);
        filename = `${slugify(projectName)}.mmd`;
        mimeType = 'text/plain';
        break;
      }
      case 'graph': {
        content = JSON.stringify({ nodes, edges }, null, 2);
        filename = `${slugify(projectName)}-graph.json`;
        mimeType = 'application/json';
        break;
      }
      default:
        throw new NotFoundError(`Export format '${format}' not supported`);
    }

    // Record in exports table
    const exportId = uid();
    exportRepository.create({ id: exportId, projectId, userId, format });

    return { content, filename, mimeType, exportId };
  },

  getHistory(projectId: string, userId: string) {
    return exportRepository.listByProject(projectId);
  },
};

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
