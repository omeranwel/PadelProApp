import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, isToday, isTomorrow } from 'date-fns';
import { Zap, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { useCourtsStore } from '../../store/courtsStore';
import { useAuthStore } from '../../store/authStore';
import { getSocket } from '../../services/socketService';

const TIMES = Array.from({ length: 14 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);

const DATES = Array.from({ length: 7 }, (_, i) => {
  const d = addDays(new Date(), i);
  return {
    label: isToday(d) ? 'Today' : isTomorrow(d) ? 'Tomorrow' : format(d, 'EEE d'),
    value: format(d, 'yyyy-MM-dd'),
  };
});

const SlotCell = ({ status, flash, onClick }) => {
  const base = 'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 cursor-pointer relative overflow-hidden';
  const available = 'bg-accent/15 hover:bg-accent/30 border border-accent/30 hover:border-accent/60 group';
  const booked = 'bg-bg-subtle border border-border cursor-not-allowed opacity-40';

  return (
    <motion.button
      onClick={status === 'available' ? onClick : undefined}
      className={`${base} ${status === 'available' ? available : booked}`}
      whileHover={status === 'available' ? { scale: 1.15 } : {}}
      whileTap={status === 'available' ? { scale: 0.9 } : {}}
    >
      {status === 'available' ? (
        <span className="w-2 h-2 rounded-full bg-accent group-hover:scale-125 transition-transform" />
      ) : (
        <span className="w-2 h-2 rounded-full bg-border" />
      )}
      <AnimatePresence>
        {flash && (
          <motion.div
            key="flash"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 bg-yellow-400/30 rounded-lg"
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
};

const LiveAvailabilityGrid = () => {
  const { courts } = useCourtsStore();
  const { isLoggedIn } = useAuthStore();
  const navigate = useNavigate();
  const scrollRef = useRef();

  const [selectedDate, setSelectedDate] = useState(DATES[0].value);
  const [liveSlots, setLiveSlots] = useState({});
  const [flashSlots, setFlashSlots] = useState({});
  const [isLive, setIsLive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Seed initial slots from courts store data
  useEffect(() => {
    if (!courts.length) return;
    const seed = {};
    courts.forEach(court => {
      if (court.slots?.[selectedDate]) {
        seed[court.id] = { ...court.slots[selectedDate] };
      }
    });
    setLiveSlots(seed);
  }, [courts, selectedDate]);

  // Socket listener for real-time updates
  useEffect(() => {
    if (!isLoggedIn) return;
    const check = () => {
      const socket = getSocket();
      if (!socket) return;
      setIsLive(true);
      socket.on('availability:update', ({ courtId, date, slots }) => {
        if (date !== selectedDate) return;
        setLiveSlots(prev => ({
          ...prev,
          [courtId]: { ...(prev[courtId] || {}), ...slots },
        }));
        const newFlashes = {};
        Object.keys(slots).forEach(t => { newFlashes[`${courtId}:${t}`] = true; });
        setFlashSlots(prev => ({ ...prev, ...newFlashes }));
        setLastUpdate(new Date());
        setTimeout(() => {
          setFlashSlots(prev => {
            const next = { ...prev };
            Object.keys(newFlashes).forEach(k => delete next[k]);
            return next;
          });
        }, 1500);
      });
      socket.on('disconnect', () => setIsLive(false));
      socket.on('connect', () => setIsLive(true));
    };
    const t = setTimeout(check, 300);
    return () => clearTimeout(t);
  }, [isLoggedIn, selectedDate]);

  const scrollDates = (dir) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 160, behavior: 'smooth' });
  };

  const availableCourts = courts.filter(c => liveSlots[c.id] || c.slots?.[selectedDate]);
  const totalAvailable = availableCourts.reduce((sum, c) => {
    const s = liveSlots[c.id] || c.slots?.[selectedDate] || {};
    return sum + Object.values(s).filter(v => v === 'available').length;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-bold text-text-primary">Live Slot Availability</h2>
            {isLoggedIn ? (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold ${isLive ? 'bg-accent/10 border-accent/30 text-accent' : 'bg-bg-elevated border-border text-text-muted'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-accent animate-pulse' : 'bg-text-muted'}`} />
                {isLive ? 'LIVE' : 'CONNECTING...'}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-bg-elevated text-xs text-text-muted">
                <Lock size={10} />
                Sign in for live updates
              </div>
            )}
          </div>
          <p className="text-sm text-text-secondary">
            <span className="text-accent font-semibold">{totalAvailable}</span> slots open across {availableCourts.length} courts
            {lastUpdate && <span className="text-text-muted ml-2">· updated {format(lastUpdate, 'HH:mm:ss')}</span>}
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <button onClick={() => scrollDates(-1)} className="p-1.5 rounded-lg bg-bg-elevated border border-border text-text-muted hover:text-text-primary transition-colors">
            <ChevronLeft size={14} />
          </button>
          <div ref={scrollRef} className="flex gap-2 overflow-x-auto no-scrollbar max-w-xs sm:max-w-sm">
            {DATES.map(d => (
              <button
                key={d.value}
                onClick={() => setSelectedDate(d.value)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedDate === d.value ? 'bg-accent text-bg-base' : 'bg-bg-elevated border border-border text-text-secondary hover:text-text-primary'}`}
              >
                {d.label}
              </button>
            ))}
          </div>
          <button onClick={() => scrollDates(1)} className="p-1.5 rounded-lg bg-bg-elevated border border-border text-text-muted hover:text-text-primary transition-colors">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-text-muted">
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-accent/20 border border-accent/40 inline-block" /> Available (click to book)</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-bg-subtle border border-border opacity-40 inline-block" /> Booked</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-yellow-400/30 border border-yellow-400/40 inline-block" /> Just updated live</span>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto rounded-2xl border border-border bg-bg-elevated">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3 text-xs font-bold text-text-muted uppercase tracking-wider w-48 sticky left-0 bg-bg-elevated z-10">
                Court
              </th>
              {TIMES.map(t => (
                <th key={t} className="text-center px-1 py-3 text-xs font-medium text-text-muted w-10">
                  {t.slice(0, 2)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {availableCourts.length === 0 ? (
              <tr>
                <td colSpan={TIMES.length + 1} className="text-center py-16 text-text-muted text-sm">
                  No courts available — try a different date or check back later.
                </td>
              </tr>
            ) : availableCourts.map((court, idx) => {
              const slots = liveSlots[court.id] || court.slots?.[selectedDate] || {};
              const openCount = Object.values(slots).filter(v => v === 'available').length;
              return (
                <motion.tr
                  key={court.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`border-b border-border last:border-0 hover:bg-bg-subtle/30 transition-colors`}
                >
                  <td className="px-5 py-3 sticky left-0 bg-bg-elevated hover:bg-bg-subtle/30 z-10 transition-colors">
                    <button
                      onClick={() => navigate(`/courts/${court.id}`)}
                      className="text-left group w-full"
                    >
                      <p className="text-sm font-bold text-text-primary group-hover:text-accent transition-colors line-clamp-1">{court.name}</p>
                      <p className="text-xs text-text-muted">{court.area}</p>
                      <span className={`text-[10px] font-bold ${openCount > 5 ? 'text-accent' : openCount > 2 ? 'text-yellow-400' : 'text-danger'}`}>
                        {openCount} open
                      </span>
                    </button>
                  </td>
                  {TIMES.map(t => (
                    <td key={t} className="px-1 py-3 text-center">
                      <SlotCell
                        status={slots[t] || 'available'}
                        flash={!!flashSlots[`${court.id}:${t}`]}
                        onClick={() => navigate(`/courts/${court.id}?date=${selectedDate}&time=${t}`)}
                      />
                    </td>
                  ))}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Time labels footer */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar px-1 pb-1">
        <span className="shrink-0 w-48 text-xs text-text-muted">Time →</span>
        {TIMES.map(t => (
          <span key={t} className="shrink-0 w-10 text-center text-[10px] text-text-muted">{t}</span>
        ))}
      </div>
    </div>
  );
};

export default LiveAvailabilityGrid;
