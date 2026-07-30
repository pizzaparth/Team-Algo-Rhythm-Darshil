// Author: Parth Pancholi

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAppStore, useGraphStore } from '../../store/';
import { FileText, Download, Code, Check } from 'lucide-react';

export const ExportModal: React.FC = () => {
  const { activeModal, closeModal, addToast } = useAppStore();
  const { nodes } = useGraphStore();
  const isOpen = activeModal === 'export';
  const [downloadedFormat, setDownloadedFormat] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = (format: string, filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadedFormat(format);
    addToast(`Exported graph as ${filename}`, 'success');
    setTimeout(() => setDownloadedFormat(null), 2500);
  };

  const markdownContent = `# Enterprise Architecture Modernization - Decision Blueprint\n\n` +
    nodes.map(n => `## [${n.data.displayType.toUpperCase()}] ${n.data.title}\n- **Status**: ${n.data.status}\n- **Confidence**: ${n.data.confidence}%\n- **Summary**: ${n.data.summary}\n- **Pros**: ${n.data.pros.join(', ')}\n\n`).join('');

  const jsonContent = JSON.stringify(nodes, null, 2);

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Export Decision Workspace Blueprint">
      <div className="space-y-4 text-xs">
        <p className="text-gray-400">
          Export your decision graph into documentation formats compatible with Obsidian, GitHub, architecture docs, or image tools.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Obsidian Markdown */}
          <div className="p-4 bg-[#161e2e] border border-[#1f293d] hover:border-indigo-500/40 rounded-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <h4 className="font-bold text-white">Obsidian Markdown (.md)</h4>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                Generates wiki-linked markdown suitable for personal knowledge management vaults.
              </p>
            </div>
            <button
              onClick={() => handleDownload('md', 'decision_blueprint.md', markdownContent)}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-colors"
            >
              {downloadedFormat === 'md' ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
              <span>Download .md</span>
            </button>
          </div>

          {/* JSON Schema */}
          <div className="p-4 bg-[#161e2e] border border-[#1f293d] hover:border-indigo-500/40 rounded-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <Code className="w-5 h-5 text-emerald-400" />
              <h4 className="font-bold text-white">JSON Blueprint Schema</h4>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                Export full graph data structure including positions, branch colors, and expert quotes.
              </p>
            </div>
            <button
              onClick={() => handleDownload('json', 'decision_graph.json', jsonContent)}
              className="w-full py-2 bg-[#1f293d] hover:bg-[#2b384e] text-white font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-colors"
            >
              {downloadedFormat === 'json' ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
              <span>Download .json</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
