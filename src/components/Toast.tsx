import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastData {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastProps {
  toast: ToastData | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md animate-fade-in-answer"
    >
      <div
        className={`px-4 py-3 rounded-[6px] shadow-lg border flex items-center justify-between gap-3 text-white ${
          toast.type === 'success'
            ? 'bg-[var(--moss)] border-green-700'
            : toast.type === 'error'
            ? 'bg-[var(--brick)] border-red-800'
            : 'bg-[var(--marine)] border-sky-900'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
          {toast.type === 'error' && <AlertTriangle className="w-5 h-5 shrink-0" />}
          {toast.type === 'info' && <Info className="w-5 h-5 shrink-0" />}
          <p className="text-[14px] font-sans font-medium">{toast.message}</p>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="text-white/80 hover:text-white p-1 rounded-sm cursor-pointer"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
