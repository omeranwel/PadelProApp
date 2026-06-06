import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Users, UserCheck, ClipboardList, Filter } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import PlayerCard from '../components/features/PlayerCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import LogResultModal from '../components/features/LogResultModal';
import { useMatchStore } from '../store/matchStore';
import { useAuthStore } from '../store/authStore';
import { playerService } from '../services/playerService';
import { api } from '../services/api';
import toast from 'react-hot-toast';

// Cities available in the platform
const CITIES = ['All Cities', 'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad'];
const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];

const Matches = () => {
  const navigate = useNavigate();
  const [isAiMatching, setIsAiMatching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const { suggestions, requests, fetchSuggestions, loading, addRequest } = useMatchStore();
  const { isLoggedIn } = useAuthStore();
  const [skillFilter, setSkillFilter] = useState([]);
  const [cityFilter, setCityFilter] = useState('All Cities');
  const [activeTab, setActiveTab] = useState('active');

  const [receivedRequests, setReceivedRequests] = useState([]);
  const [connectedPlayers, setConnectedPlayers] = useState([]);

  React.useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  React.useEffect(() => {
    if (isLoggedIn) {
      playerService.getRequests().then(res => {
        const reqs = res.requests || [];
        setReceivedRequests(reqs.map(r => ({
          ...r.sender,
          requestId: r.id,
          friendStatus: 'request_received',
        })));
      }).catch(() => {});

      api.get('/friends').then(res => {
        setConnectedPlayers((res.friends || []).map(f => ({ ...f, friendStatus: 'friends' })));
      }).catch(() => {});
    }
  }, [isLoggedIn]);

  const handleAccept = async (requestId) => {
    try {
      await playerService.updateRequest(requestId, 'accepted');
      toast.success('Match accepted!');
      const accepted = receivedRequests.find(r => r.requestId === requestId);
      setReceivedRequests(prev => prev.filter(r => r.requestId !== requestId));
      if (accepted) {
        setConnectedPlayers(prev => [...prev, { ...accepted, friendStatus: 'friends' }]);
      }
      api.get('/friends').then(res => setConnectedPlayers((res.friends || []).map(f => ({ ...f, friendStatus: 'friends' }))));
    } catch (err) {
      toast.error('Failed to accept request.');
    }
  };

  const [showLogResult, setShowLogResult] = useState(false);

  const toggleSkill = (skill) => {
    setSkillFilter(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const startMatching = () => {
    setIsAiMatching(true);
    setTimeout(() => {
      setIsAiMatching(false);
      setShowResults(true);
    }, 2500);
  };

  const filteredPlayers = useMemo(() => {
    if (!suggestions || !suggestions.length) return [];
    return suggestions.filter(p => {
      if (skillFilter.length > 0 && !skillFilter.includes((p.skillLevel || '').toLowerCase())) return false;
      if (cityFilter !== 'All Cities' && p.city !== cityFilter) return false;
      return true;
    });
  }, [skillFilter, cityFilter, suggestions]);

  return (
    <PageWrapper bg="/bg-player.png">
      {/* Hero */}
      <section className="relative border-b border-white/10 py-16 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-bg-card/40 backdrop-blur-sm -z-10" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <Badge variant="ai" className="mb-4 py-1.5 px-4 text-xs">AI SMART MATCHING</Badge>
            <h1 className="text-5xl font-bold font-display mb-6 leading-tight text-white">
              Finding Your Perfect{' '}
              <span className="text-ai-purple underline decoration-ai-purple/30 underline-offset-8">Padel Foursome</span>
            </h1>
            <p className="text-text-secondary text-xl mb-10 max-w-xl">
              Padel is a 4-player game. Our intelligent AI algorithm finds 3 highly compatible players to complete your match based on skill level, location, and play-style.
            </p>
            {!showResults && !isAiMatching && (
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="px-10 !bg-ai-purple shadow-xl shadow-ai-purple/20" icon={Zap} onClick={startMatching}>
                  Run AI Matchmaker
                </Button>
                <Button
                  size="lg" variant="outline" className="px-10" icon={Users}
                  onClick={() => { document.getElementById('player-results')?.scrollIntoView({ behavior: 'smooth' }); }}
                >
                  Browse Players
                </Button>
              </div>
            )}
          </div>

          <div className="flex-1 relative hidden lg:flex justify-center">
            <div className="relative w-80 h-80">
              <motion.div
                animate={isAiMatching ? { rotate: 360 } : { rotate: 0 }}
                transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                className="absolute inset-0 border-2 border-dashed border-ai-purple/20 rounded-full"
              />
              <motion.div
                animate={isAiMatching ? { scale: [1, 1.2, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-8 bg-ai-purple/10 backdrop-blur-3xl rounded-full border border-ai-purple/30 flex items-center justify-center"
              >
                <Zap size={60} className={`text-ai-purple ${isAiMatching ? 'animate-pulse' : ''}`} fill="currentColor" />
              </motion.div>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={isAiMatching
                    ? { x: [Math.cos(i) * 140, Math.cos(i) * 100, Math.cos(i) * 140], y: [Math.sin(i) * 140, Math.sin(i) * 100, Math.sin(i) * 140] }
                    : { x: Math.cos(i) * 140, y: Math.sin(i) * 140 }}
                  transition={{ repeat: Infinity, duration: 4, delay: i * 0.5 }}
                  className="absolute top-1/2 left-1/2 -ml-6 -mt-6 w-12 h-12 bg-bg-card border border-border rounded-full flex items-center justify-center font-bold text-text-secondary overflow-hidden shadow-xl"
                >
                  <div className="w-full h-full bg-gradient-to-br from-ai-purple/20 to-transparent" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI Matching progress */}
      <AnimatePresence>
        {isAiMatching && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            className="px-6 max-w-3xl mx-auto py-24 text-center"
          >
            <div className="space-y-12">
              <div className="relative h-2 bg-bg-elevated rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2.5 }}
                  className="absolute inset-y-0 left-0 bg-ai-purple"
                />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold font-display animate-pulse text-ai-purple">Analyzing Active Players...</h3>
                <p className="text-text-secondary">Comparing skill consistency, location proximity, and court availability.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player Results */}
      {!isAiMatching && (
        <section className="px-6 max-w-7xl mx-auto py-12" id="player-results">
          {showResults && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mb-12 p-8 bg-ai-purple/5 border border-ai-purple/20 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-ai-purple text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-ai-purple/20">
                  <UserCheck size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-display text-white">Match Found: Your Foursome is Ready</h3>
                  <p className="text-text-secondary">Showing your 3 most compatible players to complete the match.</p>
                </div>
              </div>
              <Button variant="outline" className="border-ai-purple text-ai-purple hover:bg-ai-purple/10" onClick={() => setShowResults(false)}>
                Reset Search
              </Button>
            </motion.div>
          )}

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="w-full md:w-64 space-y-6 shrink-0">
              <Card className="p-5 space-y-8">
                <div className="space-y-3">
                  <h4 className="font-bold text-sm uppercase tracking-widest text-text-muted flex items-center gap-2">
                    <Filter size={13} /> Skill Level
                  </h4>
                  <div className="space-y-2">
                    {SKILL_LEVELS.map(l => (
                      <label key={l} className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="hidden" onChange={() => toggleSkill(l.toLowerCase())} checked={skillFilter.includes(l.toLowerCase())} />
                        <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${skillFilter.includes(l.toLowerCase()) ? 'border-accent-blue bg-accent-blue/10' : 'border-white/20 bg-bg-base/50 group-hover:border-accent-blue'}`}>
                          {skillFilter.includes(l.toLowerCase()) && <div className="w-2.5 h-2.5 bg-accent-blue rounded-sm" />}
                        </div>
                        <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary">{l}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* City filter */}
                <div className="space-y-3">
                  <h4 className="font-bold text-sm uppercase tracking-widest text-text-muted">City</h4>
                  <div className="space-y-1.5">
                    {CITIES.map(city => (
                      <button
                        key={city}
                        onClick={() => setCityFilter(city)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                          cityFilter === city
                            ? 'bg-accent/10 text-accent border border-accent/20'
                            : 'text-text-secondary hover:text-white hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="p-5 border-dashed border-border-strong bg-transparent text-center">
                <p className="text-xs text-text-muted mb-3 italic">"I usually play in Clifton and DHA area. Looking for morning games."</p>
                <Button variant="ghost" size="sm" className="w-full underline" onClick={() => navigate('/profile')}>
                  Update Bio
                </Button>
              </Card>
            </aside>

            {/* Player Grid */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                <h3 className="text-xl font-bold font-display uppercase tracking-tight hidden sm:block">Players</h3>
                <div className="flex items-center gap-3 flex-wrap">
                  {isLoggedIn && (
                    <Button size="sm" variant="outline" icon={ClipboardList} onClick={() => setShowLogResult(true)}>
                      Log Result
                    </Button>
                  )}
                  <div className="flex bg-bg-card/80 backdrop-blur-md p-1 rounded-lg border border-white/5 shadow-lg">
                    <button
                      onClick={() => setActiveTab('active')}
                      className={`px-4 py-2 text-xs font-bold rounded-md transition-colors ${activeTab === 'active' ? 'bg-bg-card text-accent-blue shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                    >
                      Active ({filteredPlayers.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('requests')}
                      className={`px-4 py-2 text-xs font-bold rounded-md transition-colors ${activeTab === 'requests' ? 'bg-bg-card text-accent-blue shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                    >
                      Requests{receivedRequests.length > 0 && (
                        <span className="ml-1 bg-accent-orange text-white px-1.5 rounded-full">{receivedRequests.length}</span>
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab('connected')}
                      className={`px-4 py-2 text-xs font-bold rounded-md transition-colors ${activeTab === 'connected' ? 'bg-bg-card text-accent-blue shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                    >
                      Connected ({connectedPlayers.length})
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Tab */}
              {activeTab === 'active' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {filteredPlayers.length === 0 ? (
                    <div className="col-span-1 xl:col-span-2 py-20 text-center text-text-secondary border border-dashed border-border rounded-xl">
                      <Users size={36} className="mx-auto mb-3 opacity-30" />
                      <p className="font-bold mb-1">No players found</p>
                      <p className="text-sm text-text-muted">Try adjusting your skill level or city filters.</p>
                    </div>
                  ) : (
                    filteredPlayers.slice(0, 12).map((p, i) => (
                      <PlayerCard key={p.id} player={p} isMatch={showResults && i < 3} />
                    ))
                  )}
                </div>
              )}

              {/* Requests Tab */}
              {activeTab === 'requests' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {receivedRequests.map(p => (
                    <PlayerCard
                      key={p.requestId}
                      player={p}
                      isRequest={true}
                      onAccept={() => handleAccept(p.requestId)}
                      onDecline={async () => {
                        try {
                          await playerService.cancelRequest(p.requestId);
                          setReceivedRequests(prev => prev.filter(r => r.requestId !== p.requestId));
                          toast.success('Request declined');
                        } catch { toast.error('Failed to decline'); }
                      }}
                    />
                  ))}
                  {receivedRequests.length === 0 && (
                    <div className="col-span-1 xl:col-span-2 py-20 text-center text-text-secondary border border-dashed border-border rounded-xl">
                      No pending requests.
                    </div>
                  )}
                </div>
              )}

              {/* Connected Tab */}
              {activeTab === 'connected' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {connectedPlayers.map(p => (
                    <PlayerCard key={p.id} player={p} isConnected={true} />
                  ))}
                  {connectedPlayers.length === 0 && (
                    <div className="col-span-1 xl:col-span-2 py-20 text-center text-text-secondary border border-dashed border-border rounded-xl">
                      No connected players yet. Accept a request to connect!
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <LogResultModal
        isOpen={showLogResult}
        onClose={() => setShowLogResult(false)}
        connectedPlayers={[...connectedPlayers, ...requests]}
      />
    </PageWrapper>
  );
};

export default Matches;
