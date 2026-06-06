import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Users, MessageCircle, UserPlus, UserCheck,
  Star, Trophy, MapPin, Zap, TrendingUp, X, Check, ChevronDown
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import { playerService } from '../services/playerService';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced', 'professional'];
const CITIES = ['All Cities', 'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad'];
const STYLES = ['All Styles', 'aggressive', 'defensive', 'all-round', 'netDominant'];

const SKILL_COLORS = {
  beginner:     'bg-blue-500/10 text-blue-400 border-blue-500/20',
  intermediate: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  advanced:     'bg-orange-500/10 text-orange-400 border-orange-500/20',
  professional: 'bg-accent/10 text-accent border-accent/20',
};

const formatRating = (r) => (typeof r === 'number' ? r.toFixed(1) : '—');
const winRatePct  = (r) => (typeof r === 'number' ? `${Math.round(r)}%` : '—');

// ─── Single Player Card ────────────────────────────────────────────
function PlayerProfileCard({ player, currentUserId, onMessage, onInvite, onFriend }) {
  const isFriend     = player.isFriend;
  const requestSent  = player.requestSent;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -3 }} transition={{ duration: 0.25 }}>
      <Card className="flex flex-col h-full overflow-hidden group">
        {/* Top accent bar */}
        <div className={`h-1 w-full ${SKILL_COLORS[player.skillLevel]?.split(' ')[0] || 'bg-accent/20'}`} />

        <div className="p-5 flex-1 flex flex-col">
          {/* Avatar + name */}
          <div className="flex items-start gap-4 mb-4">
            <div className="relative shrink-0">
              <Avatar name={player.name} src={player.avatarUrl} size="lg" className="ring-2 ring-white/10" />
              {player.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center border-2 border-bg-elevated">
                  <Check size={9} className="text-bg-base font-bold" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white truncate leading-tight">{player.name}</h3>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${SKILL_COLORS[player.skillLevel] || 'bg-white/5 text-white border-white/10'}`}>
                  {player.skillLevel}
                </span>
                {player.city && (
                  <span className="flex items-center gap-1 text-[10px] text-text-muted">
                    <MapPin size={9} /> {player.city}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xl font-bold text-accent font-mono">{formatRating(player.skillRating)}</p>
              <p className="text-[9px] text-text-muted uppercase tracking-wider">Rating</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: 'Wins',    value: player.totalWins ?? '—',              icon: Trophy },
              { label: 'Win %',  value: winRatePct(player.winRate),            icon: TrendingUp },
              { label: 'Streak', value: player.currentStreak > 0 ? `${player.currentStreak}🔥` : (player.currentStreak ?? '—'), icon: Zap },
            ].map(s => (
              <div key={s.label} className="bg-bg-base/40 rounded-xl p-2 text-center border border-white/5">
                <p className="text-sm font-bold text-white">{s.value}</p>
                <p className="text-[10px] text-text-muted">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Style + position */}
          <div className="flex gap-2 flex-wrap mb-4">
            {player.playingStyle && (
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-text-secondary capitalize">
                {player.playingStyle}
              </span>
            )}
            {player.preferredPosition && player.preferredPosition !== 'both' && (
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-text-secondary capitalize">
                {player.preferredPosition} side
              </span>
            )}
            {player.dominantHand && (
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-text-secondary">
                {player.dominantHand === 'right' ? '🤜 Right' : '🤛 Left'}
              </span>
            )}
          </div>

          {/* Bio */}
          {player.bio && (
            <p className="text-xs text-text-muted line-clamp-2 mb-4 italic flex-1">"{player.bio}"</p>
          )}

          {/* Actions */}
          <div className="mt-auto flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              icon={MessageCircle}
              onClick={() => onMessage(player)}
              className="flex-1 !justify-center border border-white/10 hover:border-accent/30 hover:text-accent"
            >
              Message
            </Button>
            {isFriend ? (
              <Button size="sm" variant="ghost" className="flex-1 !justify-center border border-success/20 text-success" disabled>
                <UserCheck size={13} /> Friends
              </Button>
            ) : requestSent ? (
              <Button size="sm" variant="ghost" className="flex-1 !justify-center text-text-muted" disabled>
                Pending
              </Button>
            ) : (
              <Button
                size="sm"
                icon={UserPlus}
                onClick={() => onFriend(player)}
                className="flex-1 !justify-center"
              >
                Add
              </Button>
            )}
          </div>

          {/* Invite to match */}
          <button
            onClick={() => onInvite(player)}
            className="mt-2 w-full py-2 rounded-xl bg-accent/5 hover:bg-accent/10 border border-accent/10 hover:border-accent/30 text-accent text-xs font-semibold transition-all"
          >
            🎾 Invite to Match
          </button>
        </div>
      </Card>
    </motion.div>
  );
}

// ─── Filter Bar ────────────────────────────────────────────────────
function FilterBar({ filters, setFilters }) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative">
        <select
          value={filters.skillLevel}
          onChange={e => setFilters(f => ({ ...f, skillLevel: e.target.value }))}
          className="appearance-none pl-4 pr-8 py-2.5 bg-bg-elevated/80 backdrop-blur-md border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-accent/50 cursor-pointer"
        >
          <option value="">All Skill Levels</option>
          {SKILL_LEVELS.map(l => <option key={l} value={l} className="capitalize">{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
      </div>
      <div className="relative">
        <select
          value={filters.city}
          onChange={e => setFilters(f => ({ ...f, city: e.target.value === 'All Cities' ? '' : e.target.value }))}
          className="appearance-none pl-4 pr-8 py-2.5 bg-bg-elevated/80 backdrop-blur-md border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-accent/50 cursor-pointer"
        >
          {CITIES.map(c => <option key={c} value={c} className="bg-bg-elevated">{c}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
      </div>
      <div className="relative">
        <select
          value={filters.playingStyle}
          onChange={e => setFilters(f => ({ ...f, playingStyle: e.target.value === 'All Styles' ? '' : e.target.value }))}
          className="appearance-none pl-4 pr-8 py-2.5 bg-bg-elevated/80 backdrop-blur-md border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-accent/50 cursor-pointer"
        >
          {STYLES.map(s => <option key={s} className="bg-bg-elevated capitalize">{s}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────
export default function Players() {
  const { user: currentUser } = useAuthStore();
  const navigate = useNavigate();

  const [players, setPlayers]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [query, setQuery]       = useState('');
  const [filters, setFilters]   = useState({ skillLevel: '', city: '', playingStyle: '' });
  const [total, setTotal]       = useState(0);

  const loadPlayers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (query.trim())           params.name         = query.trim();
      if (filters.skillLevel)     params.skillLevel   = filters.skillLevel;
      if (filters.city)           params.city         = filters.city;
      if (filters.playingStyle)   params.playingStyle = filters.playingStyle;

      const res = await playerService.getPlayers(params);
      const list = Array.isArray(res) ? res : (res.players || []);
      setPlayers(list);
      setTotal(res.total || list.length);
    } catch (err) {
      toast.error('Failed to load players');
    } finally {
      setLoading(false);
    }
  }, [query, filters]);

  useEffect(() => {
    const t = setTimeout(loadPlayers, 300);
    return () => clearTimeout(t);
  }, [loadPlayers]);

  const handleMessage = (player) => {
    navigate(`/chat?userId=${player.id}`);
  };

  const handleFriend = async (player) => {
    try {
      await playerService.sendRequest(player.id);
      toast.success(`Friend request sent to ${player.name}!`);
      setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, requestSent: true } : p));
    } catch (err) {
      toast.error(err.message || 'Failed to send request');
    }
  };

  const handleInvite = (player) => {
    navigate(`/matches?invitePlayer=${player.id}&name=${encodeURIComponent(player.name)}`);
  };

  return (
    <PageWrapper bg="/bg-courts.png">
      {/* ── Hero ───────────────────────────────── */}
      <section className="relative border-b border-white/10 py-14 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-bg-card/50 backdrop-blur-sm -z-10" />
        <div className="max-w-7xl mx-auto">
          <Badge variant="ai" className="mb-3 py-1.5 px-4 text-xs">PADEL COMMUNITY</Badge>
          <h1 className="text-4xl md:text-5xl font-bold font-display text-white mb-3">
            Find Your{' '}
            <span className="text-accent underline decoration-accent/30 underline-offset-8">Perfect Partners</span>
          </h1>
          <p className="text-text-secondary max-w-xl mb-6">
            Browse all players, check their skill ratings, and invite them to a match — or just connect and grow your network.
          </p>

          {/* Search */}
          <div className="relative max-w-lg">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by player name..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 bg-bg-elevated/80 backdrop-blur-md border border-white/10 rounded-2xl text-white placeholder:text-text-muted focus:outline-none focus:border-accent/50 text-sm"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-10">
        {/* Filters + count */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <FilterBar filters={filters} setFilters={setFilters} />
          <p className="text-sm text-text-muted">
            {loading ? 'Loading...' : `${total} player${total !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {loading && players.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-bg-elevated/40 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : players.length === 0 ? (
          <Card className="text-center py-20">
            <Users size={40} className="mx-auto mb-4 text-text-muted opacity-40" />
            <h3 className="text-xl font-bold text-white mb-2">No players found</h3>
            <p className="text-text-muted text-sm">Try adjusting your filters or search term.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence>
              {players.map((player, i) => (
                <motion.div key={player.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <PlayerProfileCard
                    player={player}
                    currentUserId={currentUser?.id}
                    onMessage={handleMessage}
                    onInvite={handleInvite}
                    onFriend={handleFriend}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </PageWrapper>
  );
}
