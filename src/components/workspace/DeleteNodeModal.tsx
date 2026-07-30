import React from 'react';
import { Modal } from '../common/Modal';
import { ModalFooter } from '../common/ModalFooter';
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

        <ModalFooter
          onCancel={closeModal}
          confirmLabel="Delete Branch"
          confirmType="button"
          onConfirm={handleDelete}
          variant="danger"
        />
      </div>
    </Modal>
  );
};
