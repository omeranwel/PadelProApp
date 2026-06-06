import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Globe, Users, Calendar, Clock, MapPin, Star, Send, X, Check, ChevronRight } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { lobbyService } from '../../services/lobbyService';
import { playerService } from '../../services/playerService';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad'];
const TIME_SLOTS = [
  { val: 'morning',   label: 'Morning',   sub: '6am – 12pm' },
  { val: 'afternoon', label: 'Afternoon', sub: '12pm – 6pm' },
  { val: 'evening',   label: 'Evening',   sub: '6pm – 11pm' },
];

// ─── Step indicator ────────────────────────────────────────────────
const StepIndicator = ({ steps, current }) => (
  <div className="flex items-center gap-2 mb-8">
    {steps.map((label, i) => (
      <React.Fragment key={i}>
        <div className={`flex items-center gap-2 text-xs font-bold ${i < current ? 'text-accent' : i === current ? 'text-white' : 'text-text-muted'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
            ${i < current ? 'bg-accent border-accent text-bg-base' : i === current ? 'border-accent text-accent' : 'border-white/20 text-text-muted'}`}>
            {i < current ? <Check size={12} /> : i + 1}
          </div>
          <span className="hidden sm:block">{label}</span>
        </div>
        {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${i < current ? 'bg-accent' : 'bg-white/10'}`} />}
      </React.Fragment>
    ))}
  </div>
);

// ─── Lobby Slot ────────────────────────────────────────────────────
const LobbySlot = ({ slot, player, isYou, onRemove }) => (
  <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all
    ${player ? 'bg-white/5 border-white/10' : 'border-dashed border-white/20 bg-transparent'}`}>
    <div className="w-6 h-6 rounded-full bg-accent/10 border border-accent/30 text-accent flex items-center justify-center text-xs font-bold shrink-0">
      {slot}
    </div>
    {player ? (
      <>
        <Avatar name={player.name} src={player.avatarUrl} size="sm" className="shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-white truncate">{player.name} {isYou && <span className="text-accent text-xs">(You)</span>}</p>
          <p className="text-xs text-text-muted">{player.skillLevel || 'Beginner'}</p>
        </div>
        {onRemove && <button onClick={onRemove} className="text-text-muted hover:text-danger transition-colors"><X size={14} /></button>}
      </>
    ) : (
      <p className="text-sm text-text-muted italic flex-1">Open Slot</p>
    )}
  </div>
);

// ─── Player Search ─────────────────────────────────────────────────
const PlayerSearchInput = ({ onSelect, excludeIds = [] }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await playerService.getSuggestions({ query, excludeIds });
        setResults((res.players || []).slice(0, 6));
      } catch (e) { console.warn('[PlayerSearch]', e); }
      setLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative mb-4">
      <input
        type="text"
        placeholder="Search players by name..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="w-full px-4 py-3 bg-bg-base/50 border border-white/10 rounded-xl text-white placeholder:text-text-muted focus:outline-none focus:border-accent/50 text-sm"
      />
      {results.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-bg-elevated border border-white/10 rounded-xl overflow-hidden shadow-2xl">
          {results.map(p => (
            <button key={p.id} onClick={() => { onSelect(p); setQuery(''); setResults([]); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left">
              <Avatar name={p.name} src={p.avatarUrl} size="sm" />
              <div>
                <p className="text-sm font-semibold text-white">{p.name}</p>
                <p className="text-xs text-text-muted">{p.skillLevel} · {p.city}</p>
              </div>
              <span className="ml-auto text-xs font-mono text-accent">{p.skillRating?.toFixed(1)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Modal ────────────────────────────────────────────────────
export default function CreateMatchModal({ onClose, onCreated }) {
  const { user: currentUser } = useAuthStore();
  const [mode, setMode] = useState(null);
  const [step, setStep] = useState(0);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [prefs, setPrefs] = useState({
    city: currentUser?.city || 'Karachi',
    preferredDate: '',
    preferredTimeSlot: '',
    skillLevelMin: isNaN(currentUser?.skillRating) || !currentUser?.skillRating ? 2.0 : Math.max(1.0, Math.min(6.5, (currentUser.skillRating || 3) - 1)),
    skillLevelMax: isNaN(currentUser?.skillRating) || !currentUser?.skillRating ? 5.0 : Math.min(7.0, Math.max(1.5, (currentUser.skillRating || 3) + 1)),
    message: '',
  });

  const steps = mode === 'PRIVATE'
    ? ['Select Players', 'Preferences', 'Review']
    : ['Preferences', 'Review'];

  const addPlayer = (player) => {
    if (selectedPlayers.length < 3 && !selectedPlayers.find(p => p.id === player.id)) {
      setSelectedPlayers([...selectedPlayers, player]);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        mode,
        city: prefs.city,
        preferredDate: prefs.preferredDate || undefined,
        preferredTimeSlot: prefs.preferredTimeSlot || undefined,
        skillLevelMin: isNaN(prefs.skillLevelMin) ? 1.0 : prefs.skillLevelMin,
        skillLevelMax: isNaN(prefs.skillLevelMax) ? 7.0 : prefs.skillLevelMax,
        message: prefs.message || undefined,
        ...(mode === 'PRIVATE' ? { inviteUserIds: selectedPlayers.map(p => p.id) } : {}),
      };
      const res = await lobbyService.create(payload);
      toast.success(mode === 'PRIVATE' ? '🎾 Invites sent to all 3 players!' : '🌐 Match posted publicly!');
      onCreated?.(res.lobby);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to create match');
    } finally {
      setSubmitting(false);
    }
  };

  const canGoNext = () => {
    if (mode === 'PRIVATE' && step === 0) return selectedPlayers.length === 3;
    if (!prefs.city) return false;
    return true;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl bg-bg-elevated border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold font-display text-white">Create a Padel Match</h2>
            <p className="text-sm text-text-muted">4 players · 2v2 doubles</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-white transition-all">
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          {/* ── Mode Selection ── */}
          {!mode && (
            <div className="space-y-4">
              <p className="text-text-secondary text-sm mb-6">How do you want to find your 3 partners?</p>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => { setMode('PRIVATE'); setStep(0); }}
                  className="group p-5 rounded-2xl border-2 border-white/10 hover:border-accent/40 bg-white/5 hover:bg-accent/5 transition-all text-left space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent/20 transition-all">
                    <Lock size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">Private Match</h3>
                    <p className="text-xs text-text-muted">Invite 3 specific players from your network</p>
                  </div>
                </button>
                <button onClick={() => { setMode('OPEN'); setStep(0); }}
                  className="group p-5 rounded-2xl border-2 border-white/10 hover:border-accent-blue/40 bg-white/5 hover:bg-accent-blue/5 transition-all text-left space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center text-accent-blue group-hover:bg-accent-blue/20 transition-all">
                    <Globe size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">Open Match</h3>
                    <p className="text-xs text-text-muted">Post publicly and let players request to join</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ── Steps ── */}
          {mode && (
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <StepIndicator steps={steps} current={step} />

                {/* PRIVATE: Step 0 — Select 3 players */}
                {mode === 'PRIVATE' && step === 0 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-white mb-1">Select 3 Players to Invite</h3>
                      <p className="text-xs text-text-muted mb-4">You (Slot 1) + 3 players = 4 total</p>
                      <PlayerSearchInput onSelect={addPlayer} excludeIds={[currentUser?.id, ...selectedPlayers.map(p => p.id)]} />
                    </div>
                    <div className="space-y-2">
                      <LobbySlot slot={1} player={{ name: currentUser?.name || 'You', avatarUrl: currentUser?.avatarUrl, skillLevel: 'You' }} isYou />
                      {[0, 1, 2].map(i => (
                        <LobbySlot key={i} slot={i + 2} player={selectedPlayers[i] || null}
                          onRemove={selectedPlayers[i] ? () => setSelectedPlayers(selectedPlayers.filter((_, j) => j !== i)) : null} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Preferences step (PRIVATE step 1, OPEN step 0) */}
                {((mode === 'PRIVATE' && step === 1) || (mode === 'OPEN' && step === 0)) && (
                  <div className="space-y-5">
                    <h3 className="font-bold text-white">Match Preferences</h3>
                    <div>
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">City</label>
                      <div className="grid grid-cols-3 gap-2">
                        {CITIES.map(c => (
                          <button key={c} onClick={() => setPrefs({ ...prefs, city: c })}
                            className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${prefs.city === c ? 'bg-accent/20 border-accent/40 text-accent' : 'bg-white/5 border-white/10 text-text-muted hover:text-white'}`}>
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Preferred Date</label>
                      <input type="date" value={prefs.preferredDate} min={new Date().toISOString().split('T')[0]}
                        onChange={e => setPrefs({ ...prefs, preferredDate: e.target.value })}
                        className="w-full px-4 py-3 bg-bg-base/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Time Preference</label>
                      <div className="grid grid-cols-3 gap-2">
                        {TIME_SLOTS.map(s => (
                          <button key={s.val} onClick={() => setPrefs({ ...prefs, preferredTimeSlot: s.val })}
                            className={`py-3 px-2 rounded-xl border transition-all ${prefs.preferredTimeSlot === s.val ? 'bg-accent/20 border-accent/40 text-accent' : 'bg-white/5 border-white/10 text-text-muted hover:text-white'}`}>
                            <p className="text-xs font-bold">{s.label}</p>
                            <p className="text-[10px] opacity-60">{s.sub}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                    {mode === 'OPEN' && (
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">
                          Skill Range: {isNaN(prefs.skillLevelMin) ? '1.0' : prefs.skillLevelMin.toFixed(1)} – {isNaN(prefs.skillLevelMax) ? '7.0' : prefs.skillLevelMax.toFixed(1)}
                        </label>
                        <div className="flex gap-3 items-center">
                          <input type="range" min={1} max={7} step={0.5} value={prefs.skillLevelMin}
                            onChange={e => setPrefs({ ...prefs, skillLevelMin: parseFloat(e.target.value) })}
                            className="flex-1 accent-accent" />
                          <span className="text-text-muted text-xs">to</span>
                          <input type="range" min={1} max={7} step={0.5} value={prefs.skillLevelMax}
                            onChange={e => setPrefs({ ...prefs, skillLevelMax: parseFloat(e.target.value) })}
                            className="flex-1 accent-accent" />
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Message (optional)</label>
                      <textarea value={prefs.message} onChange={e => setPrefs({ ...prefs, message: e.target.value })}
                        placeholder="e.g. Looking for a competitive match, friendly game welcome!"
                        rows={3}
                        className="w-full px-4 py-3 bg-bg-base/50 border border-white/10 rounded-xl text-white placeholder:text-text-muted focus:outline-none focus:border-accent/50 text-sm resize-none" />
                    </div>
                  </div>
                )}

                {/* Review step */}
                {step === steps.length - 1 && (
                  <div className="space-y-5">
                    <h3 className="font-bold text-white">Review & Confirm</h3>
                    <Card className="p-4 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-muted">Mode</span>
                        <span className="font-bold text-white">{mode === 'PRIVATE' ? '🔒 Private' : '🌐 Open'}</span>
                      </div>
                      {prefs.city && <div className="flex items-center justify-between text-sm">
                        <span className="text-text-muted">City</span><span className="font-bold text-white">{prefs.city}</span>
                      </div>}
                      {prefs.preferredDate && <div className="flex items-center justify-between text-sm">
                        <span className="text-text-muted">Date</span><span className="font-bold text-white">{new Date(prefs.preferredDate).toLocaleDateString()}</span>
                      </div>}
                      {prefs.preferredTimeSlot && <div className="flex items-center justify-between text-sm">
                        <span className="text-text-muted">Time</span><span className="font-bold text-white capitalize">{prefs.preferredTimeSlot}</span>
                      </div>}
                    </Card>
                    {mode === 'PRIVATE' && (
                      <div>
                        <p className="text-xs font-bold uppercase text-text-muted tracking-wider mb-3">Inviting</p>
                        <div className="space-y-2">
                          {selectedPlayers.map(p => (
                            <div key={p.id} className="flex items-center gap-3 p-2">
                              <Avatar name={p.name} src={p.avatarUrl} size="sm" />
                              <span className="font-semibold text-sm text-white">{p.name}</span>
                              <Badge variant={p.skillLevel} className="ml-auto text-xs">{p.skillLevel}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Footer buttons */}
        {mode && (
          <div className="px-6 pb-6 flex gap-3">
            <Button variant="secondary" onClick={() => step === 0 ? setMode(null) : setStep(s => s - 1)} className="flex-1">
              ← Back
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep(s => s + 1)} disabled={!canGoNext()} className="flex-1" icon={ChevronRight}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting} className="flex-1" icon={Send}>
                {submitting ? 'Creating...' : mode === 'PRIVATE' ? 'Send Invites' : 'Post Match'}
              </Button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
