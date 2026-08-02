import React, { useEffect } from 'react';
import { Bell, CheckCircle2, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onRemoveToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onRemoveToast }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemoveToast} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({
  toast,
  onRemove,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div className="pointer-events-auto bg-slate-900/95 text-white border border-blue-500/40 rounded-xl p-3.5 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-center gap-2.5 text-xs sm:text-sm">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="font-medium">{toast.message}</span>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
