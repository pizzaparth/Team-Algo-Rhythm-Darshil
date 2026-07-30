import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAppStore, useProjectStore } from '../../store/';

export const CreateProjectModal: React.FC = () => {
  const { activeModal, closeModal } = useAppStore();
  const { createProject } = useProjectStore();
  const isOpen = activeModal === 'create_project';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Architecture');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createProject(name, category, description || 'Custom AI decision graph.');
    
    setName('');
    setDescription('');
    setCategory('Architecture');
    closeModal();
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Create New Project">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="text-gray-300 font-semibold mb-1 block">Project Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Q3 Architecture Roadmap"
            required
            className="w-full bg-[#161e2e] border border-[#2b384e] focus:border-indigo-500 rounded-lg p-2.5 text-white focus:outline-none"
          />
        </div>

        <div>
          <label className="text-gray-300 font-semibold mb-1 block">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-[#161e2e] border border-[#2b384e] text-white rounded-lg p-2.5 focus:outline-none"
          >
            <option value="Architecture">Architecture</option>
            <option value="Product Strategy">Product Strategy</option>
            <option value="Migration">Migration</option>
            <option value="Vendor Selection">Vendor Selection</option>
          </select>
        </div>

        <div>
          <label className="text-gray-300 font-semibold mb-1 block">Description (Optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Briefly describe the goal of this decision graph..."
            rows={3}
            className="w-full bg-[#161e2e] border border-[#2b384e] focus:border-indigo-500 rounded-lg p-2.5 text-white focus:outline-none resize-none"
          />
        </div>

        <div className="pt-3 border-t border-[#1f293d] flex justify-end space-x-2">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 bg-[#1f293d] hover:bg-[#2b384e] text-gray-300 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-md transition-colors"
          >
            Create Project
          </button>
        </div>
      </form>
    </Modal>
  );
};
