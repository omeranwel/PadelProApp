import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Minus, Zap, Medal, Crown, Filter } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import { api } from '../services/api';
import { getSocket } from '../services/socketService';

const SKILL_COLORS = {
  beginner: { dot: 'bg-accent-blue', badge: 'badge-beginner' },
  intermediate: { dot: 'bg-accent', badge: 'badge-intermediate' },
  advanced: { dot: 'bg-accent-orange', badge: 'badge-advanced' },
  professional: { dot: 'bg-ai-purple', badge: 'badge-professional' },
};

const RankBadge = ({ rank }) => {
  if (rank === 1) return <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center"><Crown size={20} className="text-yellow-400" /></div>;
  if (rank === 2) return <div className="w-10 h-10 rounded-xl bg-zinc-400/10 border border-zinc-400/30 flex items-center justify-center"><Medal size={20} className="text-zinc-400" /></div>;
  if (rank === 3) return <div className="w-10 h-10 rounded-xl bg-amber-600/10 border border-amber-600/30 flex items-center justify-center"><Medal size={20} className="text-amber-600" /></div>;
  return <div className="w-10 h-10 rounded-xl bg-bg-elevated border border-border flex items-center justify-center font-mono font-bold text-text-muted text-sm">#{rank}</div>;
};

const FormDots = ({ form = [] }) => (
  <div className="flex gap-1 items-center">
    {(form || []).slice(-6).map((r, i) => (
      <div key={i} className={`w-2 h-2 rounded-full ${r === 'W' ? 'bg-accent' : 'bg-danger'}`} title={r} />
    ))}
  </div>
);

const Leaderboard = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ skillLevel: '' });
  const [activeTab, setActiveTab] = useState('rating');
  const [flashedIds, setFlashedIds] = useState({});
  const [liveIndicator, setLiveIndicator] = useState(false);

  const fetchLeaderboard = useCallback(() => {
    const params = new URLSearchParams({ limit: 30, ...filter }).toString();
    return api.get(`/players/leaderboard?${params}`)
      .then(d => setPlayers(Array.isArray(d) ? d : d.data || []))
      .catch(() => {});
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    fetchLeaderboard().finally(() => setLoading(false));
  }, [fetchLeaderboard]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = ({ players: updated }) => {
      if (!Array.isArray(updated)) return;
      setLiveIndicator(true);
      setTimeout(() => setLiveIndicator(false), 3000);
      const flashMap = {};
      updated.forEach(p => { flashMap[p.id] = p.ratingChange; });
      setFlashedIds(flashMap);
      setTimeout(() => setFlashedIds({}), 3000);
      fetchLeaderboard();
    };
    socket.on('leaderboard:update', handler);
    return () => socket.off('leaderboard:update', handler);
  }, [fetchLeaderboard]);

  const sorted = [...players].sort((a, b) =>
    activeTab === 'rating' ? b.skillRating - a.skillRating
    : activeTab === 'wins' ? b.totalWins - a.totalWins
    : b.winRate - a.winRate
  ).map((p, i) => ({ ...p, rank: i + 1 }));

  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  return (
    <PageWrapper bg="/bg-courts.png">
      <section className="relative py-16 px-6 overflow-hidden border-b border-border">
        <div className="absolute inset-0 court-bg opacity-50" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Trophy size={20} className="text-accent" />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Karachi Rankings</span>
            <AnimatePresence>
              {liveIndicator && (
                <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="ml-2 flex items-center gap-1.5 px-3 py-1 bg-accent/10 border border-accent/30 rounded-full text-xs font-bold text-accent">
                  <span className="w-2 h-2 bg-accent rounded-full animate-pulse" /> LIVE UPDATE
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <h1 className="text-6xl md:text-8xl font-display text-text-primary mb-4">LEADERBOARD</h1>
          <p className="text-text-secondary text-lg max-w-xl">
            Karachi's top padel players ranked by skill rating, updated in real time after every logged match.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center mb-10">
          <div className="flex bg-bg-elevated rounded-xl border border-border p-1 gap-1">
            {[['rating','Skill Rating'],['wins','Most Wins'],['winRate','Win Rate']].map(([key,label])=>(
              <button key={key} onClick={()=>setActiveTab(key)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab===key?'bg-accent text-bg-base shadow-sm':'text-text-muted hover:text-text-primary'}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Filter size={16} className="text-text-muted" />
            <select value={filter.skillLevel} onChange={e=>setFilter(f=>({...f,skillLevel:e.target.value}))}
              className="bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm font-medium text-text-primary">
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="professional">Professional</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {top3.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-12">
                {[top3[1], top3[0], top3[2]].map((p, i) => {
                  const isFirst = i === 1;
                  const heights = ['h-40', 'h-52', 'h-36'];
                  const colors = ['bg-zinc-400/10 border-zinc-400/20', 'bg-yellow-400/10 border-yellow-400/20', 'bg-amber-600/10 border-amber-600/20'];
                  const textColors = ['text-zinc-300', 'text-yellow-400', 'text-amber-600'];
                  return (
                    <motion.div key={p.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.1}}
                      className="flex flex-col items-center gap-3">
                      <div className={`w-full ${heights[i]} flex flex-col items-center justify-end pb-4 ${colors[i]} border rounded-2xl`}>
                        <Avatar name={p.name} src={p.avatarUrl} size={isFirst?'xl':'lg'} className="mb-2" />
                        <p className={`font-bold text-sm ${isFirst?'text-base':''}`}>{p.name.split(' ')[0]}</p>
                        <p className={`font-mono font-bold text-xl ${textColors[i]}`}>{p.skillRating?.toFixed(1)}</p>
                      </div>
                      <RankBadge rank={p.rank} />
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Full Table */}
            <Card className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-text-muted w-16">Rank</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-text-muted">Player</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-text-muted hidden sm:table-cell">Level</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-text-muted text-right">Rating</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-text-muted text-right hidden md:table-cell">W/L</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-text-muted text-right hidden lg:table-cell">Win%</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-text-muted hidden xl:table-cell">Form</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-text-muted text-right hidden md:table-cell">Streak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((p, i) => {
                      const flash = flashedIds[p.id];
                      return (
                      <motion.tr key={p.id}
                        initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:i*0.03}}
                        className={`border-b border-border/50 hover:bg-bg-elevated/50 transition-colors group ${flash !== undefined ? (flash >= 0 ? 'bg-accent/5' : 'bg-danger/5') : ''}`}>
                        <td className="px-6 py-4"><RankBadge rank={p.rank} /></td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={p.name} src={p.avatarUrl} size="sm" />
                            <div>
                              <p className="font-bold text-sm group-hover:text-accent transition-colors">{p.name}</p>
                              <p className="text-xs text-text-muted">{p.preferredArea || p.city}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${SKILL_COLORS[p.skillLevel]?.badge || 'badge-beginner'}`}>
                            {p.skillLevel?.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-mono font-bold text-accent text-lg">{p.skillRating?.toFixed(1)}</span>
                            <AnimatePresence>
                              {flash !== undefined && (
                                <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                  className={`text-xs font-bold font-mono ${flash >= 0 ? 'text-accent' : 'text-danger'}`}>
                                  {flash >= 0 ? '+' : ''}{flash?.toFixed(2)}
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right hidden md:table-cell">
                          <span className="text-sm font-medium text-success">{p.totalWins}</span>
                          <span className="text-text-muted mx-1">/</span>
                          <span className="text-sm font-medium text-danger">{p.totalLosses}</span>
                        </td>
                        <td className="px-6 py-4 text-right hidden lg:table-cell">
                          <span className="text-sm font-bold text-text-primary">{p.winRate?.toFixed(0)}%</span>
                        </td>
                        <td className="px-6 py-4 hidden xl:table-cell"><FormDots form={p.recentForm} /></td>
                        <td className="px-6 py-4 text-right hidden md:table-cell">
                          {(p.currentStreak||0) > 0 ? (
                            <div className="flex items-center justify-end gap-1 text-success"><TrendingUp size={14} /><span className="font-bold text-sm">{p.currentStreak}W</span></div>
                          ) : (p.currentStreak||0) < 0 ? (
                            <div className="flex items-center justify-end gap-1 text-danger"><TrendingDown size={14} /><span className="font-bold text-sm">{Math.abs(p.currentStreak)}L</span></div>
                          ) : (
                            <div className="flex items-center justify-end gap-1 text-text-muted"><Minus size={14} /><span className="text-sm">—</span></div>
                          )}
                        </td>
                      </motion.tr>
                    );
                    })}
                  </tbody>
                </table>
              </div>
              {sorted.length === 0 && (
                <div className="py-20 text-center text-text-muted">No players found.</div>
              )}
            </Card>
          </>
        )}
      </section>
    </PageWrapper>
  );
};

export default Leaderboard;
