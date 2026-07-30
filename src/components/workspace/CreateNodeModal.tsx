import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAppStore, useGraphStore } from '../../store/';
import { NodeType, NodeStatus } from '../../types';

export const CreateNodeModal: React.FC = () => {
  const { activeModal, closeModal, modalData } = useAppStore();
  const { addNode } = useGraphStore();
  const isOpen = activeModal === 'create_node';

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [type, setType] = useState<NodeType>('strategic');
  const [status, setStatus] = useState<NodeStatus>('proposed');
  const [confidence, setConfidence] = useState<number>(85);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addNode(
      {
        data: {
          title,
          summary: summary || 'User created decision node.',
          internalType: type,
          displayType: type === 'strategic' ? 'Strategic Option' : type === 'alternative' ? 'Alternative' : type === 'risk' ? 'Risk Factor' : type === 'prerequisite' ? 'Prerequisite' : 'Expected Outcome',
          status,
          depth: 1,
          branchColor: '#6366f1',
          creator: 'user',
          confidence: confidence,
          pros: ['Flexibility in execution', 'User validated requirement'],
          cons: ['Requires ongoing monitoring'],
          riskFactor: 'Low'
        }
      },
      modalData?.parentId
    );

    setTitle('');
    setSummary('');
    closeModal();
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Create Manual Decision Node">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="text-gray-300 font-semibold mb-1 block">Node Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Introduce Redis Cluster for Caching"
            required
            className="w-full bg-[#161e2e] border border-[#2b384e] focus:border-indigo-500 rounded-lg p-2.5 text-white focus:outline-none"
          />
        </div>

        <div>
          <label className="text-gray-300 font-semibold mb-1 block">Summary / Description</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Detailed description of trade-offs or technical details..."
            rows={3}
            className="w-full bg-[#161e2e] border border-[#2b384e] focus:border-indigo-500 rounded-lg p-2.5 text-white focus:outline-none resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-gray-300 font-semibold mb-1 block">Node Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as NodeType)}
              className="w-full bg-[#161e2e] border border-[#2b384e] text-white rounded-lg p-2.5 focus:outline-none"
            >
              <option value="strategic">Strategic Option</option>
              <option value="alternative">Alternative</option>
              <option value="risk">Risk Factor</option>
              <option value="prerequisite">Prerequisite</option>
              <option value="outcome">Expected Outcome</option>
            </select>
          </div>

          <div>
            <label className="text-gray-300 font-semibold mb-1 block">Initial Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as NodeStatus)}
              className="w-full bg-[#161e2e] border border-[#2b384e] text-white rounded-lg p-2.5 focus:outline-none"
            >
              <option value="proposed">Proposed</option>
              <option value="in_review">In Review</option>
              <option value="evaluated">Evaluated</option>
              <option value="approved">Approved</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-gray-300 font-semibold mb-1 block">Confidence Score ({confidence}%)</label>
          <input
            type="range"
            min="10"
            max="100"
            value={confidence}
            onChange={(e) => setConfidence(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>

        <div className="pt-3 border-t border-[#1f293d] flex justify-end space-x-2">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 bg-[#1f293d] hover:bg-[#2b384e] text-gray-300 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-md shadow-indigo-600/20"
          >
            Create Node
          </button>
        </div>
      </form>
    </Modal>
  );
};
