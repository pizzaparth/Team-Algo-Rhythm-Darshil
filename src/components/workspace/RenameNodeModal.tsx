// Author: Parth Pancholi

import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { ModalFooter } from '../common/ModalFooter';
import { useAppStore, useGraphStore } from '../../store/';

export const RenameNodeModal: React.FC = () => {
  const { activeModal, closeModal, modalData } = useAppStore();
  const { nodes, updateNodeData } = useGraphStore();
  const isOpen = activeModal === 'rename_node';

  const nodeId = modalData?.nodeId;
  const node = nodes.find(n => n.id === nodeId);

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');

  useEffect(() => {
    if (node) {
      setTitle(node.data.title);
      setSummary(node.data.summary);
    }
  }, [node]);

  if (!isOpen || !node) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    updateNodeData(node.id, { title, summary });
    closeModal();
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Rename Decision Node">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="text-gray-300 font-semibold mb-1 block">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full bg-[#161e2e] border border-[#2b384e] focus:border-indigo-500 rounded-lg p-2.5 text-white focus:outline-none"
          />
        </div>

        <div>
          <label className="text-gray-300 font-semibold mb-1 block">Summary</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            className="w-full bg-[#161e2e] border border-[#2b384e] focus:border-indigo-500 rounded-lg p-2.5 text-white focus:outline-none resize-none"
          />
        </div>

        <ModalFooter onCancel={closeModal} confirmLabel="Update Node" />
      </form>
    </Modal>
  );
};
