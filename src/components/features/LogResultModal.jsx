import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, ChevronRight, Check, X } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import { playerService } from '../../services/playerService';
import toast from 'react-hot-toast';

const STEP_OPPONENT = 'opponent';
const STEP_SCORE = 'score';
const STEP_RESULT = 'result';

const ScoreInput = ({ label, value, onChange }) => (
  <div className="flex flex-col items-center gap-2">
    <span className="text-xs font-bold text-text-muted uppercase tracking-widest">{label}</span>
    <div className="flex items-center gap-2">
      <button onClick={() => onChange(Math.max(0, value - 1))} className="w-8 h-8 rounded-lg bg-bg-subtle border border-border text-text-muted hover:text-text-primary transition-colors font-bold">−</button>
      <span className="w-10 text-center font-mono font-bold text-2xl text-text-primary">{value}</span>
      <button onClick={() => onChange(value + 1)} className="w-8 h-8 rounded-lg bg-bg-subtle border border-border text-text-muted hover:text-text-primary transition-colors font-bold">+</button>
    </div>
  </div>
);

const LogResultModal = ({ isOpen, onClose, connectedPlayers = [] }) => {
  const [step, setStep] = useState(STEP_OPPONENT);
  const [opponent, setOpponent] = useState(null);
  const [opponentSearch, setOpponentSearch] = useState('');
  const [sets, setSets] = useState([{ me: 6, them: 3 }]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [loggedMatchId, setLoggedMatchId] = useState(null);

  const reset = () => {
    setStep(STEP_OPPONENT);
    setOpponent(null);
    setOpponentSearch('');
    setSets([{ me: 6, them: 3 }]);
    setResult(null);
    setLoggedMatchId(null);
    setLoading(false);
  };

  const handleClose = () => {
    const opp = opponent;
    const mId = loggedMatchId;
    reset();
    onClose(opp, mId);
  };

  const filteredPlayers = connectedPlayers.filter(p =>
    p.name?.toLowerCase().includes(opponentSearch.toLowerCase())
  );

  const setsWon = sets.filter(s => s.me > s.them).length;
  const setsLost = sets.filter(s => s.them > s.me).length;
  const iWon = setsWon > setsLost;

  const updateSet = (idx, side, val) => {
    setSets(prev => prev.map((s, i) => i === idx ? { ...s, [side]: Math.max(0, val) } : s));
  };

  const addSet = () => setSets(prev => [...prev, { me: 6, them: 3 }]);
  const removeSet = (idx) => setSets(prev => prev.filter((_, i) => i !== idx));

  const submit = async () => {
    if (!opponent) return;
    setLoading(true);
    try {
      const apiSets = sets.map(s => ({ player1: s.me, player2: s.them }));
      const res = await playerService.logMatch({
        opponentId: opponent.id || opponent.sender?.id || opponent.receiver?.id,
        score: { sets: apiSets },
        mode: 'singles',
      });
      const data = res.data || res;
      setResult({ won: iWon, ratingChange: data.ratingChange || null });
      setLoggedMatchId(data.matchId || data.id || null);
      setStep(STEP_RESULT);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to log match. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Log Match Result" className="max-w-lg">
      <AnimatePresence mode="wait">

        {/* Step 1: Pick Opponent */}
        {step === STEP_OPPONENT && (
          <motion.div key="opponent" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <p className="text-sm text-text-secondary mb-4">Who did you play against?</p>
            <input
              placeholder="Search connected players..."
              value={opponentSearch}
              onChange={e => setOpponentSearch(e.target.value)}
              className="w-full bg-bg-subtle border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent mb-3"
              autoFocus
            />
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredPlayers.length === 0 && (
                <p className="text-center text-sm text-text-muted py-8">
                  {connectedPlayers.length === 0
                    ? 'No connected players yet. Accept a match request first.'
                    : 'No players match your search.'}
                </p>
              )}
              {filteredPlayers.map(p => {
                const player = p.sender || p.receiver || p;
                return (
                  <button key={p.id || player.id} onClick={() => { setOpponent(player); setStep(STEP_SCORE); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-bg-subtle hover:bg-bg-elevated border border-border hover:border-accent/30 transition-all text-left">
                    <Avatar name={player.name} src={player.avatarUrl} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-text-primary">{player.name}</p>
                      <p className="text-xs text-text-muted capitalize">{player.skillLevel} · {player.skillRating?.toFixed(1)} rating</p>
                    </div>
                    <ChevronRight size={16} className="text-text-muted" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Step 2: Enter Score */}
        {step === STEP_SCORE && opponent && (
          <motion.div key="score" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="flex items-center gap-3 mb-6 p-3 bg-bg-subtle rounded-xl border border-border">
              <Avatar name={opponent.name} src={opponent.avatarUrl} size="sm" />
              <div>
                <p className="font-bold text-sm">{opponent.name}</p>
                <p className="text-xs text-text-muted">Rating: {opponent.skillRating?.toFixed(1)}</p>
              </div>
              <button onClick={() => setStep(STEP_OPPONENT)} className="ml-auto text-xs text-accent hover:underline">Change</button>
            </div>

            <p className="text-sm font-bold text-text-muted uppercase tracking-widest mb-4">Set Scores</p>
            <div className="space-y-3 mb-4">
              {sets.map((s, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-bg-subtle rounded-xl border border-border">
                  <span className="text-xs text-text-muted w-10 shrink-0">Set {i + 1}</span>
                  <div className="flex items-center gap-6 flex-1 justify-center">
                    <ScoreInput label="You" value={s.me} onChange={v => updateSet(i, 'me', v)} />
                    <span className="text-text-muted font-bold text-xl">–</span>
                    <ScoreInput label={opponent.name?.split(' ')[0]} value={s.them} onChange={v => updateSet(i, 'them', v)} />
                  </div>
                  {sets.length > 1 && (
                    <button onClick={() => removeSet(i)} className="shrink-0 text-danger hover:bg-danger/10 p-1 rounded-lg transition-colors">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {sets.length < 5 && (
              <button onClick={addSet} className="w-full text-sm text-accent font-bold py-2 border border-dashed border-accent/30 rounded-xl hover:bg-accent/5 transition-colors mb-4">
                + Add Set
              </button>
            )}

            <div className={`p-4 rounded-xl border mb-6 text-center ${iWon ? 'bg-accent/5 border-accent/20' : 'bg-danger/5 border-danger/20'}`}>
              <p className="text-xs text-text-muted mb-1">Match Result</p>
              <p className={`font-bold text-lg ${iWon ? 'text-accent' : 'text-danger'}`}>
                {iWon ? '🏆 You Won' : '💪 You Lost'} ({setsWon}–{setsLost})
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(STEP_OPPONENT)} className="flex-1">Back</Button>
              <Button onClick={submit} loading={loading} className="flex-1" icon={Check}>Submit Result</Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: ELO Result */}
        {step === STEP_RESULT && result && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${result.won ? 'bg-accent/10 border-2 border-accent/30' : 'bg-danger/10 border-2 border-danger/30'}`}>
              {result.won ? <Trophy size={36} className="text-accent" /> : <TrendingDown size={36} className="text-danger" />}
            </div>
            <h3 className="text-2xl font-display font-bold mb-1">
              {result.won ? 'Victory!' : 'Tough Match'}
            </h3>
            <p className="text-text-secondary text-sm mb-6">Match result logged against {opponent?.name}</p>

            {result.ratingChange !== null && result.ratingChange !== undefined && (
              <div className="bg-bg-subtle border border-border rounded-2xl p-5 mb-6 inline-block min-w-[200px]">
                <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Rating Change</p>
                <div className="flex items-center justify-center gap-2">
                  {result.ratingChange > 0
                    ? <TrendingUp size={20} className="text-accent" />
                    : <TrendingDown size={20} className="text-danger" />}
                  <span className={`font-mono font-bold text-3xl ${result.ratingChange > 0 ? 'text-accent' : 'text-danger'}`}>
                    {result.ratingChange > 0 ? '+' : ''}{result.ratingChange?.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-2">Check the Leaderboard to see your new rank</p>
              </div>
            )}

            <Button onClick={handleClose} className="w-full">Done</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
};

export default LogResultModal;
