import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Calendar, Users, TrendingUp, Clock, ChevronRight, Zap, Star, MapPin, Plus, Activity, Swords, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import LogResultModal from '../components/features/LogResultModal';
import PlayerReviewModal from '../components/features/PlayerReviewModal';
import { useAuthStore } from '../store/authStore';
import { useBookingStore } from '../store/bookingStore';
import { playerService } from '../services/playerService';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-elevated border border-border-strong rounded-xl px-4 py-3 shadow-xl text-sm">
      <p className="text-text-muted font-bold mb-1">{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color }} className="font-bold">{p.name}: {p.value}</p>)}
    </div>
  );
};

const FormBadge = ({ result }) => (
  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${result === 'W' ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-danger/10 text-danger border border-danger/20'}`}>{result}</span>
);

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <Card className="p-5 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <span className="text-xs font-bold uppercase tracking-widest text-text-muted">{label}</span>
      <div className={`w-9 h-9 rounded-xl bg-bg-elevated border border-border flex items-center justify-center ${color}`}><Icon size={18} /></div>
    </div>
    <p className="text-3xl font-display">{value}</p>
    {sub && <p className="text-xs text-text-muted">{sub}</p>}
  </Card>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { bookings, fetchUserBookings, loading: bookingsLoading } = useBookingStore();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [logMatchOpen, setLogMatchOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewOpponent, setReviewOpponent] = useState(null);
  const [reviewMatchId, setReviewMatchId] = useState(null);
  const [pendingReviews, setPendingReviews] = useState([]);

  useEffect(() => {
    if (user) {
      fetchUserBookings();
      playerService.getMyStats()
        .then(d => setStats(d?.data || d))
        .catch(() => {})
        .finally(() => setLoadingStats(false));

      api.get('/reviews/pending')
        .then(res => setPendingReviews(res.data || res))
        .catch(() => {});
    }
  }, [user]);

  const displayName = user?.name || 'Player';
  const upcomingBookings = bookings.filter(b => b.status === 'CONFIRMED' || new Date(b.date) >= new Date());

  const chartData = (Array.isArray(stats?.skillRatingHistory) ? stats.skillRatingHistory : [])
    .slice(-8).map(h => ({ date: format(new Date(h.date), 'MMM d'), rating: parseFloat((h.rating || 3).toFixed(2)) }));

  const radarData = [
    { subject: 'Skill', value: Math.round(((stats?.skillRating || 3) / 7) * 100) },
    { subject: 'Win Rate', value: Math.round(stats?.winRate || 50) },
    { subject: 'Experience', value: Math.min(100, Math.round(((stats?.matchesPlayed || 0) / 50) * 100)) },
    { subject: 'Form', value: (stats?.recentForm || []).filter(f => f === 'W').length * 10 },
    { subject: 'Streak', value: Math.min(100, Math.max(0, ((stats?.currentStreak || 0) + 5) * 10)) },
  ];

  const wlData = [
    { name: 'Wins', value: stats?.totalWins || 0, color: '#00E676' },
    { name: 'Losses', value: stats?.totalLosses || 0, color: '#EF4444' },
  ].filter(d => d.value > 0);

  const refreshStats = () => {
    playerService.getMyStats().then(d => setStats(d?.data || d)).catch(() => {});
    api.get('/reviews/pending').then(res => setPendingReviews(res.data || res)).catch(() => {});
  };

  if (!user) return null;

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-28">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pt-2">
          <div>
            <h1 className="text-5xl md:text-6xl font-display">WELCOME BACK,<br /><span className="text-accent">{displayName.split(' ')[0].toUpperCase()}</span></h1>
            <p className="text-text-secondary mt-1 font-body">Karachi Padel — Your performance hub</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setLogMatchOpen(true)} variant="outline" icon={Swords} size="sm">Log Match</Button>
            <Button onClick={() => navigate('/courts')} icon={Plus} size="sm">Book Court</Button>
          </div>
        </div>

        {pendingReviews.length > 0 && (
          <Card className="bg-gradient-to-r from-accent/10 to-accent-blue/10 border-accent/20 p-5 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-display text-lg text-text-primary flex items-center gap-2">
                <Star className="text-warning fill-warning" size={18} /> PENDING PLAYER REVIEWS
              </h3>
              <p className="text-xs text-text-secondary mt-1 font-body">
                You played recently. Rate your opponent {pendingReviews[0].opponent.name} to help build their profile!
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => {
                const first = pendingReviews[0];
                setReviewOpponent(first.opponent);
                setReviewMatchId(first.match.id);
                setReviewOpen(true);
              }}>
                Review Now
              </Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Skill Rating" value={((stats?.skillRating || user?.skillRating || 3)).toFixed ? (stats?.skillRating || user?.skillRating || 3).toFixed(1) : '3.0'} icon={Star} color="text-accent" sub={`${user?.skillLevel || 'beginner'} level`} />
          <StatCard label="Total Wins" value={stats?.totalWins || 0} icon={Trophy} color="text-accent-orange" sub={`${(stats?.winRate || 0).toFixed(0)}% win rate`} />
          <StatCard label="Matches" value={stats?.matchesPlayed || 0} icon={Activity} color="text-accent-blue" sub={`${stats?.totalLosses || 0} losses`} />
          <StatCard label="Streak"
            value={(stats?.currentStreak || 0) > 0 ? `+${stats.currentStreak}W` : (stats?.currentStreak || 0) < 0 ? `${Math.abs(stats.currentStreak)}L` : '—'}
            icon={Zap} color={(stats?.currentStreak || 0) >= 0 ? 'text-accent' : 'text-danger'}
            sub={(stats?.currentStreak || 0) > 0 ? 'Win streak' : (stats?.currentStreak || 0) < 0 ? 'Loss streak' : 'No active streak'} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-6">
            {/* Skill Rating Chart */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-xl font-display">SKILL RATING HISTORY</h3>
                  <p className="text-xs text-text-muted mt-1 font-body">ELO-based progression — updated after every match</p>
                </div>
                <span className="font-mono font-bold text-accent text-lg">{(stats?.skillRating || user?.skillRating || 3).toFixed?.(2) || '3.00'}</span>
              </div>
              {chartData.length > 1 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="date" tick={{ fill: '#4A6080', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={['auto', 'auto']} tick={{ fill: '#4A6080', fontSize: 11 }} axisLine={false} tickLine={false} width={35} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="rating" stroke="#00E676" strokeWidth={2.5} dot={{ fill: '#00E676', r: 4, strokeWidth: 0 }} name="Skill Rating" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-border rounded-2xl">
                  <div className="text-center">
                    <BarChart2 size={32} className="text-text-muted mx-auto mb-3" />
                    <p className="text-text-muted text-sm font-body">Log matches to build your rating history</p>
                    <Button size="sm" variant="ghost" className="mt-3 !text-accent" onClick={() => setLogMatchOpen(true)}>Log your first match →</Button>
                  </div>
                </div>
              )}
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-display mb-5">WIN / LOSS</h3>
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width={110} height={110}>
                    <PieChart>
                      <Pie data={wlData.length ? wlData : [{ name: 'No data', value: 1, color: '#1E3050' }]} cx="50%" cy="50%" innerRadius={35} outerRadius={52} dataKey="value" paddingAngle={3}>
                        {(wlData.length ? wlData : [{ color: '#1E3050' }]).map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1"><span className="text-text-muted font-body">Wins</span><span className="font-bold text-accent">{stats?.totalWins || 0}</span></div>
                      <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden"><div className="h-full bg-accent rounded-full" style={{ width: `${Math.min(100, stats?.winRate || 0)}%` }} /></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1"><span className="text-text-muted font-body">Losses</span><span className="font-bold text-danger">{stats?.totalLosses || 0}</span></div>
                      <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden"><div className="h-full bg-danger rounded-full" style={{ width: `${Math.min(100, 100 - (stats?.winRate || 0))}%` }} /></div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-display mb-2">PERFORMANCE</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#4A6080', fontSize: 9 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar dataKey="value" stroke="#00E676" fill="#00E676" fillOpacity={0.12} />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-display">RECENT FORM</h3>
                <button onClick={() => navigate('/leaderboard')} className="text-xs text-accent hover:underline font-body">Leaderboard →</button>
              </div>
              <div className="flex gap-2 flex-wrap mb-4">
                {(stats?.recentForm || []).length > 0
                  ? (stats.recentForm || []).map((r, i) => <FormBadge key={i} result={r} />)
                  : <p className="text-text-muted text-sm font-body">No matches logged yet.</p>}
              </div>
              {(stats?.recentMatches || []).length > 0 && (
                <div className="space-y-2 border-t border-border pt-4">
                  {stats.recentMatches.slice(0, 4).map(m => (
                    <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-bg-elevated border border-border">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${m.result === 'W' ? 'bg-accent/10 text-accent' : 'bg-danger/10 text-danger'}`}>{m.result}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">vs. {m.opponent?.name || 'Unknown'}</p>
                        <p className="text-xs text-text-muted font-body">{m.court?.name || ''}{m.date ? ` • ${format(new Date(m.date), 'MMM d, yyyy')}` : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-5">
            <Card className="p-6 text-center">
              <Avatar name={displayName} src={user?.avatarUrl} size="xl" className="mx-auto mb-4 ring-2 ring-accent/20" />
              <h4 className="text-xl font-display">{displayName.toUpperCase()}</h4>
              <p className="text-text-muted text-sm mb-3 font-body">{user?.preferredArea || user?.city || 'Karachi'}</p>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mb-4 ${user?.skillLevel === 'professional' ? 'badge-professional' : user?.skillLevel === 'advanced' ? 'badge-advanced' : user?.skillLevel === 'intermediate' ? 'badge-intermediate' : 'badge-beginner'}`}>
                {(user?.skillLevel || 'beginner').toUpperCase()}
              </div>
              <div className="h-px bg-border mb-4" />
              <div className="text-center mb-4">
                <p className="text-4xl font-display text-accent">{(stats?.skillRating || user?.skillRating || 3).toFixed?.(1) || '3.0'}</p>
                <p className="text-xs text-text-muted font-body">Skill Rating (1.0–7.0)</p>
              </div>
              <Button size="sm" variant="outline" className="w-full" onClick={() => navigate('/profile')}>Edit Profile <ChevronRight size={14} /></Button>
            </Card>

            <Card className="p-4 space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted px-2 mb-3">Quick Actions</h4>
              {[
                { label: 'Find Match Partner', icon: Users, path: '/matches', color: 'text-ai-purple' },
                { label: 'Book a Court', icon: MapPin, path: '/courts', color: 'text-accent-blue' },
                { label: 'View Leaderboard', icon: Trophy, path: '/leaderboard', color: 'text-accent' },
                { label: 'Tournaments', icon: Star, path: '/tournaments', color: 'text-accent-orange' },
              ].map(({ label, icon: Icon, path, color }) => (
                <button key={path} onClick={() => navigate(path)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-bg-elevated transition-all group text-left">
                  <Icon size={18} className={color} />
                  <span className="text-sm font-medium group-hover:text-text-primary text-text-secondary font-body">{label}</span>
                  <ChevronRight size={14} className="ml-auto text-text-muted" />
                </button>
              ))}
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted">Upcoming Games</h4>
                <button onClick={() => navigate('/bookings')} className="text-xs text-accent hover:underline font-body">View all</button>
              </div>
              {upcomingBookings.length > 0 ? (
                <div className="space-y-3">
                  {upcomingBookings.slice(0, 3).map(b => (
                    <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-bg-elevated border border-border">
                      <div className="w-10 h-10 bg-accent-blue/10 border border-accent-blue/20 rounded-xl flex flex-col items-center justify-center shrink-0">
                        <span className="text-[9px] font-bold text-accent-blue uppercase">{format(new Date(b.date), 'MMM')}</span>
                        <span className="text-sm font-bold font-display leading-none">{new Date(b.date).getDate()}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{b.court?.name || 'Court'}</p>
                        <p className="text-xs text-text-muted font-body">{b.startTime} • Rs {b.totalAmount?.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-muted text-center py-4 font-body">No upcoming bookings</p>
              )}
            </Card>
          </div>
        </div>
      </div>

      <LogResultModal
        isOpen={logMatchOpen}
        onClose={(opponent, matchId) => {
          setLogMatchOpen(false);
          refreshStats();
          if (opponent) {
            setReviewOpponent(opponent);
            setReviewMatchId(matchId);
            setReviewOpen(true);
          }
        }}
        connectedPlayers={[]}
      />

      <PlayerReviewModal
        isOpen={reviewOpen}
        onClose={() => {
          setReviewOpen(false);
          refreshStats();
        }}
        opponent={reviewOpponent}
        matchId={reviewMatchId}
      />
    </PageWrapper>
  );
};

export default Dashboard;
