// Author: Parth Pancholi

import React from 'react';
import { useAppStore } from '../../store/';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAppStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <Info className="w-4 h-4 text-blue-400" />;
        let borderColor = 'border-blue-500/40';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
          borderColor = 'border-emerald-500/40';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-4 h-4 text-amber-400" />;
          borderColor = 'border-amber-500/40';
        } else if (toast.type === 'error') {
          icon = <XCircle className="w-4 h-4 text-rose-400" />;
          borderColor = 'border-rose-500/40';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 bg-white border border-[#E5E2DD] rounded-lg shadow-xl text-xs text-[#1A1A1A] transition-all duration-200 animate-in slide-in-from-bottom-3`}
          >
            <div className="flex items-center space-x-2.5">
              {icon}
              <span className="font-medium text-[#1A1A1A]">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-[#666666] hover:text-[#1A1A1A] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
