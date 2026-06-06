import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Calendar, MapPin, Users, Zap, ChevronRight, Clock, Star, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import toast from 'react-hot-toast';

const STATUS_MAP = {
  upcoming: { label:'Upcoming', color:'text-accent-blue', bg:'bg-accent-blue/10 border-accent-blue/20' },
  registration_open: { label:'Registration Open', color:'text-accent', bg:'bg-accent/10 border-accent/20' },
  in_progress: { label:'In Progress', color:'text-accent-orange', bg:'bg-accent-orange/10 border-accent-orange/20' },
  completed: { label:'Completed', color:'text-text-muted', bg:'bg-bg-elevated border-border' },
};

const FORMAT_LABELS = {
  knockout: 'Single Elimination',
  round_robin: 'Round Robin',
  group_knockout: 'Group + Knockout',
};

const TournamentCard = ({ t, onRegister }) => {
  const status = STATUS_MAP[t.status] || STATUS_MAP.upcoming;
  const registrationClosed = new Date() > new Date(t.registrationDeadline);
  const isFull = t.participants?.length >= t.maxParticipants;
  const spotsLeft = t.maxParticipants - (t.participants?.length || 0);

  return (
    <Card className="p-0 overflow-hidden hover:border-border-strong transition-all group flex flex-col">
      <div className="h-2 w-full" style={{ background: t.status==='registration_open' ? 'linear-gradient(90deg,#00E676,#00B248)' : 'linear-gradient(90deg,#3B82F6,#2563EB)' }} />
      <div className="p-6 flex flex-col gap-4 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${status.bg} ${status.color} mb-2`}>
              <span className={`w-1.5 h-1.5 rounded-full ${t.status==='in_progress'?'bg-accent-orange animate-pulse':t.status==='registration_open'?'bg-accent animate-pulse':'bg-current'}`} />
              {status.label}
            </span>
            <h3 className="text-xl font-display font-bold group-hover:text-accent transition-colors leading-tight">{t.name}</h3>
          </div>
          {t.prizePool > 0 && (
            <div className="text-right shrink-0">
              <p className="text-xs text-text-muted">Prize Pool</p>
              <p className="font-bold text-accent text-lg font-mono">Rs {t.prizePool?.toLocaleString()}</p>
            </div>
          )}
        </div>

        <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">{t.description}</p>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-text-secondary">
            <Calendar size={14} className="text-text-muted" />
            <span>{new Date(t.startDate).toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})}</span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary">
            <MapPin size={14} className="text-text-muted" />
            <span>{t.court?.name || t.city}</span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary">
            <Users size={14} className="text-text-muted" />
            <span><span className={isFull?'text-danger font-bold':spotsLeft<=4?'text-warning font-bold':''}>{t.participants?.length || 0}/{t.maxParticipants}</span> players</span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary">
            <Trophy size={14} className="text-text-muted" />
            <span>{FORMAT_LABELS[t.format] || t.format}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
            t.skillLevel==='open' ? 'bg-ai-purple/10 text-ai-purple border-ai-purple/20'
            : t.skillLevel==='beginner' ? 'badge-beginner'
            : t.skillLevel==='intermediate' ? 'badge-intermediate'
            : t.skillLevel==='advanced' ? 'badge-advanced'
            : 'badge-professional'
          }`}>{t.skillLevel==='open'?'Open Level':t.skillLevel?.charAt(0).toUpperCase()+t.skillLevel?.slice(1)}</span>
          {t.entryFee > 0 && <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-bg-elevated border border-border text-text-secondary">Rs {t.entryFee?.toLocaleString()} entry</span>}
          {t.entryFee === 0 && <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-accent/10 border border-accent/20 text-accent">Free Entry</span>}
        </div>

        {t.registrationDeadline && (
          <div className="flex items-center gap-2 text-xs text-text-muted border-t border-border pt-3">
            <Clock size={12} />
            {registrationClosed ? 'Registration closed' : `Register by ${new Date(t.registrationDeadline).toLocaleDateString('en-PK',{day:'numeric',month:'short'})}`}
          </div>
        )}

        <div className="mt-auto pt-2">
          {t.status==='registration_open' && !registrationClosed && !isFull ? (
            <Button className="w-full" onClick={()=>onRegister(t)} icon={Zap}>
              Register — Rs {t.entryFee>0?t.entryFee?.toLocaleString():'Free'}
            </Button>
          ) : isFull ? (
            <Button className="w-full" variant="outline" disabled>Tournament Full</Button>
          ) : registrationClosed || t.status!=='registration_open' ? (
            <Button className="w-full" variant="outline" disabled icon={Lock}>Registration Closed</Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
};

const Tournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { isLoggedIn } = useAuthStore();
  const { openAuthModal } = useAppStore();

  const fetchTournaments = () => {
    setLoading(true);
    api.get('/tournaments')
      .then(d => setTournaments(Array.isArray(d)?d:d.data||[]))
      .catch(()=>setTournaments([]))
      .finally(()=>setLoading(false));
  };

  useEffect(()=>{ fetchTournaments(); },[]);

  const handleRegister = async (t) => {
    if (!isLoggedIn) { openAuthModal('signin'); return; }
    try {
      await api.post(`/tournaments/${t.id}/register`, {});
      toast.success(`Registered for ${t.name}!`);
      fetchTournaments();
    } catch(e) {
      toast.error(e.message || 'Registration failed');
    }
  };

  const filtered = filter==='all' ? tournaments : tournaments.filter(t=>t.status===filter);

  return (
    <PageWrapper bg="/bg-night.png">
      <section className="relative py-16 px-6 overflow-hidden border-b border-border">
        <div className="absolute inset-0 court-bg opacity-40" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent-orange/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-accent-orange/10 border border-accent-orange/20 flex items-center justify-center">
              <Trophy size={20} className="text-accent-orange" />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-accent-orange">Karachi Padel</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-display text-text-primary mb-4">TOURNAMENTS</h1>
          <p className="text-text-secondary text-lg max-w-2xl">
            Compete in Karachi's premier padel tournaments. From beginner-friendly events to elite championships — find your level, register, and play.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12">
        {/* Status Tabs */}
        <div className="flex gap-2 mb-10 flex-wrap">
          {[['all','All Tournaments'],['registration_open','Registration Open'],['upcoming','Upcoming'],['in_progress','In Progress'],['completed','Completed']].map(([key,label])=>(
            <button key={key} onClick={()=>setFilter(key)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all backdrop-blur-md ${filter===key?'bg-accent text-bg-base border-accent':'bg-bg-card/80 border-white/5 text-text-muted hover:text-text-primary hover:border-accent/30'}`}>
              {label}
              {key!=='all' && <span className="ml-2 text-xs opacity-70">({tournaments.filter(t=>t.status===key).length})</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center border border-white/5 rounded-3xl bg-bg-card/60 backdrop-blur-md shadow-xl">
            <Trophy size={40} className="text-text-muted mx-auto mb-4 opacity-50" />
            <p className="text-text-secondary text-lg">No tournaments found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((t,i) => (
              <motion.div key={t.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}>
                <TournamentCard t={t} onRegister={handleRegister} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Info Panel */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Star, title: 'Skill Rating Impact', desc: 'Every tournament match updates your skill rating. Win big to climb the leaderboard.', color: 'text-accent' },
            { icon: Users, title: 'Team Registration', desc: 'Register as a singles player or doubles team. Find a partner in the Matchmaking section.', color: 'text-accent-blue' },
            { icon: Trophy, title: 'Prize Pools', desc: 'Top tournaments offer cash prizes and sponsor merchandise. Entry fees fund the prize pool.', color: 'text-accent-orange' },
          ].map(({icon:Icon,title,desc,color},i)=>(
            <Card key={i} className="p-6">
              <div className={`w-10 h-10 rounded-xl bg-bg-elevated border border-border flex items-center justify-center mb-4 ${color}`}><Icon size={20}/></div>
              <h4 className="font-bold font-display text-lg mb-2">{title}</h4>
              <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </PageWrapper>
  );
};

export default Tournaments;
