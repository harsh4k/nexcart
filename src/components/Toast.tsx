import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

type Tone = 'success' | 'error' | 'info';
type Notify = (message: string, tone?: Tone) => void;

interface ToastItem {
  id: number;
  message: string;
  tone: Tone;
}

const ToastContext = createContext<Notify>(() => {});

/** Shows a short, self-dismissing message. Replaces `alert()` across the app. */
export const useToast = () => useContext(ToastContext);

const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info };
const ICON_COLORS = { success: 'text-green-400', error: 'text-red-400', info: 'text-gray-400' };
const DURATION_MS = 4000;
const MAX_VISIBLE = 3;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts(current => current.filter(toast => toast.id !== id));
  }, []);

  const notify = useCallback<Notify>((message, tone = 'info') => {
    const id = ++nextId.current;
    setToasts(current => [...current.slice(-(MAX_VISIBLE - 1)), { id, message, tone }]);
    setTimeout(() => dismiss(id), DURATION_MS);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-28 sm:bottom-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none"
      >
        <AnimatePresence initial={false}>
          {toasts.map(toast => {
            const Icon = ICONS[toast.tone];
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                className="pointer-events-auto w-full flex items-center gap-3 pl-5 pr-2 py-3 bg-black text-white rounded-2xl shadow-2xl"
              >
                <Icon size={18} className={`shrink-0 ${ICON_COLORS[toast.tone]}`} aria-hidden="true" />
                <p className="flex-1 text-sm font-medium">{toast.message}</p>
                <button
                  onClick={() => dismiss(toast.id)}
                  aria-label="Dismiss notification"
                  className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
