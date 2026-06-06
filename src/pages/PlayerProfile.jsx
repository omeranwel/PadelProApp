import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, Zap, Trophy, Star, TrendingUp, Activity, Calendar,
  MessageSquare, UserPlus, UserCheck, Clock, ChevronLeft, Shield
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { api } from '../services/api';
import { playerService } from '../services/playerService';
import { chatService } from '../services/chatService';
import { useAuthStore } from '../store/authStore';
import { useMatchStore } from '../store/matchStore';
import toast from 'react-hot-toast';

const StatBox = ({ label, value, sub, color = 'text-text-primary' }) => (
  <div className="bg-bg-elevated rounded-2xl p-4 text-center">
    <p className={`text-2xl font-bold font-display ${color}`}>{value}</p>
    {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
    <p className="text-xs text-text-muted mt-1 uppercase tracking-wider font-semibold">{label}</p>
  </div>
);

const FormDot = ({ result }) => (
  <div
    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
      result === 'W' ? 'bg-success/20 text-success border border-success/30' : 'bg-danger/20 text-danger border border-danger/30'
    }`}
  >
    {result}
  </div>
);

export default function PlayerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuthStore();
  const { sendRequest, sentRequests } = useMatchStore();

  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [friendStatus, setFriendStatus] = useState('none'); // none | request_sent | request_received | friends
  const [chatLoading, setChatLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/players/${id}`)
      .then(data => {
        setPlayer(data);
        // Fetch friend status
        return api.get('/friends').then(res => {
          const friends = res.friends || [];
          if (friends.find(f => f.id === id)) { setFriendStatus('friends'); return; }
          return api.get('/friends/requests').then(r => {
            const reqs = r.requests || [];
            if (reqs.find(req => req.senderId === id)) setFriendStatus('request_received');
          });
        });
      })
      .catch(() => toast.error('Failed to load player profile'))
      .finally(() => setLoading(false));
  }, [id]);

  // Also check if we've sent a request
  useEffect(() => {
    if (sentRequests?.includes(id)) setFriendStatus('request_sent');
  }, [sentRequests, id]);

  const handleChallenge = async () => {
    if (!isLoggedIn) { toast.error('Please log in first'); return; }
    if (friendStatus === 'friends' || friendStatus === 'request_sent') return;
    
    // Optimistic UI update
    const prevStatus = friendStatus;
    setFriendStatus('request_sent');
    if (sendRequest) sendRequest(id);
    
    setSending(true);
    try {
      await playerService.sendRequest(id);
      toast.success(`Challenge sent to ${player.name}!`);
    } catch (err) {
      setFriendStatus(prevStatus); // Revert
      toast.error(err.message || 'Failed to send request');
    } finally {
      setSending(false);
    }
  };

  const handleChat = async () => {
    if (!isLoggedIn) { toast.error('Please log in first'); return; }
    setChatLoading(true);
    try {
      const res = await chatService.createConversation(id);
      const convoId = res.id || res.conversation?.id;
      navigate(`/chat?conversation=${convoId}`);
    } catch (err) {
      toast.error('Could not open conversation');
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) return (
    <PageWrapper bg="/bg-player.png">
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    </PageWrapper>
  );

  if (!player) return (
    <PageWrapper bg="/bg-player.png">
      <div className="text-center py-24 text-text-muted">Player not found.</div>
    </PageWrapper>
  );

  const matchesPlayed = (player.totalWins || 0) + (player.totalLosses || 0);
  const isOwnProfile = user?.id === id;

  const challengeLabel = {
    none: 'Challenge',
    request_sent: 'Request Sent ✓',
    request_received: 'Accept Request',
    friends: 'Friends ✓',
  }[friendStatus] || 'Challenge';

  return (
    <PageWrapper bg="/bg-player.png">
      <div className="max-w-4xl mx-auto px-6 pb-24">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mt-6 mb-8 group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Players
        </button>

        {/* Hero Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-8 mb-6 relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-ai-purple/5 pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <div className="relative shrink-0">
                <Avatar name={player.name} src={player.avatarUrl} size="2xl" className="ring-4 ring-accent/20 ring-offset-4 ring-offset-bg-card" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full border-4 border-bg-card" />
                {player.isVerified && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent-blue rounded-full border-2 border-bg-card flex items-center justify-center">
                    <Shield size={10} className="text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold font-display">{player.name}</h1>
                  {player.totalWins >= 20 && <Trophy size={20} className="text-warning" />}
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant={player.skillLevel}>{(player.skillLevel || 'beginner').toUpperCase()}</Badge>
                  <span className="text-sm font-mono font-bold text-accent border border-accent/20 bg-accent/5 px-2.5 py-0.5 rounded-full">
                    {(player.skillRating || 3.0).toFixed(1)} Rating
                  </span>
                  {player.city && (
                    <span className="text-sm text-text-muted flex items-center gap-1">
                      <MapPin size={12} /> {player.city}
                      {player.preferredArea && ` · ${player.preferredArea}`}
                    </span>
                  )}
                </div>
                {player.bio && (
                  <p className="text-text-secondary italic text-sm leading-relaxed mb-4 max-w-lg">
                    "{player.bio}"
                  </p>
                )}
                <p className="text-xs text-text-muted flex items-center gap-1">
                  <Clock size={11} /> Active {player.lastActive || 'recently'}
                </p>
              </div>

              {!isOwnProfile && (
                <div className="flex flex-col gap-3 shrink-0 w-full sm:w-auto">
                  <Button
                    onClick={handleChat}
                    disabled={chatLoading}
                    variant="secondary"
                    icon={MessageSquare}
                    className="w-full sm:w-44"
                  >
                    {chatLoading ? 'Opening...' : 'Message'}
                  </Button>
                  <Button
                    onClick={handleChallenge}
                    disabled={sending || friendStatus === 'request_sent' || friendStatus === 'friends'}
                    icon={friendStatus === 'friends' || friendStatus === 'request_sent' ? UserCheck : UserPlus}
                    className={`w-full sm:w-44 ${
                      friendStatus === 'friends' ? '!bg-success/20 !text-success border border-success/30' :
                      friendStatus === 'request_sent' ? '!bg-accent/10 !text-accent border border-accent/30' : ''
                    }`}
                  >
                    {sending ? 'Sending...' : challengeLabel}
                  </Button>
                </div>
              )}
              {isOwnProfile && (
                <Button onClick={() => navigate('/profile')} variant="outline" className="shrink-0">
                  Edit Profile
                </Button>
              )}
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Grid */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
                <Activity size={14} /> Statistics
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatBox label="Matches" value={matchesPlayed} />
                <StatBox label="Wins" value={player.totalWins || 0} color="text-success" />
                <StatBox label="Losses" value={player.totalLosses || 0} color="text-danger" />
                <StatBox label="Win Rate" value={`${(player.winRate || 0).toFixed(0)}%`} color="text-accent" />
              </div>
            </motion.div>

            {/* Recent Form */}
            {(player.recentForm || []).length > 0 && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
                  <TrendingUp size={14} /> Recent Form
                </h3>
                <Card className="p-5">
                  <div className="flex gap-2 items-center flex-wrap">
                    {(player.recentForm || []).slice(-10).map((r, i) => (
                      <FormDot key={i} result={r} />
                    ))}
                  </div>
                  <p className="text-xs text-text-muted mt-3">
                    Streak: <span className={`font-bold ${(player.currentStreak || 0) > 0 ? 'text-success' : 'text-danger'}`}>
                      {(player.currentStreak || 0) > 0 ? `+${player.currentStreak} W` : `${player.currentStreak} L`}
                    </span>
                  </p>
                </Card>
              </motion.div>
            )}

            {/* Rating History chart (simple bars) */}
            {Array.isArray(player.skillRatingHistory) && player.skillRatingHistory.length > 1 && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
                  <Star size={14} /> Rating History
                </h3>
                <Card className="p-5">
                  <div className="flex items-end gap-1 h-16">
                    {player.skillRatingHistory.slice(-20).map((entry, i, arr) => {
                      const vals = arr.map(e => e.rating || e);
                      const min = Math.min(...vals) - 0.2;
                      const max = Math.max(...vals) + 0.2;
                      const pct = ((( entry.rating || entry) - min) / (max - min)) * 100;
                      const isUp = i > 0 && (entry.rating || entry) >= (arr[i-1].rating || arr[i-1]);
                      return (
                        <div
                          key={i}
                          title={`${(entry.rating || entry).toFixed(2)}`}
                          style={{ height: `${Math.max(pct, 8)}%` }}
                          className={`flex-1 rounded-t-sm transition-all ${isUp ? 'bg-success/60' : 'bg-danger/60'}`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] text-text-muted mt-2">
                    <span>Earliest</span>
                    <span>Latest: {(player.skillRating || 3).toFixed(2)}</span>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right: Details */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-4">Play Style</h3>
              <Card className="p-5 space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-xs text-text-muted">Style</span>
                  <span className="text-sm font-bold capitalize">{player.playingStyle || '—'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-xs text-text-muted">Position</span>
                  <span className="text-sm font-bold capitalize">{player.preferredPosition || '—'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-xs text-text-muted">Hand</span>
                  <span className="text-sm font-bold capitalize">{player.dominantHand || '—'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-text-muted">Mode</span>
                  <span className="text-sm font-bold capitalize">{player.preferredMode || 'Both'}</span>
                </div>
              </Card>
            </motion.div>

            {/* Availability */}
            {(player.availability || []).length > 0 && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
                  <Calendar size={14} /> Availability
                </h3>
                <Card className="p-5">
                  <div className="flex flex-wrap gap-2">
                    {(player.availability || []).map((a, i) => (
                      <div key={i} className="px-3 py-1.5 bg-bg-elevated border border-border rounded-xl text-xs font-medium text-text-secondary">
                        {a.day || a}{a.slots ? ` (${a.slots[0]})` : ''}
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
