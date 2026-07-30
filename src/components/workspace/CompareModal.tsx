// Author: Parth Pancholi

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAppStore, useGraphStore } from '../../store/';
import { CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export const CompareModal: React.FC = () => {
  const { activeModal, closeModal, modalData } = useAppStore();
  const { nodes } = useGraphStore();
  const isOpen = activeModal === 'compare';

  const firstNodeId = modalData?.firstNodeId;
  const firstNode = nodes.find(n => n.id === firstNodeId);

  const [secondNodeId, setSecondNodeId] = useState<string>(
    nodes.find(n => n.id !== firstNodeId)?.id || ''
  );

  const secondNode = nodes.find(n => n.id === secondNodeId);

  if (!isOpen || !firstNode) return null;

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Compare Decision Nodes Side-by-Side" maxWidth="max-w-4xl">
      <div className="space-y-4">
        {/* Selector for second node */}
        <div className="flex items-center space-x-3 bg-[#161e2e] p-3 rounded-xl border border-[#1f293d]">
          <span className="text-xs font-semibold text-gray-400 shrink-0">Compare {firstNode.data.title} against:</span>
          <select
            value={secondNodeId}
            onChange={(e) => setSecondNodeId(e.target.value)}
            className="bg-[#111827] border border-[#2b384e] text-white text-xs rounded-lg p-2 focus:outline-none flex-1"
          >
            {nodes.filter(n => n.id !== firstNode.id).map(n => (
              <option key={n.id} value={n.id}>{n.data.title} ({n.data.displayType})</option>
            ))}
          </select>
        </div>

        {/* Side-by-side Comparison Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          {/* Node 1 Column */}
          <div className="p-4 bg-[#161e2e] border border-[#1f293d] rounded-xl space-y-3">
            <div className="flex items-center justify-between text-[10px] text-indigo-400 font-semibold">
              <span>NODE 1 (SELECTED)</span>
              <span>L{firstNode.data.depth}</span>
            </div>
            <h4 className="text-sm font-bold text-white">{firstNode.data.title}</h4>
            <p className="text-gray-400 text-xs">{firstNode.data.summary}</p>

            <div className="pt-2 border-t border-[#1f293d] space-y-2">
              <div className="flex justify-between font-mono">
                <span className="text-gray-400">Confidence Score:</span>
                <span className="font-bold">{firstNode.data.confidence}%</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-gray-400">Risk Factor:</span>
                <span className="text-amber-400 font-bold">{firstNode.data.riskFactor}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#1f293d]">
              <div className="font-semibold text-emerald-400">Pros ({firstNode.data.pros.length})</div>
              <ul className="space-y-1">
                {firstNode.data.pros.map((p, i) => (
                  <li key={i} className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 rounded text-[11px]">
                    • {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Node 2 Column */}
          {secondNode ? (
            <div className="p-4 bg-[#161e2e] border border-[#1f293d] rounded-xl space-y-3">
              <div className="flex items-center justify-between text-[10px] text-blue-400 font-semibold">
                <span>NODE 2 (COMPARISON)</span>
                <span>L{secondNode.data.depth}</span>
              </div>
              <h4 className="text-sm font-bold text-white">{secondNode.data.title}</h4>
              <p className="text-gray-400 text-xs">{secondNode.data.summary}</p>

              <div className="pt-2 border-t border-[#1f293d] space-y-2">
                <div className="flex justify-between font-mono">
                  <span className="text-gray-400">Confidence Score:</span>
                  <span className="font-bold">{secondNode.data.confidence}%</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-gray-400">Risk Factor:</span>
                  <span className="text-amber-400 font-bold">{secondNode.data.riskFactor}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#1f293d]">
                <div className="font-semibold text-emerald-400">Pros ({secondNode.data.pros.length})</div>
                <ul className="space-y-1">
                  {secondNode.data.pros.map((p, i) => (
                    <li key={i} className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 rounded text-[11px]">
                      • {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-[#161e2e] border border-[#1f293d] rounded-xl flex items-center justify-center text-gray-500">
              Select a second node to compare
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
