import React, { useState, useEffect, useRef } from 'react';
import { lobbyService } from '../../services/lobbyService';
import { useDebounce } from '../../hooks/useDebounce';
import { Search, X, RefreshCw, Sparkles, Filter, ChevronDown, Plus } from 'lucide-react';
import Spinner from '../ui/Spinner';

export function CreateMatchStep1({ currentUser, onPlayersConfirmed }) {
  // The 3 invite slots (slot 1 = you, auto-filled)
  const [slots, setSlots] = useState([null, null, null]); // indices 0,1,2 = slots 2,3,4

  // AI suggestions state
  const [aiSuggestions, setAiSuggestions] = useState([]); // pool of 9
  const [aiLoading, setAiLoading] = useState(true);
  const [criteriaOpen, setCriteriaOpen] = useState(false);

  // Manual search state
  const [activeSlot, setActiveSlot] = useState(null); // which slot is being edited
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef(null);

  // AI criteria (adjustable by user)
  const [criteria, setCriteria] = useState({
    skillMin: Math.max(1, (currentUser?.skillRating || 3) - 1.5),
    skillMax: Math.min(7, (currentUser?.skillRating || 3) + 1.5),
    city: currentUser?.city || '',
    playingStyle: '',
    position: '',
  });

  const debouncedQuery = useDebounce(searchQuery, 200);

  // ── Load AI suggestions on mount and when criteria change ──
  useEffect(() => {
    loadAiSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criteria]);

  async function loadAiSuggestions() {
    setAiLoading(true);
    try {
      const filledIds = slots.filter(Boolean).map(p => p.id);
      const res = await lobbyService.aiSuggest({
        count: 9,
        excludeIds: [currentUser.id, ...filledIds],
        skillMin: criteria.skillMin,
        skillMax: criteria.skillMax,
        city: criteria.city,
        playingStyle: criteria.playingStyle,
        position: criteria.position,
      });
      const suggestions = res.suggestions || [];
      setAiSuggestions(suggestions);

      // Auto-fill empty slots with top suggestions
      setSlots(prev => {
        const newSlots = [...prev];
        let suggIdx = 0;
        for (let i = 0; i < 3; i++) {
          if (!newSlots[i] && suggestions[suggIdx]) {
            newSlots[i] = { ...suggestions[suggIdx].player, matchScore: suggestions[suggIdx].matchScore, isAiPick: true };
            suggIdx++;
          }
        }
        return newSlots;
      });
    } catch (err) {
      console.error('AI suggest error:', err);
    } finally {
      setAiLoading(false);
    }
  }

  // ── Live search when user types ──
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 1) {
      setSearchResults([]);
      return;
    }
    searchPlayers(debouncedQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  async function searchPlayers(q) {
    setSearchLoading(true);
    try {
      const filledIds = slots.filter(Boolean).map(p => p.id);
      const res = await lobbyService.aiSearch(q, [currentUser.id, ...filledIds]);
      setSearchResults(res.players || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearchLoading(false);
    }
  }

  // ── Slot management ──
  function assignToSlot(slotIndex, player, isAiPick = false) {
    setSlots(prev => {
      const newSlots = [...prev];
      newSlots[slotIndex] = { ...player, isAiPick };
      return newSlots;
    });
    setActiveSlot(null);
    setSearchQuery('');
    setSearchResults([]);
  }

  function removeFromSlot(slotIndex) {
    setSlots(prev => {
      const newSlots = [...prev];
      newSlots[slotIndex] = null;
      return newSlots;
    });
  }

  function swapWithAiPick(slotIndex) {
    const filledIds = slots.filter(Boolean).map(p => p.id);
    const currentInSlot = slots[slotIndex]?.id;
    const nextSuggestion = aiSuggestions.find(s =>
      s.player.id !== currentInSlot && !filledIds.includes(s.player.id)
    );
    if (nextSuggestion) {
      assignToSlot(slotIndex, nextSuggestion.player, true);
    }
  }

  const allFilled = slots.every(Boolean);

  function getScoreColorClass(score) {
    if (score >= 75) return 'bg-[#00E676] text-black border-[#00E676]';
    if (score >= 55) return 'bg-[#69F0AE] text-black border-[#69F0AE]';
    if (score >= 35) return 'bg-[#FFD740] text-black border-[#FFD740]';
    return 'bg-[#FF5252] text-white border-[#FF5252]';
  }

  return (
    <div className="space-y-6">
      {/* ── Header with AI indicator ── */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div>
          <h3 className="font-bold text-white text-lg">Select 3 Players to Invite</h3>
          <p className="text-sm text-text-muted">You (Slot 1) + 3 players = 4 total</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
          <Sparkles size={14} className="text-accent" />
          <span className="text-xs font-bold text-accent">AI Matchmaking</span>
          {aiLoading && <Spinner size="xs" />}
        </div>
      </div>

      {/* ── Adjust Criteria Panel (collapsible) ── */}
      <div className="bg-bg-elevated/50 border border-white/10 rounded-xl overflow-hidden">
        <button
          className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold text-text-secondary hover:text-white transition-colors"
          onClick={() => setCriteriaOpen(!criteriaOpen)}>
          <div className="flex items-center gap-2">
            <Filter size={16} />
            Matching Criteria
            <span className="ml-2 font-normal text-xs text-text-muted">
              {criteria.skillMin}–{criteria.skillMax} rating
              {criteria.city ? ` · ${criteria.city}` : ''}
              {criteria.playingStyle ? ` · ${criteria.playingStyle}` : ''}
            </span>
          </div>
          <ChevronDown size={16} className={`transition-transform ${criteriaOpen ? 'rotate-180' : ''}`} />
        </button>

        {criteriaOpen && (
          <div className="p-4 pt-0 space-y-4 border-t border-white/10">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">Skill Range</label>
                <div className="flex items-center gap-2">
                  <input type="number" min="1" max="7" step="0.5"
                    className="w-full bg-bg-base border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                    value={criteria.skillMin}
                    onChange={e => setCriteria({ ...criteria, skillMin: parseFloat(e.target.value) })} />
                  <span className="text-text-muted">to</span>
                  <input type="number" min="1" max="7" step="0.5"
                    className="w-full bg-bg-base border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                    value={criteria.skillMax}
                    onChange={e => setCriteria({ ...criteria, skillMax: parseFloat(e.target.value) })} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">City</label>
                <select value={criteria.city}
                  className="w-full bg-bg-base border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                  onChange={e => setCriteria({ ...criteria, city: e.target.value })}>
                  <option value="">Any City</option>
                  {['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Quetta', 'Faisalabad'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase">Preferred Style to Match With</label>
              <div className="flex flex-wrap gap-2">
                {[{val: '', label: 'Any'}, {val: 'aggressive', label: 'Aggressive'}, {val: 'defensive', label: 'Defensive'}, {val: 'allRound', label: 'All-Round'}, {val: 'netDominant', label: 'Net Dominant'}].map(s => (
                  <button key={s.val}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${criteria.playingStyle === s.val ? 'bg-accent/20 border-accent text-accent' : 'bg-bg-base border-white/10 text-text-muted'}`}
                    onClick={() => setCriteria({ ...criteria, playingStyle: s.val })}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase">Preferred Position</label>
              <div className="flex flex-wrap gap-2">
                {[{val: '', label: 'Any'}, {val: 'left', label: 'Left'}, {val: 'right', label: 'Right'}, {val: 'both', label: 'Both'}].map(p => (
                  <button key={p.val}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${criteria.position === p.val ? 'bg-accent/20 border-accent text-accent' : 'bg-bg-base border-white/10 text-text-muted'}`}
                    onClick={() => setCriteria({ ...criteria, position: p.val })}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <button className="w-full py-2 bg-accent/20 hover:bg-accent/30 text-accent font-bold rounded-lg border border-accent/30 flex items-center justify-center gap-2 transition-colors" onClick={loadAiSuggestions}>
              <Sparkles size={14} /> Apply & Re-run AI
            </button>
          </div>
        )}
      </div>

      {/* ── 4-Slot Grid ── */}
      <div className="space-y-2">
        {/* Slot 1 — You, locked */}
        <div className="flex items-center gap-3 p-3 rounded-xl border border-[rgba(0,230,118,0.3)] bg-[rgba(0,230,118,0.05)]">
          <div className="w-8 h-8 rounded-full bg-[rgba(0,230,118,0.2)] flex items-center justify-center font-bold text-sm shrink-0 text-[#00E676]">1</div>
          <img src={currentUser?.avatarUrl || '/default-avatar.png'} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-white">{currentUser?.name || 'You'}</div>
            <div className="text-xs text-text-muted">You · {currentUser?.skillRating?.toFixed(1) || '3.0'}</div>
          </div>
          <div className="px-2 py-1 bg-white/10 rounded text-xs font-bold uppercase tracking-wide text-white">Organizer</div>
        </div>

        {/* Slots 2, 3, 4 */}
        {[0, 1, 2].map(idx => {
          const player = slots[idx];
          const slotNum = idx + 2;
          const isEditing = activeSlot === idx;

          return (
            <div key={idx} className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all ${isEditing ? 'border-accent bg-accent/5' : player ? 'border-[rgba(0,230,118,0.3)] bg-white/5' : 'border-dashed border-white/20 hover:border-accent cursor-pointer'}`}>
              {!isEditing && (
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm shrink-0 text-text-muted">{slotNum}</div>
              )}

              {!isEditing && player && (
                <>
                  <img src={player.avatarUrl || '/default-avatar.png'} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-white">{player.name}</div>
                    <div className="text-xs text-text-muted">{player.city} · {(player.skillRating || 3).toFixed(1)}</div>
                  </div>

                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${getScoreColorClass(player.matchScore)}`}>
                    {player.matchScore}%
                    {player.isAiPick && <Sparkles size={10} />}
                  </div>

                  <div className="flex gap-1 shrink-0 ml-2">
                    {player.isAiPick && (
                      <button className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-text-secondary" title="Get different AI pick" onClick={(e) => { e.stopPropagation(); swapWithAiPick(idx); }}>
                        <RefreshCw size={14} />
                      </button>
                    )}
                    <button className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-text-secondary" title="Search manually" onClick={(e) => { e.stopPropagation(); setActiveSlot(idx); setTimeout(() => searchRef.current?.focus(), 50); }}>
                      <Search size={14} />
                    </button>
                    <button className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500" title="Remove player" onClick={(e) => { e.stopPropagation(); removeFromSlot(idx); }}>
                      <X size={14} />
                    </button>
                  </div>
                </>
              )}

              {!isEditing && !player && (
                <div className="flex-1 flex items-center gap-3 opacity-60 hover:opacity-100" onClick={() => { setActiveSlot(idx); setTimeout(() => searchRef.current?.focus(), 50); }}>
                  <div className="w-10 h-10 rounded-full border border-dashed border-white/30 flex items-center justify-center text-text-muted shrink-0">
                    {aiLoading ? <Spinner size="sm" /> : <Plus size={16} />}
                  </div>
                  <div className="text-sm text-text-muted font-medium">
                    {aiLoading ? 'Finding best match...' : 'Open Slot — Click to search'}
                  </div>
                </div>
              )}

              {isEditing && (
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex items-center gap-2 bg-bg-base border border-accent/50 rounded-lg px-3 py-2">
                    <Search size={16} className="text-accent" />
                    <input ref={searchRef} type="text" placeholder="Type a name to search..." className="flex-1 bg-transparent text-sm text-white focus:outline-none" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus />
                    {searchLoading && <Spinner size="xs" />}
                    <button onClick={() => { setActiveSlot(null); setSearchQuery(''); }} className="text-text-muted hover:text-white">
                      <X size={16} />
                    </button>
                  </div>

                  {/* Search Results / AI Picks Dropdown */}
                  <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-bg-elevated border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto">
                    {searchResults.length > 0 && searchResults.map(p => (
                      <button key={p.id} className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 text-left" onClick={() => assignToSlot(idx, p, false)}>
                        <img src={p.avatarUrl || '/default-avatar.png'} alt="" className="w-8 h-8 rounded-full object-cover" />
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-white">{p.name}</div>
                          <div className="text-xs text-text-muted">{p.city} · {p.skillLevel}</div>
                        </div>
                        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getScoreColorClass(p.matchScore)}`}>{p.matchScore}%</div>
                      </button>
                    ))}

                    {searchQuery.length > 0 && !searchLoading && searchResults.length === 0 && (
                      <div className="p-4 text-center text-sm text-text-muted">No players found for "{searchQuery}"</div>
                    )}

                    {searchQuery.length === 0 && aiSuggestions.length > 0 && (
                      <div>
                        <div className="px-3 py-2 bg-accent/10 border-b border-accent/20 flex items-center gap-2 text-xs font-bold text-accent">
                          <Sparkles size={12} /> AI Suggestions
                        </div>
                        {aiSuggestions.filter(s => !slots.filter(Boolean).some(p => p.id === s.player.id)).slice(0, 5).map(s => (
                          <button key={s.player.id} className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors border-b border-white/5 border-l-2 border-l-accent text-left" onClick={() => assignToSlot(idx, s.player, true)}>
                            <img src={s.player.avatarUrl || '/default-avatar.png'} alt="" className="w-8 h-8 rounded-full object-cover" />
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-white flex items-center gap-2">
                                {s.player.name} <span className="bg-accent/20 text-accent px-1.5 py-0.5 rounded text-[9px] flex items-center gap-1 uppercase"><Sparkles size={8} /> AI Pick</span>
                              </div>
                              <div className="text-xs text-text-muted">{s.player.city} · {s.player.skillLevel} · {(s.player.skillRating || 3).toFixed(1)}</div>
                            </div>
                            <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getScoreColorClass(s.matchScore)}`}>{s.matchScore}%</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── AI Summary Bar ── */}
      {allFilled && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-[rgba(0,230,118,0.08)] border border-[rgba(0,230,118,0.2)]">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Sparkles size={14} className="text-[#00E676]" />
            Avg match score: <strong className="text-white">{Math.round(slots.filter(Boolean).reduce((s, p) => s + (p.matchScore || 0), 0) / 3)}%</strong>
            <span className="opacity-50">·</span>
            {slots.filter(p => p?.isAiPick).length} AI picks, {slots.filter(p => p && !p.isAiPick).length} manual
          </div>
          <button className="text-xs font-bold text-accent hover:text-white flex items-center gap-1" onClick={() => { setSlots([null, null, null]); loadAiSuggestions(); }}>
            <RefreshCw size={12} /> Refresh All
          </button>
        </div>
      )}

      {/* ── Next button ── */}
      <div className="pt-4 flex items-center justify-between">
        <span className="text-sm font-medium text-text-muted">
          {!allFilled && `${3 - slots.filter(Boolean).length} slot${3 - slots.filter(Boolean).length !== 1 ? 's' : ''} remaining`}
        </span>
        <button
          className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-bg-base font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={!allFilled}
          onClick={() => onPlayersConfirmed(slots)}>
          Next: Set Preferences →
        </button>
      </div>
    </div>
  );
}
