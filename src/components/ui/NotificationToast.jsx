import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Calendar, Swords, Star, Tag, CheckCircle, X } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useNavigate } from 'react-router-dom';

const TYPE_CONFIG = {
  booking_confirmed:  { icon: Calendar,     color: 'text-accent',    bg: 'bg-accent/10',    border: 'border-accent/20' },
  booking_cancelled:  { icon: Calendar,     color: 'text-danger',    bg: 'bg-danger/10',    border: 'border-danger/20' },
  booking_reschedule: { icon: Calendar,     color: 'text-warning',   bg: 'bg-warning/10',   border: 'border-warning/20' },
  match_invite:       { icon: Swords,       color: 'text-blue-400',  bg: 'bg-blue-400/10',  border: 'border-blue-400/20' },
  match_accepted:     { icon: CheckCircle,  color: 'text-accent',    bg: 'bg-accent/10',    border: 'border-accent/20' },
  review_prompt:      { icon: Star,         color: 'text-yellow-400',bg: 'bg-yellow-400/10',border: 'border-yellow-400/20' },
  offer_received:     { icon: Tag,          color: 'text-purple-400',bg: 'bg-purple-400/10',border: 'border-purple-400/20' },
};

const Toast = ({ toast }) => {
  const { dismissToast } = useAppStore();
  const navigate = useNavigate();
  const cfg = TYPE_CONFIG[toast.type] || { icon: Bell, color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20' };
  const Icon = cfg.icon;

  const handleClick = () => {
    if (toast.link) navigate(toast.link);
    dismissToast(toast.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
      onClick={handleClick}
      className={`flex items-start gap-3 w-80 bg-bg-elevated border ${cfg.border} rounded-2xl p-4 shadow-2xl cursor-pointer group`}
    >
      <div className={`shrink-0 w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center mt-0.5`}>
        <Icon size={16} className={cfg.color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary leading-snug">{toast.title || 'Notification'}</p>
        {toast.message && <p className="text-xs text-text-secondary mt-0.5 leading-relaxed line-clamp-2">{toast.message}</p>}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); dismissToast(toast.id); }}
        className="shrink-0 text-text-muted hover:text-text-primary transition-colors opacity-0 group-hover:opacity-100 mt-0.5"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
};

const NotificationToast = () => {
  const { toasts } = useAppStore();
  return (
    <div className="fixed top-20 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      <div className="pointer-events-auto flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {toasts.map(t => <Toast key={t.id} toast={t} />)}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotificationToast;
