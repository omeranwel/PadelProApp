import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Zap, Users, Clock, Globe, Lock, Bell, RefreshCw } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import CreateMatchModal from '../components/matches/CreateMatchModal';
import LobbyCard from '../components/matches/LobbyCard';
import { lobbyService } from '../services/lobbyService';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'my',     label: 'My Matches',     icon: Users },
  { key: 'open',   label: 'Find a Match',   icon: Globe },
  { key: 'invites',label: 'Invites',         icon: Bell  },
];

export default function Matches() {
  const { isLoggedIn, user: currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('my');
  const [showCreate, setShowCreate] = useState(false);

  const [myLobbies, setMyLobbies]         = useState({ organized: [], joined: [], pendingInvites: [] });
  const [openLobbies, setOpenLobbies]     = useState([]);
  const [loading, setLoading]             = useState(false);

  const loadData = async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    try {
      const [myRes, openRes] = await Promise.allSettled([
        lobbyService.getMy(),
        lobbyService.getOpen(),
      ]);
      if (myRes.status === 'fulfilled') {
        setMyLobbies(myRes.value);
      }
      if (openRes.status === 'fulfilled') {
        setOpenLobbies(openRes.value.lobbies || []);
      }
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isLoggedIn]);

  const pendingInviteCount = myLobbies.pendingInvites?.length || 0;

  return (
    <PageWrapper bg="/bg-player.png">
      {/* ── Hero ───────────────────────────────── */}
      <section className="relative border-b border-white/10 py-14 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-bg-card/50 backdrop-blur-sm -z-10" />
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <Badge variant="ai" className="mb-3 py-1.5 px-4 text-xs">PADEL 4-PLAYER MATCHMAKING</Badge>
              <h1 className="text-4xl md:text-5xl font-bold font-display leading-tight text-white">
                Build Your{' '}
                <span className="text-accent underline decoration-accent/30 underline-offset-8">Perfect Foursome</span>
              </h1>
              <p className="text-text-secondary mt-3 max-w-xl">
                Padel is 2v2 — always 4 players. Create a private match with friends or post an open match and let our AI balance the teams.
              </p>
            </div>
            {isLoggedIn && (
              <Button
                size="lg"
                icon={Plus}
                onClick={() => setShowCreate(true)}
                className="shrink-0 shadow-lg shadow-accent/20"
              >
                Create Match
              </Button>
            )}
          </div>

          {/* Quick stats */}
          <div className="mt-8 flex flex-wrap gap-4">
            {[
              { icon: Globe, label: 'Open matches', value: openLobbies.length },
              { icon: Users, label: 'My lobbies', value: (myLobbies.organized?.length || 0) + (myLobbies.joined?.length || 0) },
              { icon: Bell, label: 'Pending invites', value: pendingInviteCount },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5">
                <s.icon size={16} className="text-accent" />
                <div>
                  <p className="text-lg font-bold text-white leading-none">{s.value}</p>
                  <p className="text-[11px] text-text-muted">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tabs ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div className="flex bg-bg-card/80 backdrop-blur-md p-1 rounded-2xl border border-white/5 shadow-lg">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-5 py-2.5 text-sm font-semibold rounded-xl transition-all flex items-center gap-2
                  ${activeTab === tab.key ? 'text-white' : 'text-text-muted hover:text-white'}`}
              >
                {activeTab === tab.key && (
                  <motion.div layoutId="matches-tab" className="absolute inset-0 bg-accent/20 border border-accent/30 rounded-xl shadow-[0_0_12px_rgba(0,230,118,0.2)]" />
                )}
                <tab.icon size={14} className="relative z-10" />
                <span className="relative z-10">{tab.label}</span>
                {tab.key === 'invites' && pendingInviteCount > 0 && (
                  <span className="relative z-10 bg-danger text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {pendingInviteCount}
                  </span>
                )}
              </button>
            ))}
          </div>
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={loadData} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {!isLoggedIn ? (
          <Card className="text-center py-20">
            <Users size={40} className="mx-auto mb-4 text-text-muted opacity-40" />
            <h3 className="text-xl font-bold text-white mb-2">Sign in to play</h3>
            <p className="text-text-muted text-sm">Log in to create matches, invite friends, and build your foursome.</p>
          </Card>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>

              {/* ── MY MATCHES ── */}
              {activeTab === 'my' && (
                <div className="space-y-10">
                  {/* Organized */}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted flex items-center gap-2 mb-4">
                      <Lock size={13} /> Matches I Created
                    </h3>
                    {(myLobbies.organized?.length || 0) === 0 ? (
                      <EmptyState
                        icon={Plus}
                        title="No matches created yet"
                        sub="Hit 'Create Match' to invite friends or post an open match."
                        action={{ label: 'Create Match', onClick: () => setShowCreate(true) }}
                      />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {myLobbies.organized.map(lobby => (
                          <LobbyCard key={lobby.id} lobby={lobby} viewAs="organizer" onRefresh={loadData} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Joined */}
                  {(myLobbies.joined?.length || 0) > 0 && (
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted flex items-center gap-2 mb-4">
                        <Users size={13} /> Matches I Joined
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {myLobbies.joined.map(lobby => (
                          <LobbyCard key={lobby.id} lobby={lobby} viewAs="member" onRefresh={loadData} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── OPEN MATCHES ── */}
              {activeTab === 'open' && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted flex items-center gap-2 mb-4">
                    <Globe size={13} /> Open Matches Near You
                  </h3>
                  {openLobbies.length === 0 ? (
                    <EmptyState
                      icon={Globe}
                      title="No open matches available"
                      sub="Be the first — post an open match and let players request to join!"
                      action={{ label: 'Post Open Match', onClick: () => setShowCreate(true) }}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {openLobbies.map(lobby => (
                        <LobbyCard key={lobby.id} lobby={lobby} viewAs="browser" onRefresh={loadData} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── INVITES ── */}
              {activeTab === 'invites' && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted flex items-center gap-2 mb-4">
                    <Bell size={13} /> Pending Match Invites
                  </h3>
                  {(myLobbies.pendingInvites?.length || 0) === 0 ? (
                    <EmptyState
                      icon={Bell}
                      title="No pending invites"
                      sub="When someone invites you to a match, it will appear here."
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {myLobbies.pendingInvites.map(invite => (
                        <LobbyCard
                          key={invite.id}
                          lobby={{ ...invite.lobby, pendingInvite: invite }}
                          viewAs="invitee"
                          onRefresh={loadData}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </section>

      {/* ── Create Match Modal ── */}
      <AnimatePresence>
        {showCreate && (
          <CreateMatchModal onClose={() => setShowCreate(false)} onCreated={loadData} />
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}

const EmptyState = ({ icon: Icon, title, sub, action }) => (
  <Card className="text-center py-16 px-8">
    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
      <Icon size={28} className="text-text-muted opacity-50" />
    </div>
    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
    <p className="text-text-muted text-sm mb-6">{sub}</p>
    {action && <Button onClick={action.onClick} size="sm">{action.label}</Button>}
  </Card>
);
