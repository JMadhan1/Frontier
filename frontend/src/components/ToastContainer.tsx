/**
 * Frontier Trade Hub - Toast Container Component
 * 
 * Displays toast notifications
 */

import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastNotification } from '@/types';
import { cn } from '@/utils/format';

interface ToastContainerProps {
  toasts: ToastNotification[];
  onRemove: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const styles = {
  success: 'bg-neon-green/10 border-neon-green/30 text-neon-green',
  error: 'bg-neon-red/10 border-neon-red/30 text-neon-red',
  info: 'bg-cyber-400/10 border-cyber-400/30 text-cyber-400',
  warning: 'bg-neon-orange/10 border-neon-orange/30 text-neon-orange',
};

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];

        return (
          <div
            key={toast.id}
            className={cn(
              'flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md',
              'animate-fadeIn shadow-lg',
              styles[toast.type]
            )}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{toast.title}</p>
              {toast.message && (
                <p className="text-xs opacity-80 mt-1 break-words">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className="p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}