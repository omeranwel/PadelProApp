import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Users, ShoppingBag, MessageSquare, ChevronRight, Star, MapPin, Calendar, Layout } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { mockCourts } from '../data/mockCourts';

const Home = () => {
  const navigate = useNavigate();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const features = [
    { title: 'Court Booking', icon: MapPin, color: 'text-accent-blue', tag: 'COURTS', desc: 'Real-time availability across all Karachi courts. Book in under 60 seconds.', path: '/courts' },
    { title: 'AI Matchmaking', icon: Users, color: 'text-ai-purple', tag: 'AI POWERED', desc: 'Our algorithm finds your perfect partner based on skill, schedule, and location.', path: '/matches' },
    { title: 'Marketplace', icon: ShoppingBag, color: 'text-accent-orange', tag: 'MARKETPLACE', desc: 'Buy and sell padel gear directly with Karachi players. New and pre-loved.', path: '/market' },
    { title: 'Community Hub', icon: MessageSquare, color: 'text-success', tag: 'COMMUNITY', desc: 'Forums, tips, tournament announcements, and a growing padel community.', path: '/community' },
  ];

  return (
    <PageWrapper>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,_#0F1B3C_0%,_#09090F_70%)]" />
        <div className="absolute inset-0 -z-10 opacity-10" style={{ backgroundImage: 'radial-gradient(#3B82F6 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-text-secondary font-bold text-xl md:text-2xl mb-4 font-display">Pakistan's #1</h2>
            <h1 className="text-5xl md:text-7xl font-bold font-display leading-[1.1] mb-8">
              <span className="bg-gradient-to-r from-accent-blue to-accent-orange bg-clip-text text-transparent">Padel Platform</span>
            </h1>
            <p className="text-text-secondary text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
              Book courts, find your perfect match partner, buy & sell gear — all in one place. Built for Karachi's growing padel community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="px-10" onClick={() => navigate('/courts')} icon={ChevronRight}>Find a Court</Button>
              <Button size="lg" variant="outline" className="px-10" onClick={() => navigate('/community')}>Join Community</Button>
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="hidden lg:block relative"
          >
             <div className="relative z-10 bg-bg-card/50 backdrop-blur-xl border border-border p-8 rounded-[2rem] shadow-2xl overflow-hidden group">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent-orange/20 blur-[100px] rounded-full group-hover:bg-accent-orange/30 transition-colors" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent-blue/20 blur-[100px] rounded-full" />
                
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-accent-orange font-bold text-xl">P1</div>
                    <div>
                      <h4 className="font-bold">Next Game</h4>
                      <p className="text-xs text-text-secondary">DHA Phase 6 • Tomorrow</p>
                    </div>
                  </div>
                  <Badge variant="orange">CONFIRMED</Badge>
                </div>
                
                <div className="space-y-4">
                  {/* Next Booking row */}
                  <div className="flex items-center gap-3 p-3 bg-bg-elevated/50 rounded-xl border border-border/50">
                    <div className="w-10 h-10 rounded-lg bg-accent-orange/20 flex items-center justify-center text-accent-orange font-bold text-sm shrink-0">PA</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">Padel Arena DHA</p>
                      <p className="text-[10px] text-text-muted">Tomorrow · 7:00 PM</p>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-success/20 text-success rounded-full shrink-0">CONFIRMED</span>
                  </div>
                  {/* Match row */}
                  <div className="flex items-center gap-3 p-3 bg-bg-elevated/50 rounded-xl border border-ai-purple/20">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-accent-blue/20 border-2 border-accent-blue flex items-center justify-center text-xs font-bold text-accent-blue">SC</div>
                      <span className="text-[10px] font-bold text-text-muted">VS</span>
                      <div className="w-9 h-9 rounded-full bg-ai-purple/20 border-2 border-ai-purple flex items-center justify-center text-xs font-bold text-ai-purple">AH</div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-ai-purple">87% Compatible</p>
                      <p className="text-[10px] text-text-muted">Wed 7PM · DHA Phase 6</p>
                    </div>
                  </div>
                  {/* Available courts row */}
                  <div className="flex items-center gap-2 p-3 bg-bg-elevated/50 rounded-xl border border-border/50">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      <div className="w-2 h-2 rounded-full bg-success animate-pulse" style={{animationDelay:'0.3s'}} />
                      <div className="w-2 h-2 rounded-full bg-success animate-pulse" style={{animationDelay:'0.6s'}} />
                    </div>
                    <p className="text-xs text-text-secondary">3 courts available near you right now</p>
                  </div>
                </div>
             </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-text-muted hidden md:block"
        >
          <div className="w-6 h-10 border-2 border-border rounded-full flex justify-center p-1">
            <div className="w-1.5 h-1.5 bg-accent-orange rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="bg-bg-card border-y border-border py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
           {[
             { label: 'Courts', val: '12', icon: '🏟' },
             { label: 'Players', val: '800+', icon: '👥' },
             { label: 'Bookings', val: '3,000+', icon: '📅' },
             { label: 'Listings', val: '450+', icon: '🛍' },
           ].map((stat, i) => (
             <div key={i} className={`flex flex-col items-center text-center ${i !== 3 ? 'md:border-r border-border' : ''}`}>
               <span className="text-2xl mb-2">{stat.icon}</span>
               <span className="text-3xl font-bold font-display text-text-primary mb-1">{stat.val}</span>
               <span className="text-sm font-semibold text-text-muted uppercase tracking-wider">{stat.label}</span>
             </div>
           ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="blue" className="mb-4">FEATURES</Badge>
          <h2 className="text-4xl md:text-5xl font-bold font-display">Engineered for the Game</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((f, i) => (
            <motion.div key={i} {...fadeIn}>
              <Card className="h-full hover:border-accent-blue/50 group transition-all duration-500">
                <div className={`p-4 rounded-2xl bg-bg-elevated w-fit mb-6 transition-transform duration-500 group-hover:scale-110 ${f.color}`}>
                  <f.icon size={32} />
                </div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold font-display">{f.title}</h3>
                  <Badge>{f.tag}</Badge>
                </div>
                <p className="text-text-secondary leading-relaxed mb-6">{f.desc}</p>
                <button onClick={() => navigate(f.path)} className="flex items-center text-accent-blue font-bold text-sm cursor-pointer group-hover:gap-2 transition-all">
                  Learn more <ChevronRight size={16} />
                </button>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-bg-card/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold font-display mb-4">Start Playing in 3 Minutes</h2>
            <p className="text-text-secondary max-w-md mx-auto">Seamlessly integrated tools to get you from the app to the court.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { n: '01', title: 'Create Your Profile', desc: 'Set your skill level, location, and availability in 2 minutes' },
              { n: '02', title: 'Find Your Game', desc: 'Browse courts or let our AI find the perfect match partner for you' },
              { n: '03', title: 'Play & Connect', desc: 'Book your slot, meet your partner, and grow with the community' },
            ].map((step, i) => (
              <div key={i} className="relative">
                <span className="text-7xl font-bold text-accent-blue/10 font-display absolute -top-10 -left-4">{step.n}</span>
                <h4 className="text-xl font-bold mb-4 relative z-10">{step.title}</h4>
                <p className="text-text-secondary leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nearby Courts Preview */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-bold font-display mb-4 font-display">Courts Near You</h2>
            <p className="text-text-secondary">Discover the best padel facilities in Karachi.</p>
          </div>
          <Link to="/courts" className="text-accent-blue font-bold flex items-center gap-1 hover:gap-2 transition-all">
            View All Courts <ChevronRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {mockCourts.slice(0, 3).map((court, i) => (
             <motion.div key={court.id} {...fadeIn} transition={{ delay: i * 0.1 }}>
                <Card className="p-0 overflow-hidden group border-border hover:border-accent-orange/50">
                   <div className="relative aspect-video overflow-hidden">
                      <img src={court.images[0]} alt={court.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute top-4 right-4">
                        <Badge variant="orange" className="backdrop-blur-md bg-accent-orange/80">RS {court.pricePerHour}/HR</Badge>
                      </div>
                   </div>
                   <div className="p-5">
                      <h4 className="text-xl font-bold mb-1">{court.name}</h4>
                      <p className="text-sm text-text-secondary mb-4 flex items-center gap-1">
                        <MapPin size={14} /> {court.area}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-1">
                          <Star size={16} className="text-warning fill-warning" />
                          <span className="font-bold">{court.rating}</span>
                          <span className="text-text-muted text-xs">({court.reviewCount})</span>
                        </div>
                        <Button size="sm" onClick={() => navigate(`/courts/${court.id}`)}>Book Now</Button>
                      </div>
                   </div>
                </Card>
             </motion.div>
           ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-bg-card border-y border-border overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
           <h2 className="text-4xl font-bold font-display text-center mb-16">Community Voices</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: 'Ali Hassan', skill: 'intermediate', text: '“The matchmaking is spooky accurate. Found a regular partner in 2 days and our skill levels are identical.”', stars: 5 },
                { name: 'Sarah Merchant', skill: 'advanced', text: '“Best way to book courts in Karachi. No more WhatsApp groups and manual coordination. Instant and seamless.”', stars: 5 },
                { name: 'Zubair Ahmed', skill: 'beginner', text: '“Started as a total newbie. The blog posts and community tips helped me pick my first racket and learn basic tactics.”', stars: 5 },
              ].map((t, i) => (
                <Card key={i} className="flex flex-col">
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(t.stars)].map((_, i) => <Star key={i} size={14} className="text-warning fill-warning" />)}
                  </div>
                  <p className="text-text-primary text-lg mb-8 italic leading-relaxed">{t.text}</p>
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center font-bold text-accent-blue">{t.name[0]}</div>
                    <div>
                      <h5 className="font-bold">{t.name}</h5>
                      <Badge variant={t.skill}>{t.skill}</Badge>
                    </div>
                  </div>
                </Card>
              ))}
           </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-32 px-6 overflow-hidden relative">
         <div className="absolute inset-0 -z-10 bg-accent-blue/10 blur-[150px] rounded-full scale-150" />
         <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl font-bold font-display mb-8">Ready to Take the Court?</h2>
            <p className="text-text-secondary text-xl mb-12">Join 800+ players already using PadelPro to transform their game.</p>
            <Button size="lg" className="px-12 py-6 text-xl" onClick={() => navigate('/courts')}>Discover Courts</Button>
         </div>
      </section>
    </PageWrapper>
  );
};

export default Home;
