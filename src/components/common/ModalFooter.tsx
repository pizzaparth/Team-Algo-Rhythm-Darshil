// Author: Parth Pancholi

import React from 'react';

interface ModalFooterProps {
  onCancel: () => void;
  cancelLabel?: string;
  confirmLabel: string;
  /** 'submit' renders a form submit button (default); 'button' fires onConfirm directly. */
  confirmType?: 'submit' | 'button';
  onConfirm?: () => void;
  variant?: 'primary' | 'danger';
}

/** Shared Cancel/Confirm footer for workspace modals (create/rename/delete/settings). */
export const ModalFooter: React.FC<ModalFooterProps> = ({
  onCancel,
  cancelLabel = 'Cancel',
  confirmLabel,
  confirmType = 'submit',
  onConfirm,
  variant = 'primary',
}) => {
  const confirmClasses = variant === 'danger'
    ? 'px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors'
    : 'px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-600/20 transition-colors';

  return (
    <div className="pt-3 border-t border-[#1f293d] flex justify-end space-x-2">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 bg-[#1f293d] hover:bg-[#2b384e] text-gray-300 text-xs font-medium rounded-lg transition-colors"
      >
        {cancelLabel}
      </button>
      <button
        type={confirmType}
        onClick={confirmType === 'button' ? onConfirm : undefined}
        className={confirmClasses}
      >
        {confirmLabel}
      </button>
    </div>
  );
};
