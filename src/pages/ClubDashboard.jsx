import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Calendar, DollarSign, Clock, Users, Plus,
  Check, X, ChevronRight, MapPin, Settings, BarChart3,
  Trophy, Edit3, Save, AlertCircle, RefreshCw
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const TABS = ['Overview', 'Bookings', 'Players', 'Settings'];

export default function ClubDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  
  // Data states
  const [dashboardData, setDashboardData] = useState(null);
  const [bookings, setBookings] = useState({ data: [], total: 0, page: 1 });
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [slotDate, setSlotDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!user || user.role !== 'CLUB_OWNER') { navigate('/'); return; }
    loadDashboard();
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === 'Bookings') loadBookings();
    else if (activeTab === 'Players') loadPlayers();
  }, [activeTab]);

  const loadDashboard = async () => {
    try {
      const data = await api.get('/clubs/overview');
      setDashboardData(data);
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error('Club not found or pending approval.');
      } else {
        toast.error('Failed to load club data');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async (page = 1) => {
    try {
      const data = await api.get(`/clubs/bookings?page=${page}&limit=20`);
      setBookings({ data: data.bookings, total: data.total, page });
    } catch { toast.error('Failed to load bookings'); }
  };

  const loadPlayers = async () => {
    try {
      const data = await api.get('/clubs/players');
      setPlayers(data.players || []);
    } catch { toast.error('Failed to load players'); }
  };

  const handleBookingStatus = async (id, status) => {
    try {
      await api.patch(`/clubs/bookings/${id}`, { status });
      toast.success(`Booking ${status.toLowerCase()}`);
      loadBookings(bookings.page);
    } catch (err) { toast.error(err.message); }
  };

  const generateDailySlots = async () => {
    if (!selectedCourt) return;
    try {
      const TIME_SLOTS = ['06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'];
      const slots = TIME_SLOTS.slice(0, -1).map((t, i) => ({
        date: slotDate, startTime: t, endTime: TIME_SLOTS[i + 1]
      }));
      await api.post(`/courts/${selectedCourt.id}/slots`, { slots });
      toast.success(`Slots generated for ${slotDate}`);
      setIsSlotModalOpen(false);
    } catch (err) { toast.error(err.message); }
  };

  if (user?.role !== 'CLUB_OWNER') return null;

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-6 pb-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="blue" className="bg-accent-blue/10 text-accent-blue uppercase py-1 flex items-center gap-1">
                <Building2 size={12} /> CLUB OWNER
              </Badge>
              {dashboardData?.club && !dashboardData.club.isActive && (
                <Badge variant="orange" className="bg-warning/10 text-warning flex items-center gap-1">
                  <AlertCircle size={10} /> INACTIVE
                </Badge>
              )}
            </div>
            <h1 className="text-4xl font-bold font-display">{dashboardData?.club?.name || 'Club Dashboard'}</h1>
            {dashboardData?.club && <p className="text-text-secondary mt-1">{dashboardData.club.city} · {dashboardData.club.address}</p>}
          </div>
          <Button variant="secondary" icon={RefreshCw} onClick={loadDashboard}>Refresh</Button>
        </div>

        {/* Navigation */}
        <div className="flex bg-bg-elevated p-1 rounded-2xl border border-border w-fit mb-10 overflow-x-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-6 py-3 text-sm font-bold rounded-xl transition-all whitespace-nowrap relative ${activeTab === t ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}>
              {activeTab === t && <motion.div layoutId="club-tab" className="absolute inset-0 bg-bg-card border border-border rounded-xl shadow-sm" />}
              <span className="relative z-10">{t}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            
            {/* Overview Tab */}
            {activeTab === 'Overview' && dashboardData && (
              <div className="space-y-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <Card className="p-6">
                    <div className="w-12 h-12 rounded-2xl bg-accent-blue/10 text-accent-blue flex items-center justify-center mb-4"><Calendar size={22} /></div>
                    <p className="text-3xl font-bold font-display">{dashboardData.stats.bookingsToday}</p>
                    <p className="text-text-secondary text-sm mt-1">Today's Bookings</p>
                  </Card>
                  <Card className="p-6">
                    <div className="w-12 h-12 rounded-2xl bg-success/10 text-success flex items-center justify-center mb-4"><DollarSign size={22} /></div>
                    <p className="text-3xl font-bold font-display">Rs {(dashboardData.stats.revenueThisMonth/1000).toFixed(0)}k</p>
                    <p className="text-text-secondary text-sm mt-1">This Month</p>
                  </Card>
                  <Card className="p-6">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-4"><Users size={22} /></div>
                    <p className="text-3xl font-bold font-display">{dashboardData.stats.uniquePlayersCount}</p>
                    <p className="text-text-secondary text-sm mt-1">Unique Players</p>
                  </Card>
                  <Card className="p-6">
                    <div className="w-12 h-12 rounded-2xl bg-warning/10 text-warning flex items-center justify-center mb-4"><MapPin size={22} /></div>
                    <p className="text-3xl font-bold font-display">{dashboardData.stats.courtsCount}</p>
                    <p className="text-text-secondary text-sm mt-1">Active Courts</p>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold font-display">Upcoming Bookings</h3>
                      <Button size="sm" variant="outline" onClick={() => setActiveTab('Bookings')}>View All</Button>
                    </div>
                    <Card className="overflow-hidden border border-border">
                      {dashboardData.upcomingBookings.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="text-xs text-text-muted uppercase tracking-widest border-b border-border bg-bg-elevated/50">
                              <th className="py-3 pl-4 font-semibold">Player</th>
                              <th className="py-3 font-semibold">Court</th>
                              <th className="py-3 font-semibold">Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dashboardData.upcomingBookings.map(b => (
                              <tr key={b.id} className="border-b border-border/50 hover:bg-bg-elevated/30 transition-colors">
                                <td className="py-3 pl-4 font-medium flex items-center gap-2"><Avatar name={b.player.name} size="sm" />{b.player.name}</td>
                                <td className="py-3 text-sm text-text-secondary">{b.court.name}</td>
                                <td className="py-3 text-sm font-bold">{b.date} {b.startTime}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="p-8 text-center text-text-muted">No upcoming bookings found.</div>
                      )}
                    </Card>
                  </div>
                  
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold font-display">Court Management</h3>
                    <div className="space-y-4">
                      {dashboardData.club.courts.map(c => (
                        <Card key={c.id} className="p-5 flex justify-between items-center border border-border">
                          <div>
                            <p className="font-bold">{c.name}</p>
                            <p className="text-xs text-text-secondary">{c.surface} · Rs {c.pricePerHour}/hr</p>
                          </div>
                          <Button size="sm" variant="secondary" icon={Clock} onClick={() => { setSelectedCourt(c); setIsSlotModalOpen(true); }}>Slots</Button>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'Bookings' && (
              <div className="space-y-6">
                <Card className="overflow-hidden border border-border">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-xs text-text-muted uppercase tracking-widest border-b border-border bg-bg-elevated/50">
                        <th className="py-4 pl-6 pr-4 font-semibold">Ref</th>
                        <th className="py-4 pr-4 font-semibold">Player</th>
                        <th className="py-4 pr-4 font-semibold">Court / Time</th>
                        <th className="py-4 pr-4 font-semibold">Amount</th>
                        <th className="py-4 pr-4 font-semibold">Status</th>
                        <th className="py-4 pr-6 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.data.map(b => (
                        <tr key={b.id} className="border-b border-border/50 hover:bg-bg-elevated/30 transition-colors">
                          <td className="py-4 pl-6 pr-4 text-xs font-mono text-text-muted">{b.id.slice(0,8)}</td>
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              <Avatar name={b.player.name} size="sm" />
                              <div>
                                <p className="font-bold text-sm">{b.player.name}</p>
                                <p className="text-xs text-text-muted">{b.player.phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 pr-4">
                            <p className="text-sm font-medium">{b.court.name}</p>
                            <p className="text-xs text-text-muted">{b.date} {b.startTime}</p>
                          </td>
                          <td className="py-4 pr-4 text-sm font-bold">Rs {b.totalAmount}</td>
                          <td className="py-4 pr-4">
                            <Badge className={`text-[10px] ${b.status === 'CONFIRMED' ? 'bg-accent/10 text-accent' : b.status === 'COMPLETED' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>{b.status}</Badge>
                          </td>
                          <td className="py-4 pr-6 text-right">
                            {b.status === 'CONFIRMED' && (
                              <div className="flex gap-2 justify-end">
                                <button onClick={() => handleBookingStatus(b.id, 'COMPLETED')} className="p-2 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors"><Check size={16} /></button>
                                <button onClick={() => handleBookingStatus(b.id, 'CANCELLED')} className="p-2 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors"><X size={16} /></button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {bookings.data.length === 0 && <div className="text-center py-12 text-text-muted">No bookings found.</div>}
                </Card>
              </div>
            )}

            {/* Players Tab */}
            {activeTab === 'Players' && (
              <div className="space-y-6">
                <Card className="overflow-hidden border border-border">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-xs text-text-muted uppercase tracking-widest border-b border-border bg-bg-elevated/50">
                        <th className="py-4 pl-6 pr-4 font-semibold">Player</th>
                        <th className="py-4 pr-4 font-semibold">Skill Level</th>
                        <th className="py-4 pr-4 font-semibold">Total Visits</th>
                        <th className="py-4 pr-6 font-semibold">Total Spent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {players.map(p => (
                        <tr key={p.id} className="border-b border-border/50 hover:bg-bg-elevated/30 transition-colors">
                          <td className="py-4 pl-6 pr-4">
                            <div className="flex items-center gap-3">
                              <Avatar name={p.name} size="sm" />
                              <div>
                                <p className="font-bold text-sm">{p.name}</p>
                                <p className="text-xs text-text-muted">{p.phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 pr-4 text-sm text-text-secondary">{p.skillLevel}</td>
                          <td className="py-4 pr-4 text-sm font-bold">{p.visits}</td>
                          <td className="py-4 pr-6 text-sm font-bold text-success">Rs {p.totalSpent}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {players.length === 0 && <div className="text-center py-12 text-text-muted">No players have booked your club yet.</div>}
                </Card>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'Settings' && (
              <div className="max-w-2xl">
                <Card className="p-8 border-dashed border-2">
                  <h3 className="text-xl font-bold font-display mb-2">Club Settings</h3>
                  <p className="text-text-secondary mb-6">Contact PadelPro Support to edit your club details, address, or add new courts.</p>
                  <Button variant="outline" icon={AlertCircle}>Contact Support</Button>
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Generate Slots Modal */}
        <Modal isOpen={isSlotModalOpen} onClose={() => setIsSlotModalOpen(false)} className="max-w-sm">
          <h3 className="text-2xl font-bold font-display mb-2">Generate Slots</h3>
          <p className="text-text-secondary text-sm mb-6">For court: {selectedCourt?.name}</p>
          <div className="space-y-4">
            <Input label="Date" type="date" value={slotDate} onChange={e => setSlotDate(e.target.value)} />
            <p className="text-xs text-text-muted p-3 bg-bg-elevated rounded-xl">This will create 1-hour slots from 6:00 AM to 11:00 PM.</p>
            <div className="flex gap-4 pt-4">
              <Button variant="secondary" onClick={() => setIsSlotModalOpen(false)} className="flex-1">Cancel</Button>
              <Button onClick={generateDailySlots} className="flex-1">Generate</Button>
            </div>
          </div>
        </Modal>

      </div>
    </PageWrapper>
  );
}
