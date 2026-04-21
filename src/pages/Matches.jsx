import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Search, SlidersHorizontal, Users, ShieldCheck, MapIcon, ChevronRight, UserCheck, Send } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import PlayerCard from '../components/features/PlayerCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Avatar from '../components/ui/Avatar';
import { mockPlayers } from '../data/mockPlayers';

const Matches = () => {
  const navigate = useNavigate();
  const [isAiMatching, setIsAiMatching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const [skillFilter, setSkillFilter] = useState([]);
  const [maxDistance, setMaxDistance] = useState(50);
  const [activeTab, setActiveTab] = useState('active');
  const [receivedRequests, setReceivedRequests] = useState([mockPlayers[3], mockPlayers[5]]);
  const [connectedPlayers, setConnectedPlayers] = useState([]);
  
  const [chatPlayer, setChatPlayer] = useState(null);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);

  const toggleSkill = (skill) => {
    setSkillFilter(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  const startMatching = () => {
    setIsAiMatching(true);
    setTimeout(() => {
      setIsAiMatching(false);
      setShowResults(true);
    }, 2500);
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    setChatMessages(prev => [...prev, { text: message, sender: 'me' }]);
    setMessage('');
    setTimeout(() => {
      setChatMessages(prev => [...prev, { text: "Hi! I saw your profile. Want to book a court together?", sender: 'them' }]);
    }, 800);
  };

  const filteredPlayers = useMemo(() => {
    return mockPlayers.filter(p => {
      if (skillFilter.length > 0 && !skillFilter.includes(p.skillLevel.toLowerCase())) return false;
      const dist = Number(p.distance);
      if (dist > maxDistance) return false;
      return true;
    });
  }, [skillFilter, maxDistance]);

  return (
    <PageWrapper>
      {/* Matchmaking Hero */}
      <section className="bg-[radial-gradient(circle_at_20%_0%,_#1E1030_0%,_#09090F_100%)] border-b border-border py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
           <div className="flex-1">
              <Badge variant="ai" className="mb-4 py-1.5 px-4 text-xs">AI SMART MATCHING</Badge>
              <h1 className="text-5xl font-bold font-display mb-6 leading-tight">Finding Your Perfect <span className="text-ai-purple underline decoration-ai-purple/30 underline-offset-8">Padel Partner</span></h1>
              <p className="text-text-secondary text-xl mb-10 max-w-xl">Our intelligent algorithm pairs you based on skill level, location, play-style, and schedule. No more unbalanced games.</p>
              
              {!showResults && !isAiMatching && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="px-10 !bg-ai-purple shadow-xl shadow-ai-purple/20" icon={Zap} onClick={startMatching}>Run AI Matchmaker</Button>
                  <Button size="lg" variant="outline" className="px-10" icon={Users} onClick={() => { const el = document.getElementById('player-results'); el?.scrollIntoView({ behavior: 'smooth' }); }}>Browse Players</Button>
                </div>
              )}
           </div>
           
           <div className="flex-1 relative hidden lg:flex justify-center">
              <div className="relative w-80 h-80">
                 <motion.div 
                  animate={isAiMatching ? { rotate: 360 } : { rotate: 0 }} 
                  transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
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
                    animate={isAiMatching ? { 
                      x: [Math.cos(i) * 140, Math.cos(i) * 100, Math.cos(i) * 140],
                      y: [Math.sin(i) * 140, Math.sin(i) * 100, Math.sin(i) * 140],
                    } : {
                      x: Math.cos(i) * 140,
                      y: Math.sin(i) * 140
                    }}
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

      <AnimatePresence>
        {isAiMatching && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="px-6 max-w-3xl mx-auto py-24 text-center"
          >
             <div className="space-y-12">
                <div className="relative h-2 bg-bg-elevated rounded-full overflow-hidden">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.5 }}
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

      {(showResults || !isAiMatching) && (
        <section className="px-6 max-w-7xl mx-auto py-12" id="player-results">
          {showResults && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-12 p-8 bg-ai-purple/5 border border-ai-purple/20 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-ai-purple text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-ai-purple/20">
                    <UserCheck size={32} />
                 </div>
                 <div>
                   <h3 className="text-2xl font-bold font-display">Optimization Complete</h3>
                   <p className="text-text-secondary">Found High-Accuracy Matches for your upcoming weekend slots.</p>
                 </div>
               </div>
               <Button variant="outline" className="border-ai-purple text-ai-purple hover:bg-ai-purple/10" onClick={() => setShowResults(false)}>Reset Search</Button>
            </motion.div>
          )}

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="w-full md:w-72 space-y-8">
               <div className="space-y-4">
                  <h4 className="font-bold text-sm uppercase tracking-widest text-text-muted">Skill Level</h4>
                  <div className="space-y-2">
                    {['Beginner', 'Intermediate', 'Advanced', 'Professional'].map(l => (
                      <label key={l} className="flex items-center gap-3 cursor-pointer group">
                         <input type="checkbox" className="hidden" onChange={() => toggleSkill(l.toLowerCase())} checked={skillFilter.includes(l.toLowerCase())} />
                         <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${skillFilter.includes(l.toLowerCase()) ? 'border-accent-blue bg-accent-blue/10' : 'border-border group-hover:border-accent-blue'}`}>
                            {skillFilter.includes(l.toLowerCase()) && <div className="w-2.5 h-2.5 bg-accent-blue rounded-sm" />}
                         </div>
                         <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary">{l}</span>
                      </label>
                    ))}
                  </div>
               </div>

               <div className="space-y-4">
                  <h4 className="font-bold text-sm uppercase tracking-widest text-text-muted">Max Distance</h4>
                  <div className="space-y-4">
                    <input type="range" className="w-full accent-accent-blue" min={1} max={50} value={maxDistance} onChange={(e) => setMaxDistance(Number(e.target.value))} />
                    <div className="flex justify-between text-[10px] font-bold text-text-muted items-center">
                       <span className="text-sm text-text-primary">{maxDistance} KM</span>
                       <button onClick={() => setMaxDistance(10)} className="text-accent-blue hover:underline">Nearby</button>
                    </div>
                  </div>
               </div>
               
               <Card className="p-6 border-dashed border-border-strong bg-transparent text-center">
                  <p className="text-xs text-text-muted mb-4 italic">"I usually play in Clifton and DHA area. Looking for morning games."</p>
                  <Button variant="ghost" size="sm" className="w-full underline" onClick={() => navigate('/profile')}>Update Bio</Button>
               </Card>
            </aside>

            {/* Main Player Grid */}
            <div className="flex-1 space-y-6">
               <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                  <h3 className="text-xl font-bold font-display uppercase tracking-tight hidden sm:block">Players</h3>
                  <div className="flex bg-bg-elevated p-1 rounded-lg border border-border">
                     <button onClick={() => setActiveTab('active')} className={`px-4 py-2 text-xs font-bold rounded-md transition-colors ${activeTab === 'active' ? 'bg-bg-card text-accent-blue shadow-sm' : 'text-text-muted hover:text-text-primary'}`}>Active ({filteredPlayers.length})</button>
                     <button onClick={() => setActiveTab('requests')} className={`px-4 py-2 text-xs font-bold rounded-md transition-colors ${activeTab === 'requests' ? 'bg-bg-card text-accent-blue shadow-sm' : 'text-text-muted hover:text-text-primary'}`}>Requests {receivedRequests.length > 0 && <span className="ml-1 bg-accent-orange text-white px-1.5 rounded-full">{receivedRequests.length}</span>}</button>
                     <button onClick={() => setActiveTab('connected')} className={`px-4 py-2 text-xs font-bold rounded-md transition-colors ${activeTab === 'connected' ? 'bg-bg-card text-accent-blue shadow-sm' : 'text-text-muted hover:text-text-primary'}`}>Connected ({connectedPlayers.length})</button>
                  </div>
               </div>

               {activeTab === 'active' && (
                 <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                   {showResults && filteredPlayers.slice(0, 2).map((p) => (
                      <PlayerCard key={p.id} player={p} isMatch={true} onChat={setChatPlayer} />
                   ))}
                   {filteredPlayers.slice(showResults ? 2 : 0, 10).map((p) => (
                      <PlayerCard key={p.id} player={p} onChat={setChatPlayer} />
                   ))}
                 </div>
               )}

               {activeTab === 'requests' && (
                 <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                   {receivedRequests.map((p) => (
                      <PlayerCard 
                        key={p.id} 
                        player={p} 
                        isRequest={true}
                        onAccept={() => {
                          setReceivedRequests(prev => prev.filter(r => r.id !== p.id));
                          setConnectedPlayers(prev => [...prev, p]);
                        }}
                        onDecline={() => setReceivedRequests(prev => prev.filter(r => r.id !== p.id))}
                      />
                   ))}
                   {receivedRequests.length === 0 && (
                     <div className="col-span-1 xl:col-span-2 py-20 text-center text-text-secondary border border-dashed border-border rounded-xl">No pending requests.</div>
                   )}
                 </div>
               )}

               {activeTab === 'connected' && (
                 <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                   {connectedPlayers.map((p) => (
                      <PlayerCard key={p.id} player={p} isConnected={true} onChat={setChatPlayer} />
                   ))}
                   {connectedPlayers.length === 0 && (
                     <div className="col-span-1 xl:col-span-2 py-20 text-center text-text-secondary border border-dashed border-border rounded-xl">No connected players yet. ACCEPT a request to connect!</div>
                   )}
                 </div>
               )}
            </div>
          </div>
        </section>
      )}

      {/* Chat Modal */}
      <Modal isOpen={!!chatPlayer} onClose={() => {setChatPlayer(null); setChatMessages([])}} title="Message Player" className="max-w-md">
        {chatPlayer && (
          <div className="flex flex-col h-[60vh] max-h-[500px]">
             <div className="flex items-center gap-3 p-4 border-b border-border bg-bg-card -mt-4 -mx-6 mb-4">
               <Avatar name={chatPlayer.name} size="md" />
               <div>
                  <h4 className="font-bold flex items-center gap-2">{chatPlayer.name} <span className="w-2 h-2 rounded-full bg-success animate-pulse" /></h4>
                  <Badge variant={chatPlayer.skillLevel} className="text-[10px] py-0.5">{chatPlayer.skillLevel.toUpperCase()}</Badge>
               </div>
             </div>
             <div className="flex-1 overflow-y-auto pr-2 space-y-4 flex flex-col no-scrollbar pb-4">
                <div className="flex w-max max-w-[85%] flex-col p-3 rounded-2xl rounded-tl-sm bg-bg-elevated border border-border text-sm text-text-primary">
                  Hey! I saw your profile and it looks like we play at the same level. Want to book a court?
                </div>
                <div className="flex w-max max-w-[85%] flex-col p-3 rounded-2xl rounded-tr-sm bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-sm self-end">
                  Sounds great! I'm usually free on weekends, do you prefer morning or evening slots?
                </div>
                <div className="flex w-max max-w-[85%] flex-col p-3 rounded-2xl rounded-tl-sm bg-bg-elevated border border-border text-sm text-text-primary">
                  Mornings work best for me. Are you open for Saturday 9 AM?
                </div>
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex w-max max-w-[85%] flex-col p-3 rounded-2xl text-sm ${msg.sender === 'me' ? 'rounded-tr-sm bg-accent-blue/10 border border-accent-blue/20 text-accent-blue self-end' : 'rounded-tl-sm bg-bg-elevated border border-border text-text-primary'}`}>
                    {msg.text}
                  </div>
                ))}
             </div>
             <div className="pt-4 mt-auto border-t border-border flex gap-2">
               <Input 
                 placeholder="Type a message..." 
                 className="!mb-0 flex-1" 
                 value={message} 
                 onChange={(e) => setMessage(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
               />
               <Button onClick={sendMessage} className="px-4" icon={Send} />
             </div>
          </div>
        )}
      </Modal>
    </PageWrapper>
  );
};

export default Matches;
