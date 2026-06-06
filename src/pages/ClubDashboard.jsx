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

const TABS = ['Overview', 'Bookings', 'Players', 'Tournaments', 'Settings'];

export default function ClubDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  
  // Data states
  const [dashboardData, setDashboardData] = useState(null);
  const [bookings, setBookings] = useState({ data: [], total: 0, page: 1 });
  const [players, setPlayers] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [slotDate, setSlotDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [isAddCourtModalOpen, setIsAddCourtModalOpen] = useState(false);
  const [newCourt, setNewCourt] = useState({ name: '', surface: 'Indoor', pricePerHour: '', description: '' });

  const [isTournamentModalOpen, setIsTournamentModalOpen] = useState(false);
  const [newTournament, setNewTournament] = useState({ 
    name: '', description: '', startDate: '', endDate: '', 
    format: 'knockout', skillLevel: 'open', maxParticipants: 16, entryFee: 0, prizePool: 0 
  });

  useEffect(() => {
    // Wait for user to be hydrated; don't redirect if user is null yet
    if (user === undefined) return;
    const allowedRoles = ['CLUB_OWNER', 'CLUB_ADMIN', 'APP_ADMIN'];
    if (!user || !allowedRoles.includes(user.role)) { navigate('/'); return; }
    loadDashboard();
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === 'Bookings') loadBookings();
    else if (activeTab === 'Players') loadPlayers();
    else if (activeTab === 'Tournaments') loadTournaments();
  }, [activeTab]);

  const loadTournaments = async () => {
    try {
      const data = await api.get('/clubs/tournaments');
      setTournaments(data.tournaments || []);
    } catch { toast.error('Failed to load tournaments'); }
  };
  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await api.get('/clubs/overview');
      setDashboardData(data);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || '';
      if (err.response?.status === 404 || msg.includes('not found') || msg.includes('pending')) {
        toast.error('Club not found yet — your application may still be processing.');
      } else {
        toast.error(`Failed to load club data: ${msg}`);
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

  const handleAddCourt = async () => {
    if (!newCourt.name || !newCourt.pricePerHour) return toast.error('Name and price are required');
    try {
      await api.post('/clubs/courts', newCourt);
      toast.success('Court added successfully!');
      setIsAddCourtModalOpen(false);
      setNewCourt({ name: '', surface: 'Indoor', pricePerHour: '', description: '' });
      loadDashboard();
    } catch (err) { toast.error(err.message); }
  };

  const handleCreateTournament = async () => {
    if (!newTournament.name || !newTournament.startDate || !newTournament.endDate) return toast.error('Name and dates are required');
    try {
      await api.post('/clubs/tournaments', newTournament);
      toast.success('Tournament created successfully!');
      setIsTournamentModalOpen(false);
      loadDashboard();
    } catch (err) { toast.error(err.message); }
  };

  const allowedRoles = ['CLUB_OWNER', 'CLUB_ADMIN', 'APP_ADMIN'];
  if (!user || !allowedRoles.includes(user.role)) return null;

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
            
            {activeTab === 'Overview' && (
              dashboardData ? (
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
                      {dashboardData.upcomingBookings && dashboardData.upcomingBookings.length > 0 ? (
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
                        <div className="p-8 text-center text-text-muted">No bookings yet. Share your courts to start receiving bookings!</div>
                      )}
                    </Card>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold font-display">Court Management</h3>
                      <Button size="sm" onClick={() => setIsAddCourtModalOpen(true)} icon={Plus}>Add Court</Button>
                    </div>
                    <div className="space-y-4">
                      {(dashboardData.club.courts || []).length > 0 ? (
                        dashboardData.club.courts.map(c => (
                          <Card key={c.id} className="p-5 flex justify-between items-center border border-border">
                            <div>
                              <p className="font-bold">{c.name}</p>
                              <p className="text-xs text-text-secondary">{c.surface} · Rs {c.pricePerHour}/hr</p>
                            </div>
                            <Button size="sm" variant="secondary" icon={Clock} onClick={() => { setSelectedCourt(c); setIsSlotModalOpen(true); }}>Slots</Button>
                          </Card>
                        ))
                      ) : (
                        <Card className="p-6 text-center border-dashed">
                          <p className="text-text-muted text-sm">No courts registered yet.</p>
                        </Card>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              ) : (
              <Card className="p-12 text-center border-dashed">
                <Building2 size={48} className="mx-auto mb-4 text-text-muted opacity-40" />
                <h3 className="text-xl font-bold mb-2">Club Data Not Available</h3>
                <p className="text-text-secondary text-sm mb-6">Your club registration may still be processing, or there was a connection issue.</p>
                <Button onClick={loadDashboard} icon={RefreshCw}>Try Again</Button>
              </Card>
              )
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
                        <th className="py-4 pr-6 font-semibold text-right">Total Spent</th>
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
                          <td className="py-4 pr-6 text-sm font-bold text-success text-right">Rs {p.totalSpent}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {players.length === 0 && <div className="text-center py-12 text-text-muted">No players have booked your club yet.</div>}
                </Card>
              </div>
            )}

            {/* Tournaments Tab */}
            {activeTab === 'Tournaments' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold font-display">Manage Tournaments</h3>
                  <Button icon={Plus} onClick={() => setIsTournamentModalOpen(true)}>Create Tournament</Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tournaments.map(t => (
                    <Card key={t.id} className="p-6 border border-border flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-lg">{t.name}</h4>
                          <p className="text-sm text-text-muted flex items-center gap-1 mt-1"><Calendar size={14}/> {new Date(t.startDate).toLocaleDateString()} - {new Date(t.endDate).toLocaleDateString()}</p>
                        </div>
                        <Badge variant={t.status === 'upcoming' ? 'blue' : t.status === 'ongoing' ? 'green' : 'gray'}>
                          {t.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 my-6 flex-1">
                        <div>
                          <p className="text-xs text-text-muted uppercase font-bold tracking-wider">Entry Fee</p>
                          <p className="font-mono text-text-primary">Rs {t.entryFee.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-text-muted uppercase font-bold tracking-wider">Prize Pool</p>
                          <p className="font-mono text-success font-bold">Rs {t.prizePool.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-text-muted uppercase font-bold tracking-wider">Format</p>
                          <p className="font-medium capitalize">{t.format}</p>
                        </div>
                        <div>
                          <p className="text-xs text-text-muted uppercase font-bold tracking-wider">Players</p>
                          <p className="font-medium">{t.participants?.length || 0} / {t.maxParticipants}</p>
                        </div>
                      </div>
                      
                      <Button variant="outline" className="w-full">Manage Bracket</Button>
                    </Card>
                  ))}
                  
                  {tournaments.length === 0 && (
                    <div className="col-span-full py-16 text-center text-text-muted border border-dashed border-border rounded-3xl bg-bg-elevated/30">
                      <Trophy size={40} className="mx-auto mb-4 opacity-30 text-accent" />
                      <p className="mb-2">No tournaments created yet.</p>
                      <Button variant="link" className="mt-2 text-accent p-0 h-auto" onClick={() => setIsTournamentModalOpen(true)}>Create your first tournament</Button>
                    </div>
                  )}
                </div>
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

        {/* Add Court Modal */}
        <Modal isOpen={isAddCourtModalOpen} onClose={() => setIsAddCourtModalOpen(false)} className="max-w-md">
          <h3 className="text-2xl font-bold font-display mb-6">Add New Court</h3>
          <div className="space-y-4">
            <Input label="Court Name" placeholder="e.g. Center Court" value={newCourt.name} onChange={e => setNewCourt({...newCourt, name: e.target.value})} />
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted pl-1">Surface Type</label>
              <select className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-text-primary focus:border-accent outline-none" value={newCourt.surface} onChange={e => setNewCourt({...newCourt, surface: e.target.value})}>
                <option value="Indoor">Indoor (Standard)</option>
                <option value="Outdoor">Outdoor</option>
                <option value="Panoramic">Panoramic</option>
              </select>
            </div>
            <Input label="Price Per Hour (Rs)" type="number" placeholder="2000" value={newCourt.pricePerHour} onChange={e => setNewCourt({...newCourt, pricePerHour: e.target.value})} />
            <Input label="Description (Optional)" placeholder="Brief description of the court" value={newCourt.description} onChange={e => setNewCourt({...newCourt, description: e.target.value})} />
            
            <div className="flex gap-4 pt-4 mt-6">
              <Button variant="secondary" onClick={() => setIsAddCourtModalOpen(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleAddCourt} className="flex-1" icon={Plus}>Add Court</Button>
            </div>
          </div>
        </Modal>

        {/* Create Tournament Modal */}
        <Modal isOpen={isTournamentModalOpen} onClose={() => setIsTournamentModalOpen(false)} className="max-w-2xl">
          <h3 className="text-2xl font-bold font-display mb-6">Create Tournament</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input label="Tournament Name" placeholder="e.g. Summer Smash 2026" value={newTournament.name} onChange={e => setNewTournament({...newTournament, name: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <Input label="Description" placeholder="Rules, schedule details, etc." value={newTournament.description} onChange={e => setNewTournament({...newTournament, description: e.target.value})} />
            </div>
            <Input label="Start Date" type="date" value={newTournament.startDate} onChange={e => setNewTournament({...newTournament, startDate: e.target.value})} />
            <Input label="End Date" type="date" value={newTournament.endDate} onChange={e => setNewTournament({...newTournament, endDate: e.target.value})} />
            
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted pl-1">Format</label>
              <select className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-text-primary outline-none" value={newTournament.format} onChange={e => setNewTournament({...newTournament, format: e.target.value})}>
                <option value="knockout">Knockout</option>
                <option value="round_robin">Round Robin</option>
                <option value="groups">Groups + Knockout</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted pl-1">Skill Level</label>
              <select className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-text-primary outline-none" value={newTournament.skillLevel} onChange={e => setNewTournament({...newTournament, skillLevel: e.target.value})}>
                <option value="open">Open to All</option>
                <option value="beginner">Beginner Only</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            
            <Input label="Max Players" type="number" value={newTournament.maxParticipants} onChange={e => setNewTournament({...newTournament, maxParticipants: e.target.value})} />
            <Input label="Entry Fee (Rs)" type="number" value={newTournament.entryFee} onChange={e => setNewTournament({...newTournament, entryFee: e.target.value})} />
            <div className="md:col-span-2">
              <Input label="Prize Pool (Rs)" type="number" value={newTournament.prizePool} onChange={e => setNewTournament({...newTournament, prizePool: e.target.value})} />
            </div>
          </div>
          
          <div className="flex gap-4 pt-6 mt-6 border-t border-border">
            <Button variant="secondary" onClick={() => setIsTournamentModalOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleCreateTournament} className="flex-1" icon={Trophy}>Launch Tournament</Button>
          </div>
        </Modal>

      </div>
    </PageWrapper>
  );
}
