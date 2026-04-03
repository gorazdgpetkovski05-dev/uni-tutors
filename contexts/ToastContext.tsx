import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';
type Toast = { id: number; message: string; type: ToastType };

const ToastContext = createContext<{ showToast: (message: string, type: ToastType) => void }>({ showToast: () => {} });
export const useToast = () => useContext(ToastContext);

const cfg: Record<ToastType, { icon: React.ElementType; border: string; bg: string }> = {
  success: { icon: CheckCircle, border: 'border-l-green-500', bg: 'bg-green-50 dark:bg-green-950/40' },
  error:   { icon: XCircle,    border: 'border-l-red-500',   bg: 'bg-red-50 dark:bg-red-950/40' },
  info:    { icon: Info,       border: 'border-l-blue-500',  bg: 'bg-blue-50 dark:bg-blue-950/40' },
};
const iconColor: Record<ToastType, string> = { success: 'text-green-600 dark:text-green-400', error: 'text-red-600 dark:text-red-400', info: 'text-blue-600 dark:text-blue-400' };

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) { clearTimeout(timer); timers.current.delete(id); }
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = nextId.current++;
    setToasts(prev => {
      const next = [...prev, { id, message, type }];
      return next.length > 3 ? next.slice(-3) : next;
    });
    timers.current.set(id, setTimeout(() => dismiss(id), 4000));
  }, [dismiss]);

  useEffect(() => { return () => timers.current.forEach(t => clearTimeout(t)); }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 sm:bottom-auto sm:top-4 sm:right-4 z-[9999] flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => {
            const { icon: Icon, border, bg } = cfg[toast.type];
            return (
              <motion.div key={toast.id} layout initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 80 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border-l-4 ${border} ${bg} shadow-lg backdrop-blur-sm`}>
                <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${iconColor[toast.type]}`} />
                <p className="text-sm text-gray-800 dark:text-gray-200 flex-1">{toast.message}</p>
                <button onClick={() => dismiss(toast.id)} className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
