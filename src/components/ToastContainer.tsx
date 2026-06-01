import { useAppStore } from '@/store/appStore';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertCircle,
  info: Info,
};

const colors = {
  success: 'var(--green)',
  error: 'var(--red)',
  warning: 'var(--yellow)',
  info: 'var(--accent)',
};

export default function ToastContainer() {
  const toasts = useAppStore(s => s.toasts);
  const removeToast = useAppStore(s => s.removeToast);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map(t => {
          const Icon = icons[t.type];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 rounded-lg px-4 py-3 min-w-[280px] max-w-[400px] shadow-lg"
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--border2)',
                color: 'var(--text)',
              }}
            >
              <Icon size={18} style={{ color: colors[t.type], flexShrink: 0 }} />
              <span className="text-sm flex-1">{t.message}</span>
              <button
                onClick={() => removeToast(t.id)}
                className="opacity-50 hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
