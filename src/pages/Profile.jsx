import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, Shield, Bell,
  Trophy, Settings, LogOut, Camera,
  CheckCircle2, Save, ChevronRight, ChevronLeft,
  Target, Zap, Crosshair, Sparkles, History,
  TrendingUp, TrendingDown, Minus, BarChart2, Swords
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart } from 'recharts';
import { format } from 'date-fns';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Avatar from '../components/ui/Avatar';
import LogResultModal from '../components/features/LogResultModal';
import { useAuthStore } from '../store/authStore';
import { playerService } from '../services/playerService';
import toast from 'react-hot-toast';

const MATCHES_PER_PAGE = 8;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-elevated border border-border-strong rounded-xl px-4 py-3 shadow-xl text-sm">
      <p className="text-text-muted font-bold mb-1">{label}</p>
      <p className="font-bold text-accent">Rating: {payload[0]?.value?.toFixed(2)}</p>
    </div>
  );
};

const ResultBadge = ({ result }) => (
  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0
    ${result === 'W' ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-danger/10 text-danger border border-danger/20'}`}>
    {result}
  </span>
);

const Profile = () => {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('Personal');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [matchPage, setMatchPage] = useState(0);
  const [showLogModal, setShowLogModal] = useState(false);

  useEffect(() => {
    if (user) {
      playerService.getMyStats()
        .then(d => setStats(d?.data || d))
        .catch(() => {})
        .finally(() => setLoadingStats(false));
    }
  }, [user]);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Profile updated successfully');
    }, 1500);
  };

  const chartData = (Array.isArray(stats?.skillRatingHistory) ? stats.skillRatingHistory : [])
    .map(h => ({ date: format(new Date(h.date), 'MMM d'), rating: parseFloat((h.rating || 3).toFixed(2)) }));

  const allMatches = stats?.recentMatches || [];
  const totalPages = Math.ceil(allMatches.length / MATCHES_PER_PAGE);
  const pagedMatches = allMatches.slice(matchPage * MATCHES_PER_PAGE, (matchPage + 1) * MATCHES_PER_PAGE);

  const sidebarItems = [
    { id: 'Personal', label: 'Personal Information', icon: User },
    { id: 'Skill', label: 'Skill & ELO Rating', icon: Trophy },
    { id: 'History', label: 'Match History', icon: History },
    { id: 'Preferences', label: 'Player Preferences', icon: Settings },
    { id: 'Security', label: 'Security & Login', icon: Shield },
    { id: 'Notifications', label: 'Notification Settings', icon: Bell },
  ];

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <h1 className="text-4xl font-bold font-display mb-12">Account Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="p-1 space-y-1">
              {sidebarItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl text-sm font-bold transition-all
                    ${activeTab === item.id ? 'bg-bg-elevated text-text-primary border border-border/50 shadow-sm' : 'text-text-muted hover:text-text-secondary hover:bg-bg-subtle/50'}`}
                >
                  <item.icon size={18} className={activeTab === item.id ? 'text-accent-blue' : ''} />
                  {item.label}
                </button>
              ))}
            </Card>

            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-6 py-4 rounded-xl text-sm font-bold text-danger hover:bg-danger/10 transition-all"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">

              {/* Personal Tab */}
              {activeTab === 'Personal' && (
                <motion.div key="personal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <Card className="p-10">
                    <div className="flex flex-col md:flex-row items-center gap-10 mb-12">
                      <div className="relative group">
                        <Avatar name={user?.name} size="xl" className="w-32 h-32 text-4xl ring-4 ring-border group-hover:ring-accent-blue transition-all" />
                        <button className="absolute bottom-0 right-0 p-3 bg-accent-blue text-white rounded-full border-4 border-bg-card shadow-lg hover:scale-110 transition-all">
                          <Camera size={20} />
                        </button>
                      </div>
                      <div className="text-center md:text-left">
                        <h3 className="text-2xl font-bold font-display mb-2">{user?.name}</h3>
                        <p className="text-text-secondary font-medium mb-4">{user?.city || 'Karachi'} • {user?.skillLevel || 'Beginner'}</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                          <Badge variant="blue">VERIFIED PLAYER</Badge>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${user?.skillLevel === 'professional' ? 'badge-professional' : user?.skillLevel === 'advanced' ? 'badge-advanced' : user?.skillLevel === 'intermediate' ? 'badge-intermediate' : 'badge-beginner'}`}>
                            {(user?.skillLevel || 'BEGINNER').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <Input label="Full Name" defaultValue={user?.name} icon={User} />
                      <Input label="Email Address" defaultValue={user?.email} icon={Mail} />
                      <Input label="Phone Number" defaultValue={user?.phone || ''} icon={Phone} />
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-text-primary">City</label>
                        <input defaultValue={user?.city || 'Karachi'} className="bg-bg-elevated border border-border-strong rounded-lg py-2.5 px-4 text-text-primary text-sm focus:outline-none focus:border-accent" />
                      </div>
                    </div>

                    <div className="pt-10 mt-10 border-t border-border flex justify-end">
                      <Button size="lg" className="px-12" onClick={handleSave} loading={loading} icon={Save}>Save Changes</Button>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Skill & ELO Tab */}
              {activeTab === 'Skill' && (
                <motion.div key="skill" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  {/* Current Rating Card */}
                  <Card className="p-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                      <div>
                        <h3 className="text-2xl font-bold font-display flex items-center gap-2"><Trophy className="text-accent" /> Skill Rating</h3>
                        <p className="text-text-secondary mt-1">ELO-based rating updated after every logged match</p>
                      </div>
                      <Button variant="outline" size="sm" icon={Swords} onClick={() => setShowLogModal(true)}>Log Match</Button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                      {[
                        { label: 'ELO Rating', value: loadingStats ? '—' : (stats?.skillRating || user?.skillRating || 3).toFixed?.(2) || '3.00', color: 'text-accent', sub: '(1.0–7.0 scale)' },
                        { label: 'Win Rate', value: loadingStats ? '—' : `${(stats?.winRate || 0).toFixed(0)}%`, color: 'text-accent-orange', sub: `${stats?.totalWins || 0}W / ${stats?.totalLosses || 0}L` },
                        { label: 'Matches', value: loadingStats ? '—' : stats?.matchesPlayed || 0, color: 'text-accent-blue', sub: 'total played' },
                        { label: 'Streak', value: loadingStats ? '—' : (stats?.currentStreak || 0) > 0 ? `+${stats.currentStreak}W` : (stats?.currentStreak || 0) < 0 ? `${Math.abs(stats.currentStreak)}L` : '—', color: (stats?.currentStreak || 0) >= 0 ? 'text-accent' : 'text-danger', sub: 'current' },
                      ].map(s => (
                        <div key={s.label} className="bg-bg-elevated border border-border rounded-2xl p-4 text-center">
                          <p className="text-xs text-text-muted uppercase tracking-widest mb-1">{s.label}</p>
                          <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
                          <p className="text-xs text-text-muted mt-1">{s.sub}</p>
                        </div>
                      ))}
                    </div>

                    {/* ELO Chart */}
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-4">Rating Progression</h4>
                      {chartData.length > 1 ? (
                        <ResponsiveContainer width="100%" height={200}>
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00E676" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#00E676" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="date" tick={{ fill: '#4A6080', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis domain={['auto', 'auto']} tick={{ fill: '#4A6080', fontSize: 11 }} axisLine={false} tickLine={false} width={35} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="rating" stroke="#00E676" strokeWidth={2.5}
                              fill="url(#ratingGrad)" dot={{ fill: '#00E676', r: 4, strokeWidth: 0 }} name="Rating" />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-[200px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl gap-3">
                          <BarChart2 size={32} className="text-text-muted" />
                          <p className="text-text-muted text-sm">Log matches to build your rating history</p>
                          <Button size="sm" variant="ghost" className="!text-accent" onClick={() => setShowLogModal(true)}>Log your first match →</Button>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Recent Form */}
                  <Card className="p-6">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-4">Recent Form (last 10)</h4>
                    <div className="flex gap-2 flex-wrap">
                      {(stats?.recentForm || []).length > 0
                        ? (stats.recentForm || []).map((r, i) => (
                          <span key={i} className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold
                            ${r === 'W' ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-danger/10 text-danger border border-danger/20'}`}>{r}</span>
                        ))
                        : <p className="text-text-muted text-sm">No matches yet — log your first match above.</p>
                      }
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Match History Tab */}
              {activeTab === 'History' && (
                <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <Card className="p-0 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                      <div>
                        <h3 className="text-xl font-display font-bold">MATCH HISTORY</h3>
                        <p className="text-xs text-text-muted mt-0.5">{allMatches.length} match{allMatches.length !== 1 ? 'es' : ''} logged</p>
                      </div>
                      <Button size="sm" variant="outline" icon={Swords} onClick={() => setShowLogModal(true)}>Log Result</Button>
                    </div>

                    {loadingStats ? (
                      <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : allMatches.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <History size={40} className="text-text-muted" />
                        <p className="text-text-muted text-sm">No matches logged yet</p>
                        <Button size="sm" onClick={() => setShowLogModal(true)} icon={Swords}>Log your first match</Button>
                      </div>
                    ) : (
                      <>
                        <div className="divide-y divide-border/50">
                          {pagedMatches.map((m, i) => (
                            <motion.div key={m.id}
                              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                              className="flex items-center gap-4 px-6 py-4 hover:bg-bg-elevated/50 transition-colors">
                              <ResultBadge result={m.result} />
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <Avatar name={m.opponent?.name || '?'} src={m.opponent?.avatarUrl} size="sm" />
                                <div className="min-w-0">
                                  <p className="font-bold text-sm truncate">vs. {m.opponent?.name || 'Unknown'}</p>
                                  <p className="text-xs text-text-muted">
                                    {m.court?.name ? `${m.court.name} · ` : ''}
                                    {m.date ? format(new Date(m.date), 'MMM d, yyyy') : ''}
                                  </p>
                                </div>
                              </div>
                              {m.score?.sets && (
                                <div className="hidden sm:flex gap-1 items-center shrink-0">
                                  {m.score.sets.map((s, si) => (
                                    <span key={si} className="text-xs font-mono text-text-muted bg-bg-elevated border border-border px-2 py-1 rounded-lg">
                                      {s.player1}–{s.player2}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <div className={`shrink-0 flex items-center gap-1 text-xs font-bold font-mono ${m.result === 'W' ? 'text-accent' : 'text-danger'}`}>
                                {m.result === 'W' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {m.result === 'W' ? 'WIN' : 'LOSS'}
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                            <button onClick={() => setMatchPage(p => Math.max(0, p - 1))} disabled={matchPage === 0}
                              className="flex items-center gap-1.5 text-sm font-bold text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors">
                              <ChevronLeft size={16} /> Previous
                            </button>
                            <span className="text-xs text-text-muted">
                              Page {matchPage + 1} of {totalPages}
                            </span>
                            <button onClick={() => setMatchPage(p => Math.min(totalPages - 1, p + 1))} disabled={matchPage === totalPages - 1}
                              className="flex items-center gap-1.5 text-sm font-bold text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors">
                              Next <ChevronRight size={16} />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </Card>

                  {/* Mini ELO chart */}
                  {chartData.length > 1 && (
                    <Card className="p-6">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-4">ELO Progression</h4>
                      <ResponsiveContainer width="100%" height={160}>
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00E676" stopOpacity={0.12} />
                              <stop offset="95%" stopColor="#00E676" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                          <XAxis dataKey="date" tick={{ fill: '#4A6080', fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis domain={['auto', 'auto']} tick={{ fill: '#4A6080', fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="rating" stroke="#00E676" strokeWidth={2}
                            fill="url(#histGrad)" dot={{ fill: '#00E676', r: 3, strokeWidth: 0 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Card>
                  )}
                </motion.div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'Preferences' && (
                <motion.div key="pref" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <Card className="p-10">
                    <div className="mb-10">
                      <h3 className="text-2xl font-bold font-display mb-2">Matchmaking Preferences</h3>
                      <p className="text-text-secondary">Tailor your AI matching experience to your style.</p>
                    </div>
                    <div className="space-y-10">
                      <div className="space-y-4">
                        <label className="text-sm font-bold uppercase tracking-widest text-text-muted">Preferred Position</label>
                        <div className="grid grid-cols-3 gap-4">
                          {['Left Side', 'Right Side', 'Both'].map(p => (
                            <button key={p} className={`py-4 rounded-xl border-2 font-bold transition-all ${p === 'Both' ? 'border-accent-blue bg-accent-blue/5 text-accent-blue' : 'border-border text-text-muted hover:border-border-strong'}`}>{p}</button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="text-sm font-bold uppercase tracking-widest text-text-muted">Court Preference</label>
                        <div className="grid grid-cols-2 gap-4">
                          {['Indoor Only', 'Outdoor Only', 'No Preference'].map(c => (
                            <button key={c} className={`py-4 rounded-xl border-2 font-bold transition-all ${c === 'No Preference' ? 'border-accent-blue bg-accent-blue/5 text-accent-blue' : 'border-border text-text-muted hover:border-border-strong'}`}>{c}</button>
                          ))}
                        </div>
                      </div>
                      <div className="pt-6 border-t border-border flex justify-end">
                        <Button size="lg" className="px-12" onClick={handleSave} loading={loading}>Update Preferences</Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Security Tab */}
              {activeTab === 'Security' && (
                <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <Card className="p-10 space-y-8">
                    <div>
                      <h3 className="text-2xl font-bold font-display mb-2">Security & Login</h3>
                      <p className="text-text-secondary">Manage your password and security preferences.</p>
                    </div>
                    <div className="space-y-6 max-w-xl">
                      <Input label="Current Password" type="password" />
                      <Input label="New Password" type="password" />
                      <Input label="Confirm New Password" type="password" />
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-bg-elevated rounded-xl border border-border mt-8 gap-4">
                        <div>
                          <h5 className="font-bold">Two-Factor Authentication</h5>
                          <p className="text-xs text-text-secondary">Add an extra layer of security to your account.</p>
                        </div>
                        <Button variant="outline" size="sm">Enable 2FA</Button>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-border flex justify-end">
                      <Button size="lg" className="px-12" onClick={handleSave} loading={loading}>Update Security</Button>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'Notifications' && (
                <motion.div key="notifications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <Card className="p-10 space-y-8">
                    <div>
                      <h3 className="text-2xl font-bold font-display mb-2">Notification Preferences</h3>
                      <p className="text-text-secondary">Control what alerts you receive.</p>
                    </div>
                    <div className="space-y-0 border border-border rounded-2xl overflow-hidden divide-y divide-border">
                      {[
                        { title: 'Match Requests', desc: 'When someone invites you to play', email: true, push: true },
                        { title: 'Booking Reminders', desc: 'Alerts 2 hours before your game', email: false, push: true },
                        { title: 'Marketplace Alerts', desc: 'When saved items drop in price', email: true, push: false },
                        { title: 'Community Updates', desc: 'Newsletters and announcements', email: true, push: false },
                      ].map((item, i) => (
                        <div key={i} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between bg-bg-card gap-4">
                          <div>
                            <h5 className="font-bold">{item.title}</h5>
                            <p className="text-xs text-text-secondary">{item.desc}</p>
                          </div>
                          <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" defaultChecked={item.email} className="accent-accent-blue" />
                              <span className="text-sm font-semibold text-text-muted">Email</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" defaultChecked={item.push} className="accent-accent-blue" />
                              <span className="text-sm font-semibold text-text-muted">Push</span>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="pt-6 border-t border-border flex justify-end">
                      <Button size="lg" className="px-12" onClick={handleSave} loading={loading}>Save Settings</Button>
                    </div>
                  </Card>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>

      <LogResultModal isOpen={showLogModal} onClose={() => setShowLogModal(false)} connectedPlayers={[]} />
    </PageWrapper>
  );
};

export default Profile;
