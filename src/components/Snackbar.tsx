import React, { useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export interface SnackbarMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface SnackbarProps {
  messages: SnackbarMessage[];
  onClose: (id: string) => void;
}

export const Snackbar: React.FC<SnackbarProps> = ({ messages, onClose }) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4">
      <AnimatePresence>
        {messages.map((msg) => (
          <SnackbarItem key={msg.id} msg={msg} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface SnackbarItemProps {
  msg: SnackbarMessage;
  onClose: (id: string) => void;
}

const SnackbarItem: React.FC<SnackbarItemProps> = ({ msg, onClose }) => {
  const itemUniqueId = useId();

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(msg.id);
    }, msg.duration || 5000); // Auto-dismiss after msg.duration or default 5 seconds
    return () => clearTimeout(timer);
  }, [msg.id, onClose, msg.duration]);

  const getStyle = () => {
    switch (msg.type) {
      case 'success':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          icon: <CheckCircle className="h-5 w-5 text-emerald-600" />,
          shadow: 'shadow-[8px_8px_20px_rgba(16,185,129,0.15),_inset_2px_2px_4px_rgba(255,255,255,1)]'
        };
      case 'error':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-800',
          icon: <AlertCircle className="h-5 w-5 text-rose-600" />,
          shadow: 'shadow-[8px_8px_20px_rgba(239,68,68,0.15),_inset_2px_2px_4px_rgba(255,255,255,1)]'
        };
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: <Info className="h-5 w-5 text-blue-600" />,
          shadow: 'shadow-[8px_8px_20px_rgba(59,130,246,0.15),_inset_2px_2px_4px_rgba(255,255,255,1)]'
        };
    }
  };

  const currentStyle = getStyle();

  return (
    <motion.div
      id={`snackbar-${itemUniqueId}`}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex items-center justify-between p-4 rounded-2xl border-2 ${currentStyle.bg} ${currentStyle.shadow} pointer-events-auto`}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">{currentStyle.icon}</div>
        <p className="text-xs font-bold leading-relaxed">{msg.message}</p>
      </div>
      <button
        type="button"
        id={`snackbar-close-${itemUniqueId}`}
        onClick={() => onClose(msg.id)}
        className="ml-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-black/5 transition-all flex-shrink-0"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
};
