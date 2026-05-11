'use client';

import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils/cn';
import { X, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { useEffect, useState } from 'react';

type ToastVariant = 'destructive' | 'success' | 'default';

interface ToastData {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

const iconMap: Record<ToastVariant, React.ReactNode> = {
  destructive: <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />,
  success: <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />,
  default: <Info className="h-4 w-4 text-blue-400 flex-shrink-0" />,
};

const borderMap: Record<ToastVariant, string> = {
  destructive: 'border-red-500/30',
  success: 'border-emerald-500/30',
  default: 'border-border',
};

function ToastItem({ toast, onDismiss }: { toast: ToastData; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const variant: ToastVariant = toast.variant || 'default';
  const icon = iconMap[variant];
  const borderColor = borderMap[variant];

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-start gap-3 w-full max-w-sm p-4 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300',
        'bg-card/95',
        borderColor,
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      )}
    >
      {icon}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-semibold text-foreground">{toast.title}</p>
        )}
        {toast.description && (
          <p className="text-xs text-muted-foreground mt-0.5">{toast.description}</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 p-0.5 rounded-md text-muted-foreground/50 hover:text-foreground transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  );
}
