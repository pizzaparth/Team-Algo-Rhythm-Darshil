import React from 'react';
import { Modal } from '../common/Modal';
import { ModalFooter } from '../common/ModalFooter';
import { useAppStore } from '../../store/';
import { Settings, Check } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { activeModal, closeModal, addToast } = useAppStore();
  const isOpen = activeModal === 'settings';

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Workspace settings saved', 'success');
    closeModal();
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Workspace Settings & Preferences">
      <form onSubmit={handleSave} className="space-y-4 text-xs">
        <div className="space-y-3">
          <div>
            <label className="text-gray-300 font-semibold mb-1 block">AI Model Configuration</label>
            <select className="w-full bg-[#161e2e] border border-[#2b384e] text-white rounded-lg p-2.5 focus:outline-none">
              <option>gemini-2.5-flash (Fast Reasoning)</option>
              <option>gemini-2.5-pro (Deep Architecture Synthesis)</option>
            </select>
          </div>

          <div>
            <label className="text-gray-300 font-semibold mb-1 block">Graph Auto-Layout Algorithm</label>
            <select className="w-full bg-[#161e2e] border border-[#2b384e] text-white rounded-lg p-2.5 focus:outline-none">
              <option>Hierarchical Tree (Top to Bottom)</option>
              <option>Radial Decision Cluster</option>
              <option>Horizontal Pipeline (Left to Right)</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#161e2e] rounded-xl border border-[#1f293d]">
            <div>
              <div className="font-semibold text-white">Animate Edge Connection Flow</div>
              <div className="text-[10px] text-gray-400">Renders smooth particle flow along decision lines.</div>
            </div>
            <input type="checkbox" defaultChecked className="rounded border-[#2b384e] text-indigo-600 focus:ring-0" />
          </div>

          <div className="flex items-center justify-between p-3 bg-[#161e2e] rounded-xl border border-[#1f293d]">
            <div>
              <div className="font-semibold text-white">Enable High FPS Hardware Acceleration</div>
              <div className="text-[10px] text-gray-400">Optimizes canvas rendering for 100+ nodes trees.</div>
            </div>
            <input type="checkbox" defaultChecked className="rounded border-[#2b384e] text-indigo-600 focus:ring-0" />
          </div>
        </div>

        <ModalFooter onCancel={closeModal} confirmLabel="Save Settings" />
      </form>
    </Modal>
  );
};
