import React from 'react';
import { useInventory } from '../../store/inventoryStore';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useInventory();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-18 right-6 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />;
        let borderColor = 'border-[#22C55E]/30';
        let bgGlow = 'shadow-[0_4px_24px_rgba(0,0,0,0.6)]';

        if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />;
          borderColor = 'border-[#F59E0B]/30';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-[#EF4444]" />;
          borderColor = 'border-[#EF4444]/30';
        } else if (toast.type === 'info') {
          icon = <Info className="w-5 h-5 text-[#3B82F6]" />;
          borderColor = 'border-[#3B82F6]/30';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 bg-[#171A20] border ${borderColor} p-3.5 rounded-xl ${bgGlow} backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-3`}
          >
            <div className="mt-0.5 flex-shrink-0">{icon}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-[#F8FAFC] tracking-tight">{toast.title}</h4>
              <p className="text-xs text-[#94A3B8] mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-[#64748B] hover:text-[#F8FAFC] p-1 rounded-md hover:bg-[#1E222A] transition-colors flex-shrink-0"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
