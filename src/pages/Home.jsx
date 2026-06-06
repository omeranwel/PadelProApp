import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Users, ShoppingBag, MessageSquare, ChevronRight, Star, MapPin, Trophy, Zap, Activity } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { api } from '../services/api';

const CourtCard = ({ court }) => {
  const navigate = useNavigate();
  const img = court.images?.[0]?.url || court.images?.[0] || `https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&q=80`;
  return (
    <Card className="p-0 overflow-hidden group border-border hover:border-accent/30 transition-all duration-500">
      <div className="relative aspect-video overflow-hidden">
        <img src={img} alt={court.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-base/80 via-transparent to-transparent" />
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-accent text-bg-base">Rs {court.pricePerHour?.toLocaleString()}/HR</span>
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-1">
          <Star size={12} className="text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-bold text-white">{court.averageRating?.toFixed(1) || court.rating || '4.8'}</span>
          <span className="text-xs text-white/60">({court.totalReviews || court.reviewCount || 0})</span>
        </div>
      </div>
      <div className="p-5">
        <h4 className="text-xl font-display mb-1 group-hover:text-accent transition-colors">{court.name}</h4>
        <p className="text-sm text-text-secondary mb-4 flex items-center gap-1"><MapPin size={13} />{court.area || court.address}</p>
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex flex-wrap gap-1.5">
            {(court.amenities || []).slice(0, 2).map((a, i) => (
              <span key={i} className="px-2 py-0.5 bg-bg-elevated border border-border rounded-full text-[10px] font-bold text-text-muted">{a}</span>
            ))}
          </div>
          <Button size="sm" onClick={() => navigate(`/courts/${court.id}`)}>Book Now</Button>
        </div>
      </div>
    </Card>
  );
};

const features = [
  { title: 'Court Booking', icon: MapPin, color: 'text-accent-blue', bg: 'bg-accent-blue/10 border-accent-blue/20', tag: 'REAL-TIME', desc: 'Live availability across all Karachi courts. Book in under 60 seconds.', path: '/courts' },
  { title: 'AI Matchmaking', icon: Users, color: 'text-ai-purple', bg: 'bg-ai-purple/10 border-ai-purple/20', tag: 'AI POWERED', desc: 'Weighted compatibility scoring finds your perfect partner by skill, schedule, and style.', path: '/matches' },
  { title: 'Ladder & Rankings', icon: Trophy, color: 'text-accent', bg: 'bg-accent/10 border-accent/20', tag: 'ELO RATED', desc: "Real-time leaderboard powered by ELO algorithm. Every match updates your rating.", path: '/leaderboard' },
  { title: 'Marketplace', icon: ShoppingBag, color: 'text-accent-orange', bg: 'bg-accent-orange/10 border-accent-orange/20', tag: 'P2P MARKET', desc: 'Buy and sell padel gear directly with Karachi players in PKR.', path: '/market' },
];

const stats = [
  { label: 'Courts', val: '8', icon: '🏟' },
  { label: 'Active Players', val: '800+', icon: '👥' },
  { label: 'Matches Logged', val: '1,200+', icon: '⚡' },
  { label: 'Karachi Areas', val: '6', icon: '📍' },
];

const Home = () => {
  const navigate = useNavigate();
  const [courts, setCourts] = useState([]);

  useEffect(() => {
    api.get('/courts?limit=3')
      .then(d => setCourts(Array.isArray(d) ? d.slice(0, 3) : (d?.data || d?.courts || []).slice(0, 3)))
      .catch(() => setCourts([]));
  }, []);

  const fadeIn = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

  return (
    <PageWrapper>
      {/* HERO */}
      <section
        className="relative min-h-screen flex items-center pt-24 pb-16 px-6 overflow-hidden"
        style={{
          backgroundImage: 'url(/hero-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-bg-base/70 via-bg-base/50 to-bg-base pointer-events-none" />
        <div className="absolute inset-0 bg-bg-base/30 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full relative z-10">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Pakistan's #1 Padel Platform</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-display leading-[0.9] mb-8">
              PLAY<br />
              <span className="text-accent">KARACHI</span><br />
              PADEL
            </h1>
            <p className="text-text-secondary text-lg md:text-xl max-w-lg mb-10 leading-relaxed font-body">
              Book courts, find your perfect match partner, compete in tournaments, and track your ELO rating — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" onClick={() => navigate('/courts')} icon={ChevronRight}>Find a Court</Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/leaderboard')} icon={Trophy}>View Leaderboard</Button>
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block">
            <div className="relative bg-bg-card/50 backdrop-blur-xl border border-border p-6 rounded-3xl shadow-2xl overflow-hidden">
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
              {/* Live match card */}
              <div className="mb-4 p-4 rounded-2xl bg-bg-elevated border border-accent/20 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-accent/10 border-2 border-accent flex items-center justify-center font-display text-accent font-bold">AH</div>
                  <div className="text-center px-1">
                    <div className="text-xs text-text-muted font-bold">92%</div>
                    <div className="text-[10px] text-accent font-bold">MATCH</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-accent-blue/10 border-2 border-accent-blue flex items-center justify-center font-display text-accent-blue font-bold">FZ</div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold">AI Match Found!</p>
                  <p className="text-xs text-text-muted font-body">Gulshan Arena · Tomorrow 7pm</p>
                </div>
                <Zap size={16} className="text-accent shrink-0" />
              </div>
              {/* Skill rating card */}
              <div className="mb-4 p-4 rounded-2xl bg-bg-elevated border border-border flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center"><Activity size={18} className="text-accent" /></div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold font-body">Skill Rating</span>
                    <span className="text-xs font-mono font-bold text-accent">4.2 → 4.4</span>
                  </div>
                  <div className="h-1.5 bg-bg-card rounded-full overflow-hidden">
                    <motion.div initial={{ width: '60%' }} animate={{ width: '63%' }} transition={{ delay: 1, duration: 1 }} className="h-full bg-accent rounded-full" />
                  </div>
                </div>
              </div>
              {/* Court available */}
              <div className="p-4 rounded-2xl bg-bg-elevated border border-border flex items-center gap-3">
                <div className="flex gap-1">
                  {[0,1,2].map(i=><div key={i} className="w-2 h-2 rounded-full bg-accent animate-pulse" style={{animationDelay:`${i*0.3}s`}}/>)}
                </div>
                <p className="text-xs text-text-secondary font-body">3 courts available near you right now</p>
                <button onClick={()=>navigate('/courts')} className="ml-auto text-xs font-bold text-accent hover:underline">Book →</button>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div animate={{ y: [0,10,0] }} transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-text-muted hidden md:block">
          <div className="w-5 h-9 border-2 border-border rounded-full flex justify-center p-1">
            <div className="w-1 h-1 bg-accent rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* STATS BAR */}
      <section className="bg-bg-card border-y border-border py-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={i} className={`flex flex-col items-center text-center py-2 ${i !== stats.length-1 ? 'md:border-r border-border' : ''}`}>
              <span className="text-2xl mb-2">{s.icon}</span>
              <span className="text-4xl font-display text-text-primary mb-1">{s.val}</span>
              <span className="text-xs font-bold text-text-muted uppercase tracking-widest">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <motion.div {...fadeIn} className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-accent mb-3 block">Platform Features</span>
          <h2 className="text-5xl md:text-7xl font-display">BUILT FOR<br />THE GAME</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.1 }}>
              <Card className="h-full hover:border-accent/30 group transition-all duration-500 flex flex-col">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border ${f.bg} ${f.color} group-hover:scale-110 transition-transform`}>
                  <f.icon size={22} />
                </div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-2xl font-display">{f.title}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-bg-elevated border border-border text-text-muted shrink-0">{f.tag}</span>
                </div>
                <p className="text-text-secondary leading-relaxed mb-6 flex-1 font-body">{f.desc}</p>
                <button onClick={() => navigate(f.path)} className={`flex items-center font-bold text-sm group-hover:gap-2 transition-all ${f.color}`}>
                  Explore <ChevronRight size={14} />
                </button>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-bg-card/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeIn} className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-display">PLAY IN<br />3 STEPS</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { n: '01', title: 'Create Profile', desc: 'Set your skill level, preferred areas, availability, and playing style. Takes under 2 minutes.' },
              { n: '02', title: 'Find Your Game', desc: 'Browse Karachi courts by area and time, or let our AI match you with a compatible partner.' },
              { n: '03', title: 'Play & Rank Up', desc: 'Log match results, track your ELO rating, compete in tournaments, and climb the leaderboard.' },
            ].map((step, i) => (
              <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.15 }} className="relative">
                <span className="text-8xl font-display text-accent/10 absolute -top-12 -left-4">{step.n}</span>
                <h4 className="text-2xl font-display mb-3 relative">{step.title.toUpperCase()}</h4>
                <p className="text-text-secondary leading-relaxed font-body">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* COURTS */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-accent-blue mb-2 block">Karachi Courts</span>
            <h2 className="text-5xl font-display">TOP COURTS</h2>
          </div>
          <Link to="/courts" className="text-accent-blue font-bold flex items-center gap-1 hover:gap-2 transition-all text-sm">
            All Courts <ChevronRight size={16} />
          </Link>
        </div>
        {courts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courts.map((court, i) => (
              <motion.div key={court.id} {...fadeIn} transition={{ delay: i * 0.1 }}>
                <CourtCard court={court} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="rounded-3xl border border-border overflow-hidden">
                <div className="aspect-video bg-bg-elevated animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-bg-elevated rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-bg-elevated rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-5xl font-display">COMMUNITY VOICES</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Ali Hassan', skill: 'intermediate', text: '"The AI matchmaking is incredibly accurate. Found a regular partner in 2 days and our skill levels are perfectly matched."', stars: 5 },
              { name: 'Sarah Merchant', skill: 'advanced', text: '"Best way to book courts in Karachi. No more WhatsApp groups. The leaderboard keeps me motivated to improve."', stars: 5 },
              { name: 'Zubair Ahmed', skill: 'beginner', text: '"Started as a total newbie. The community posts and match logging helped me track my progress from day one."', stars: 5 },
            ].map((t, i) => (
              <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.1 }}>
                <Card className="flex flex-col h-full">
                  <div className="flex items-center gap-1 mb-5">
                    {[...Array(t.stars)].map((_, j) => <Star key={j} size={13} className="text-yellow-400 fill-yellow-400" />)}
                  </div>
                  <p className="text-text-primary text-lg mb-8 italic leading-relaxed flex-1 font-body">{t.text}</p>
                  <div className="flex items-center gap-3 mt-auto">
                    <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center font-display font-bold text-accent">{t.name[0]}</div>
                    <div>
                      <h5 className="font-bold">{t.name}</h5>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold border ${t.skill==='advanced'?'badge-advanced':t.skill==='intermediate'?'badge-intermediate':'badge-beginner'}`}>{t.skill.toUpperCase()}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-32 px-6 relative overflow-hidden"
        style={{
          backgroundImage: 'url(/hero-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/60 to-bg-base/80 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent/10 rounded-full blur-[120px]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-accent mb-4 block">Ready to Play?</span>
          <h2 className="text-6xl md:text-9xl font-display mb-8">TAKE<br />THE COURT</h2>
          <p className="text-text-secondary text-xl mb-12 font-body">Join 800+ Karachi players already using PadelPro to transform their game.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/courts')} icon={ChevronRight}>Discover Courts</Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/matches')}>Find a Partner</Button>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
};

export default Home;
