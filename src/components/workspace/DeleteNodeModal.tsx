import React from 'react';
import { Modal } from '../common/Modal';
import { useAppStore, useGraphStore } from '../../store/';

export const DeleteNodeModal: React.FC = () => {
  const { activeModal, closeModal, modalData } = useAppStore();
  const { nodes, deleteNode } = useGraphStore();
  
  const isOpen = activeModal === 'delete_node';
  const nodeId = modalData?.nodeId;
  const node = nodes.find(n => n.id === nodeId);

  if (!isOpen || !node) return null;

  const handleDelete = () => {
    deleteNode(nodeId);
    closeModal();
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Confirm Deletion">
      <div className="space-y-4">
        <p className="text-sm text-gray-300">
          Are you sure you want to delete <span className="font-bold text-white">{node.data.title}</span>?
        </p>
        <p className="text-xs text-rose-400">
          Warning: This action will also delete all descendant nodes in this branch. This cannot be undone.
        </p>

        <div className="pt-4 border-t border-[#1f293d] flex justify-end space-x-2">
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-[#1f293d] hover:bg-[#2b384e] text-gray-300 rounded-lg text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors"
          >
            Delete Branch
          </button>
        </div>
      </div>
    </Modal>
  );
};
