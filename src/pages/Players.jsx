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
import Spinner from '../components/ui/Spinner';
import { api } from '../services/api';

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
export function PlayerProfileCard({ player: initialPlayer, onMessage }) {
  const navigate = useNavigate();

  // Friendship state: 'none' | 'request_sent' | 'request_received' | 'friends'
  const [friendStatus, setFriendStatus] = useState(initialPlayer.friendshipStatus || 'none');
  const [friendRequestId, setFriendRequestId] = useState(initialPlayer.friendRequestId || null);
  const [friendLoading, setFriendLoading] = useState(false);

  useEffect(() => {
    // Fetch initial status if not provided
    const checkStatus = async () => {
      if (initialPlayer.friendshipStatus) return;
      try {
        const res = await api.get(`/friends/status/${initialPlayer.id}`);
        setFriendStatus(res.status);
        if (res.requestId) setFriendRequestId(res.requestId);
      } catch (e) {}
    };
    checkStatus();
  }, [initialPlayer.id, initialPlayer.friendshipStatus]);

  async function handleFriendAction() {
    if (friendLoading) return;
    setFriendLoading(true);

    try {
      if (friendStatus === 'none') {
        const data = await api.post('/friends/request', { targetUserId: initialPlayer.id });
        setFriendStatus('request_sent');
        setFriendRequestId(data.request.id);
        toast.success(`Friend request sent to ${initialPlayer.name}`);
      } else if (friendStatus === 'request_sent') {
        await api.delete(`/friends/request/${friendRequestId}`);
        setFriendStatus('none');
        setFriendRequestId(null);
        toast.success('Request cancelled');
      } else if (friendStatus === 'request_received') {
        await api.patch(`/friends/request/${friendRequestId}`, { action: 'accept' });
        setFriendStatus('friends');
        toast.success(`You are now friends with ${initialPlayer.name}`);
      } else if (friendStatus === 'friends') {
        if (window.confirm(`Remove ${initialPlayer.name} from friends?`)) {
          await api.delete(`/friends/${initialPlayer.id}`);
          setFriendStatus('none');
          toast.success('Friend removed');
        }
      }
    } catch (err) {
      toast.error(err.message || 'Action failed');
    } finally {
      setFriendLoading(false);
    }
  }

  const btnConfig = {
    none: { label: '+ Add', className: 'bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30', title: 'Send friend request' },
    request_sent: { label: '✓ Requested', className: 'bg-transparent border border-accent text-accent hover:bg-red-500/10 hover:border-red-500 hover:text-red-500 group-hover:content-cancel', title: 'Click to cancel request' },
    request_received: { label: '✓ Accept', className: 'bg-blue-500 text-white animate-pulse', title: 'Accept their friend request' },
    friends: { label: '✓ Friends', className: 'bg-transparent border border-white/20 text-text-secondary hover:border-red-500 hover:text-red-500', title: 'Click to remove friend' },
  }[friendStatus] || { label: '...', className: 'bg-white/5 text-text-muted', title: '' };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -3 }} transition={{ duration: 0.25 }}>
      <Card className="flex flex-col h-full overflow-hidden group">
        <div className={`h-1 w-full ${SKILL_COLORS[initialPlayer.skillLevel]?.split(' ')[0] || 'bg-accent/20'}`} />
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-start gap-4 mb-4">
            <div className="relative shrink-0">
              <Avatar name={initialPlayer.name} src={initialPlayer.avatarUrl} size="lg" className="ring-2 ring-white/10" />
              {initialPlayer.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center border-2 border-bg-elevated">
                  <Check size={9} className="text-bg-base font-bold" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white truncate leading-tight">{initialPlayer.name}</h3>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${SKILL_COLORS[initialPlayer.skillLevel] || 'bg-white/5 text-white border-white/10'}`}>
                  {initialPlayer.skillLevel}
                </span>
                {initialPlayer.city && (
                  <span className="flex items-center gap-1 text-[10px] text-text-muted">
                    <MapPin size={9} /> {initialPlayer.city}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xl font-bold text-accent font-mono">{formatRating(initialPlayer.skillRating)}</p>
              <p className="text-[9px] text-text-muted uppercase tracking-wider">Rating</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: 'Wins', value: initialPlayer.totalWins ?? '—', icon: Trophy },
              { label: 'Win %', value: winRatePct(initialPlayer.winRate), icon: TrendingUp },
              { label: 'Streak', value: initialPlayer.currentStreak > 0 ? `${initialPlayer.currentStreak}🔥` : (initialPlayer.currentStreak ?? '—'), icon: Zap },
            ].map(s => (
              <div key={s.label} className="bg-bg-base/40 rounded-xl p-2 text-center border border-white/5">
                <p className="text-sm font-bold text-white">{s.value}</p>
                <p className="text-[10px] text-text-muted">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap mb-4">
            {initialPlayer.playingStyle && (
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-text-secondary capitalize">
                {initialPlayer.playingStyle}
              </span>
            )}
            {initialPlayer.preferredPosition && initialPlayer.preferredPosition !== 'both' && (
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-text-secondary capitalize">
                {initialPlayer.preferredPosition === 'left' ? '🧤' : initialPlayer.preferredPosition === 'right' ? '🏓' : '↔️'} {initialPlayer.preferredPosition}
              </span>
            )}
          </div>

          <div className="mt-auto grid grid-cols-3 gap-2">
            <Button size="sm" variant="ghost" onClick={() => navigate(`/players/${initialPlayer.id}`)} className="col-span-1 !justify-center border border-white/10 text-[10px] px-1 hover:border-white/30">
              Profile
            </Button>
            <Button size="sm" variant="ghost" icon={MessageCircle} onClick={() => onMessage(initialPlayer)} className="col-span-1 !justify-center border border-white/10 hover:border-accent/30 hover:text-accent text-[10px] px-1">
              Message
            </Button>
            <button
              className={`col-span-1 flex items-center justify-center rounded-lg text-[10px] font-bold px-1 transition-all ${btnConfig.className} ${friendLoading ? 'opacity-70' : ''}`}
              onClick={handleFriendAction} disabled={friendLoading} title={btnConfig.title}
              onMouseEnter={(e) => { if (friendStatus === 'request_sent') e.currentTarget.innerText = 'Cancel?'; else if (friendStatus === 'friends') e.currentTarget.innerText = 'Remove'; }}
              onMouseLeave={(e) => { if (friendStatus === 'request_sent') e.currentTarget.innerText = btnConfig.label; else if (friendStatus === 'friends') e.currentTarget.innerText = btnConfig.label; }}
            >
              {friendLoading ? <Spinner size="xs" /> : btnConfig.label}
            </button>
          </div>

          <button
            onClick={() => navigate(`/matches?invitePlayer=${initialPlayer.id}&name=${encodeURIComponent(initialPlayer.name)}`)}
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
                    onMessage={handleMessage}
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
