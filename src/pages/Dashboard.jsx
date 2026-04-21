import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, Calendar, Users, ShoppingBag, 
  TrendingUp, TrendingDown, Clock, ChevronRight,
  Zap, Star, MapPin, Search, Plus
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import Modal from '../components/ui/Modal';
import { useAuthStore } from '../store/authStore';
import { mockBookings } from '../data/mockBookings';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const displayName = user?.name || "Player";
  
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteBooking, setInviteBooking] = useState(null);

  const handleInvite = (booking) => {
    setInviteBooking(booking);
    setInviteModalOpen(true);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://padelpro.pk/courts/${inviteBooking?.courtId}?ref=invite`);
    toast.success('Link copied!');
  };

  const stats = [
    { label: 'Weekly Streak', val: '4 Days', icon: Zap, color: 'text-accent-orange' },
    { label: 'Skill Level', val: 'Intermediate', icon: Trophy, color: 'text-ai-purple' },
    { label: 'Matches Won', val: '18', icon: Star, color: 'text-success' },
    { label: 'Hours Played', val: '42h', icon: Clock, color: 'text-accent-blue' },
  ];

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-6 pb-24">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
           <div>
              <h1 className="text-4xl font-bold font-display mb-2">Welcome back, {displayName.split(' ')[0]} 👋</h1>
              <p className="text-text-secondary">Ready for another game in Karachi?</p>
           </div>
           <div className="flex gap-4">
              <Button onClick={() => navigate('/courts')} icon={Plus}>New Booking</Button>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
           {stats.map((stat, i) => (
             <Card key={i} className="flex flex-col items-center text-center p-6 bg-gradient-to-br from-bg-card to-bg-elevated">
                <div className={`w-12 h-12 rounded-xl bg-bg-subtle flex items-center justify-center mb-4 ${stat.color}`}>
                   <stat.icon size={24} />
                </div>
                <span className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">{stat.label}</span>
                <span className="text-xl font-bold font-display">{stat.val}</span>
             </Card>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           {/* Main Column */}
           <div className="lg:col-span-8 space-y-12">
              {/* Upcoming Games */}
              <section>
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold font-display flex items-center gap-3">
                      <Calendar className="text-accent-blue" /> Upcoming Games
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/bookings')}>View All</Button>
                 </div>
                 
                 <div className="space-y-4">
                    {mockBookings.filter(b => b.status === 'upcoming').map((booking, i) => (
                      <Card key={booking.id} className="p-0 overflow-hidden border-l-4 border-l-accent-blue hover:translate-x-1 transition-all duration-300">
                         <div className="p-6 flex flex-col md:flex-row items-center gap-6">
                            <div className="bg-bg-elevated p-4 rounded-2xl text-center min-w-[100px]">
                               <p className="text-[10px] font-bold text-accent-blue uppercase mb-1">APRIL</p>
                               <p className="text-3xl font-bold font-display leading-none">{booking.date.split('-')[2]}</p>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                               <h4 className="text-xl font-bold mb-1">{booking.courtName}</h4>
                               <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-text-secondary">
                                  <span className="flex items-center gap-1.5"><Clock size={14} /> {booking.time} ({booking.duration}h)</span>
                                  <span className="flex items-center gap-1.5"><MapPin size={14} /> Karachi</span>
                                  {booking.isMatch && <Badge variant="blue">PUBLIC MATCH</Badge>}
                               </div>
                            </div>
                            <div className="flex gap-2">
                               <Button variant="outline" size="sm" onClick={() => handleInvite(booking)}>Invite Friends</Button>
                               <Button size="sm" onClick={() => navigate(`/courts/${booking.courtId}`)}>Details</Button>
                            </div>
                         </div>
                      </Card>
                    ))}
                    {mockBookings.filter(b => b.status === 'upcoming').length === 0 && (
                      <div className="py-12 border-2 border-dashed border-border rounded-3xl text-center">
                         <p className="text-text-muted text-sm mb-4 italic">No games scheduled yet.</p>
                         <Button variant="outline" size="sm" onClick={() => navigate('/courts')}>Find a Court</Button>
                      </div>
                    )}
                 </div>
              </section>

              {/* AI Skill Drift / Analysis */}
              <section>
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold font-display flex items-center gap-3">
                      <Zap className="text-ai-purple" /> AI Performance Hub
                    </h3>
                 </div>
                 <Card className="bg-gradient-to-br from-bg-card to-bg-elevated/50 p-8 space-y-8">
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                       <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                          <svg className="w-full h-full -rotate-90">
                             <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-border" />
                             <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={364} strokeDashoffset={364 * 0.25} className="text-ai-purple transition-all duration-1000" />
                          </svg>
                          <div className="absolute flex flex-col items-center">
                             <span className="text-3xl font-bold">75%</span>
                             <span className="text-[10px] uppercase font-bold text-text-muted">Rank</span>
                          </div>
                       </div>
                       <div className="space-y-4 flex-1">
                          <h4 className="text-lg font-bold">You're hitting your peak! 🚀</h4>
                          <p className="text-text-secondary text-sm leading-relaxed">Based on your last 5 matches, your net-game accuracy has improved by <span className="text-success font-bold">12%</span>. However, your back-glass defense needs work.</p>
                          <div className="flex gap-3">
                             <Badge variant="blue" className="!bg-success/10 !text-success border-success/20">+ Volley Acc.</Badge>
                             <Badge variant="blue" className="!bg-danger/10 !text-danger border-danger/20">- Glass Ref.</Badge>
                          </div>
                       </div>
                    </div>
                 </Card>
              </section>
           </div>

           {/* Side Column */}
           <div className="lg:col-span-4 space-y-12">
              {/* Profile Card Mini */}
              <Card className="p-8 text-center bg-bg-elevated">
                 <Avatar name={displayName} size="xl" className="mx-auto mb-6 border-4 border-border ring-4 ring-accent-blue/10" />
                 <h4 className="text-xl font-bold mb-1">{displayName}</h4>
                 <Badge variant="intermediate" className="mb-6">INTERMEDIATE • RANK #412</Badge>
                 <div className="h-px bg-border mb-6" />
                 <Button variant="ghost" className="w-full text-xs font-bold uppercase tracking-widest text-text-muted hover:text-text-primary" onClick={() => navigate('/profile')}>Edit My Profile <ChevronRight size={14} /></Button>
              </Card>

              {/* Alerts / Activity */}
              <section className="space-y-6">
                 <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted">Market Alerts</h4>
                 <div className="space-y-4">
                    {[
                      { icon: ShoppingBag, color: 'text-accent-orange', text: 'Price drop for Head Pro balls you saved!' },
                      { icon: Users, color: 'text-accent-blue', text: 'Zubair A. challenged you to a match.' },
                      { icon: Trophy, color: 'text-warning', text: 'Ramadan Tournament registration opens soon.' },
                    ].map((alert, i) => (
                      <div key={i} className="flex gap-4 p-4 rounded-2xl bg-bg-card border border-border group cursor-pointer hover:border-border-strong transition-all">
                         <div className={`p-2 bg-bg-subtle rounded-lg shrink-0 ${alert.color}`}><alert.icon size={18} /></div>
                         <p className="text-sm font-medium text-text-secondary group-hover:text-text-primary leading-tight">{alert.text}</p>
                      </div>
                    ))}
                 </div>
              </section>

              {/* Quick AI Tip */}
              <div className="bg-ai-purple/10 border border-ai-purple/30 p-8 rounded-[2rem] text-center space-y-4">
                 <div className="w-12 h-12 bg-ai-purple text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-ai-purple/20">
                    <Zap size={24} fill="currentColor" />
                 </div>
                 <h5 className="font-bold font-display text-ai-purple">Pro Tip Of The Day</h5>
                 <p className="text-xs text-text-secondary leading-relaxed italic">"Avoid hitting the ball into the corner glass if you can't follow it. Instead, aim for the middle to force communication errors."</p>
                 <Badge variant="ai">By Coach Fatima</Badge>
              </div>
           </div>
        </div>
      </div>

      <Modal isOpen={inviteModalOpen} onClose={() => setInviteModalOpen(false)} title="Invite to Game" className="max-w-md">
         {inviteBooking && (
            <div className="space-y-6 text-center">
              <div>
                <h4 className="font-bold text-lg font-display">{inviteBooking.courtName}</h4>
                <p className="text-sm text-text-secondary">{new Date(inviteBooking.date).toLocaleDateString()} • {inviteBooking.time}</p>
              </div>
              <div className="bg-bg-elevated p-3 rounded-xl border border-border flex items-center justify-between gap-3">
                 <input 
                   readOnly 
                   className="bg-transparent flex-1 text-sm text-text-muted outline-none truncate" 
                   value={`https://padelpro.pk/courts/${inviteBooking.courtId}?ref=invite`}
                 />
                 <Button size="sm" onClick={copyLink} className="whitespace-nowrap bg-accent-blue text-white hover:bg-accent-blue/90">Copy Link</Button>
              </div>
              <div>
                <p className="text-xs font-bold text-text-muted uppercase mb-4">Or share via:</p>
                <div className="flex justify-center gap-4">
                   <button className="w-12 h-12 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center hover:bg-[#25D366]/20 transition-all font-bold cursor-pointer" onClick={() => window.open(`https://wa.me/?text=Join me for padel at ${inviteBooking.courtName}`, '_blank')}>W</button>
                   <button className="w-12 h-12 rounded-full bg-[#E1306C]/10 text-[#E1306C] flex items-center justify-center hover:bg-[#E1306C]/20 transition-all font-bold cursor-pointer" onClick={() => window.open('https://instagram.com', '_blank')}>IG</button>
                   <button className="w-12 h-12 rounded-full bg-[#1DA1F2]/10 text-[#1DA1F2] flex items-center justify-center hover:bg-[#1DA1F2]/20 transition-all font-bold cursor-pointer" onClick={() => window.open(`https://twitter.com/intent/tweet?text=Join me for padel at ${inviteBooking.courtName}`, '_blank')}>TW</button>
                </div>
              </div>
            </div>
         )}
      </Modal>
    </PageWrapper>
  );
};

export default Dashboard;
