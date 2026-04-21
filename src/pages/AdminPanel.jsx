import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, MapPin, Calendar, 
  MessageSquare, Settings, Users, ArrowUpRight,
  TrendingUp, DollarSign, Clock, ShieldCheck, Plus, Check
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';
import { mockBookings } from '../data/mockBookings';
import { mockCourts } from '../data/mockCourts';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [isAddCourtOpen, setIsAddCourtOpen] = useState(false);
  const clubName = "Padel Arena DHA";
  const myCourts = mockCourts.filter(c => c.club === "Padel Arena");

  const stats = [
    { label: 'Today Revenue', val: 'Rs 14,200', change: '+12%', icon: DollarSign, color: 'text-success' },
    { label: 'Booking Rate', val: '84%', change: '+5%', icon: TrendingUp, color: 'text-accent-blue' },
    { label: 'Active Games', val: '4', change: 'Live', icon: Clock, color: 'text-accent-orange' },
    { label: 'Members', val: '124', change: '+2', icon: Users, color: 'text-ai-purple' },
  ];

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-6 pb-24">
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
           <div>
              <div className="flex items-center gap-3 mb-2">
                 <Badge variant="orange" className="bg-accent-orange/10 text-accent-orange uppercase py-1">CLUB OWNER</Badge>
                 <span className="text-xs text-text-muted font-bold flex items-center gap-1"><ShieldCheck size={14} /> Verified Enterprise</span>
              </div>
              <h1 className="text-4xl font-bold font-display">{clubName} Dashboard</h1>
           </div>
           <div className="flex bg-bg-elevated p-1 rounded-2xl border border-border shadow-md">
              {['Overview', 'Bookings', 'Courts', 'Community'].map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`
                    px-8 py-3 text-sm font-bold rounded-xl transition-all
                    ${activeTab === t ? 'bg-bg-card text-text-primary shadow-sm border border-border' : 'text-text-muted hover:text-text-secondary'}
                  `}
                >
                  {t}
                </button>
              ))}
           </div>
        </div>

        {activeTab === 'Overview' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
             {/* Key Stats */}
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                  <Card key={i} className="p-8">
                     <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl bg-bg-subtle ${stat.color}`}>
                           <stat.icon size={24} />
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stat.change === 'Live' ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
                           {stat.change}
                        </span>
                     </div>
                     <span className="text-xs font-bold text-text-muted uppercase tracking-widest block mb-1">{stat.label}</span>
                     <span className="text-2xl font-bold font-display">{stat.val}</span>
                  </Card>
                ))}
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Recent Bookings Live */}
                <div className="lg:col-span-8 space-y-8">
                   <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold font-display">Live Bookings Queue</h3>
                      <button className="text-accent-blue font-bold text-xs uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">Today's List <ArrowUpRight size={14} /></button>
                   </div>
                   <div className="space-y-4">
                      {mockBookings.slice(0, 4).map((b, i) => (
                        <div key={b.id} className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-3xl bg-bg-card border border-border hover:border-border-strong transition-all">
                           <div className="w-12 h-12 bg-bg-elevated rounded-xl flex items-center justify-center font-bold text-sm border border-border">
                              {b.time.split(':')[0]}
                           </div>
                           <div className="flex-1">
                              <h5 className="font-bold">{b.isMatch ? 'Match: competitive' : 'Solo Court Booking'}</h5>
                              <p className="text-xs text-text-secondary mt-1">Player: Sharjeel C. • ID: #PK-9281</p>
                           </div>
                           <div className="flex items-center gap-4">
                              <Badge variant={i === 0 ? 'orange' : 'success'}>{i === 0 ? 'STARTING SOON' : 'CHECKED IN'}</Badge>
                              <div className="h-8 w-px bg-border md:block hidden" />
                              <button className="p-2 text-text-muted hover:text-text-primary"><Settings size={18} /></button>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Court Utilization */}
                <div className="lg:col-span-4 space-y-8">
                   <h3 className="text-2xl font-bold font-display text-center lg:text-left">Utilization</h3>
                   <div className="space-y-6">
                      {myCourts.map((c, i) => (
                        <div key={c.id} className="space-y-2">
                           <div className="flex justify-between items-end">
                              <span className="text-sm font-bold">{c.name}</span>
                              <span className="text-xs text-text-muted font-mono">{75 - (i * 10)}%</span>
                           </div>
                           <div className="h-2 bg-bg-elevated rounded-full overflow-hidden border border-border">
                              <div className="h-full bg-accent-blue" style={{ width: `${75 - (i * 10)}%` }} />
                           </div>
                        </div>
                      ))}
                   </div>
                   <Card className="bg-accent-blue/5 border-dashed border-accent-blue/30 p-8 text-center space-y-4">
                      <p className="text-xs text-text-secondary leading-relaxed font-medium">Add a "Happy Hour" discount to increase bookings on Court 2 (Outdoor) between 12PM - 3PM.</p>
                      <Button variant="ghost" className="text-accent-blue font-bold text-[10px] tracking-widest uppercase">Apply AI Suggestion</Button>
                   </Card>
                </div>
             </div>
          </motion.div>
        )}

        {activeTab === 'Courts' && (
          <div className="space-y-8">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold font-display">Manage Facilities</h3>
                <Button icon={Plus} onClick={() => setIsAddCourtOpen(true)}>Add New Court</Button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {myCourts.map(court => (
                  <Card key={court.id} className="p-0 overflow-hidden flex flex-row">
                     <div className="w-40 bg-bg-elevated h-full overflow-hidden">
                        <img src={court.images[0]} className="w-full h-full object-cover" />
                     </div>
                     <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                           <div className="flex justify-between items-start mb-2">
                              <h5 className="font-bold text-lg">{court.name}</h5>
                              <button className="text-text-muted hover:text-text-primary"><Settings size={18} /></button>
                           </div>
                           <div className="flex gap-2">
                              <Badge variant="blue">{court.surface}</Badge>
                              <Badge variant="success">ACTIVE</Badge>
                           </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
                           <span className="text-sm font-bold text-accent-orange">Rs {court.pricePerHour}/HR</span>
                           <Button variant="ghost" size="sm" className="text-accent-blue underline">Edit Price</Button>
                        </div>
                     </div>
                  </Card>
                ))}
             </div>
          </div>
        )}
      </div>

      <Modal isOpen={isAddCourtOpen} onClose={() => setIsAddCourtOpen(false)} title="Add New Court" className="max-w-xl">
         <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <Input label="Court Name" placeholder="e.g. Court 3 (Indoor)" />
               <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-primary">Surface Type</label>
                  <select className="bg-bg-elevated border border-border-strong rounded-lg py-2.5 px-4 text-text-primary">
                    <option>WPT Standard Blue</option>
                    <option>Classic Green</option>
                    <option>Red Clay</option>
                  </select>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <Input label="Price Per Hour (Rs)" type="number" placeholder="4000" />
               <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-primary">Court Location</label>
                  <select className="bg-bg-elevated border border-border-strong rounded-lg py-2.5 px-4 text-text-primary">
                    <option>Indoor</option>
                    <option>Outdoor</option>
                    <option>Covered Outdoor</option>
                  </select>
               </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
               <Button variant="secondary" onClick={() => setIsAddCourtOpen(false)}>Cancel</Button>
               <Button onClick={() => { setIsAddCourtOpen(false); toast.success('Court added successfully!'); }}>Add Court</Button>
            </div>
         </div>
      </Modal>
    </PageWrapper>
  );
};

export default AdminPanel;
