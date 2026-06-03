import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Calendar, DollarSign, Clock, Users, Plus,
  Check, X, ChevronRight, MapPin, Settings, BarChart3,
  Trophy, Edit3, Save, AlertCircle, CheckCircle, RefreshCw
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

const TABS = ['Overview', 'Bookings', 'Slots', 'Club Profile', 'Tournaments'];

const AREAS = ['DHA', 'Clifton', 'Gulshan', 'Nazimabad', 'North Nazimabad', 'PECHS', 'Saddar', 'Korangi', 'Landhi', 'Malir'];
const SURFACES = ['Artificial Grass', 'Synthetic', 'Hard Court', 'Clay'];
const TIME_SLOTS = ['06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'];

const ClubDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [club, setClub] = useState(null);
  const [courts, setCourts] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddCourtOpen, setIsAddCourtOpen] = useState(false);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [slotDate, setSlotDate] = useState(new Date().toISOString().split('T')[0]);

  const [clubForm, setClubForm] = useState({
    name: '', description: '', address: '', area: '', city: 'Karachi',
    contactPhone: '', contactEmail: '', website: '', amenities: []
  });

  const [courtForm, setCourtForm] = useState({
    name: '', surface: 'Artificial Grass', pricePerHour: '', description: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'CLUB_ADMIN') { navigate('/'); return; }
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [statsData, clubData] = await Promise.all([
        api.get('/clubs/my/stats').catch(() => null),
        api.get('/clubs/my').catch(() => null)
      ]);
      if (statsData) {
        setStats(statsData);
        setCourts(statsData.courts !== undefined ? (clubData?.courts || []) : []);
      }
      if (clubData) {
        setClub(clubData);
        setCourts(clubData.courts || []);
        setClubForm({
          name: clubData.name || '', description: clubData.description || '',
          address: clubData.address || '', area: clubData.area || '',
          city: clubData.city || 'Karachi', contactPhone: clubData.contactPhone || '',
          contactEmail: clubData.contactEmail || '', website: clubData.website || '',
          amenities: clubData.amenities || []
        });
      }
    } catch {}
    setLoading(false);
  };

  const loadBookings = async () => {
    try {
      const data = await api.get('/clubs/my/bookings');
      setBookings(data.bookings || []);
    } catch {}
  };

  const loadTournaments = async () => {
    try {
      const data = await api.get('/clubs/my/tournaments');
      setTournaments(data || []);
    } catch {}
  };

  useEffect(() => {
    if (activeTab === 'Bookings') loadBookings();
    if (activeTab === 'Tournaments') loadTournaments();
  }, [activeTab]);

  const saveClubProfile = async () => {
    try {
      await api.post('/clubs/my', clubForm);
      toast.success('Club profile saved! Pending admin approval.');
      loadAll();
    } catch(err) { toast.error(err.message); }
  };

  const addCourt = async () => {
    if (!courtForm.name || !courtForm.pricePerHour) { toast.error('Fill in all required fields'); return; }
    try {
      await api.post('/courts', {
        ...courtForm, pricePerHour: parseInt(courtForm.pricePerHour),
        clubName: club?.name || clubForm.name,
        area: club?.area || clubForm.area,
        city: club?.city || 'Karachi',
        address: club?.address || clubForm.address,
        lat: 24.8607, lng: 67.0011, amenities: []
      });
      toast.success('Court added!');
      setIsAddCourtOpen(false);
      setCourtForm({ name: '', surface: 'Artificial Grass', pricePerHour: '', description: '' });
      loadAll();
    } catch(err) { toast.error(err.message || 'Failed to add court'); }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await api.patch(`/clubs/my/bookings/${bookingId}`, { status });
      toast.success(`Booking ${status.toLowerCase()}`);
      loadBookings();
    } catch { toast.error('Failed to update booking'); }
  };

  const generateDailySlots = async () => {
    if (!selectedCourt) return;
    const slots = TIME_SLOTS.slice(0, -1).map((t, i) => ({
      date: slotDate, startTime: t, endTime: TIME_SLOTS[i + 1]
    }));
    try {
      await api.post(`/clubs/my/courts/${selectedCourt.id}/slots`, { slots });
      toast.success(`Generated ${slots.length} slots for ${slotDate}`);
      setIsSlotModalOpen(false);
    } catch(err) { toast.error(err.message || 'Failed to generate slots'); }
  };

  const toggleAmenity = (a) => {
    setClubForm(f => ({
      ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a]
    }));
  };

  const amenityOptions = ['Parking', 'Changing Rooms', 'Pro Shop', 'Cafe/Canteen', 'Locker Rooms', 'Showers', 'WiFi', 'AC', 'Coaching Available', 'Equipment Rental'];

  if (user?.role !== 'CLUB_ADMIN') return null;

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="blue" className="bg-accent-blue/10 text-accent-blue uppercase py-1 flex items-center gap-1">
                <Building2 size={12} /> CLUB ADMIN
              </Badge>
              {club && !club.isApproved && (
                <Badge className="bg-warning/10 text-warning text-[10px] flex items-center gap-1">
                  <AlertCircle size={10} /> Pending Approval
                </Badge>
              )}
            </div>
            <h1 className="text-4xl font-bold font-display">{club?.name || 'My Club'}</h1>
            {club?.area && <p className="text-text-secondary mt-1">{club.area}, {club.city}</p>}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" icon={RefreshCw} onClick={loadAll} size="sm">Refresh</Button>
            <Button icon={Plus} onClick={() => setIsAddCourtOpen(true)}>Add Court</Button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex bg-bg-elevated p-1 rounded-2xl border border-border w-fit mb-10 overflow-x-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-5 py-3 text-sm font-bold rounded-xl transition-all whitespace-nowrap relative ${activeTab === t ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}>
              {activeTab === t && <motion.div layoutId="club-tab" className="absolute inset-0 bg-bg-card border border-border rounded-xl shadow-sm" />}
              <span className="relative z-10">{t}</span>
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'Overview' && (
          <div className="space-y-10">
            {!club && !loading && (
              <Card className="p-8 text-center border-dashed border-2 border-accent/30">
                <Building2 size={48} className="text-accent mx-auto mb-4 opacity-50" />
                <h3 className="text-2xl font-bold font-display mb-2">Set Up Your Club</h3>
                <p className="text-text-secondary mb-6">Complete your club profile to start accepting bookings. You'll need admin approval before going live.</p>
                <Button onClick={() => setActiveTab('Club Profile')}>Complete Club Profile</Button>
              </Card>
            )}
            {stats && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { icon: Calendar, label: "Today's Bookings", value: stats.todayBookings || 0, color: 'text-accent' },
                    { icon: Clock, label: 'Pending Confirmations', value: stats.pendingBookings || 0, color: 'text-warning' },
                    { icon: DollarSign, label: 'Total Revenue', value: `Rs ${((stats.totalRevenue||0)/1000).toFixed(0)}K`, color: 'text-success' },
                    { icon: MapPin, label: 'Active Courts', value: courts.length, color: 'text-accent-blue' },
                  ].map(s => (
                    <Card key={s.label} className="p-6">
                      <div className={`w-12 h-12 rounded-2xl bg-current/10 flex items-center justify-center mb-4 ${s.color}`}>
                        <s.icon size={22} className={s.color} />
                      </div>
                      <p className="text-3xl font-bold font-display">{s.value}</p>
                      <p className="text-text-secondary text-sm mt-1">{s.label}</p>
                    </Card>
                  ))}
                </div>

                {stats.recentBookings && stats.recentBookings.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold font-display mb-6">Recent Bookings</h3>
                    <div className="space-y-3">
                      {stats.recentBookings.slice(0,5).map(b => (
                        <Card key={b.id} className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-4">
                            <Avatar name={b.player?.name} size="sm" />
                            <div>
                              <p className="font-bold text-sm">{b.player?.name}</p>
                              <p className="text-xs text-text-muted">{b.court?.name} · {b.date} at {b.startTime}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-sm">Rs {b.totalAmount?.toLocaleString()}</span>
                            <Badge className={`text-[10px] ${b.status === 'CONFIRMED' ? 'bg-accent/10 text-accent' : b.status === 'COMPLETED' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>{b.status}</Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Courts */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold font-display">My Courts</h3>
                <Button size="sm" icon={Plus} onClick={() => setIsAddCourtOpen(true)}>Add Court</Button>
              </div>
              {courts.length === 0 ? (
                <Card className="p-8 text-center border-dashed">
                  <p className="text-text-muted">No courts yet. Add your first court to start accepting bookings.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {courts.map(c => (
                    <Card key={c.id} className="p-6 space-y-4">
                      <div className="flex justify-between">
                        <h4 className="font-bold text-lg">{c.name}</h4>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${c.isActive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                      <p className="text-text-secondary text-sm">{c.surface} · Rs {c.pricePerHour?.toLocaleString()}/hr</p>
                      <p className="text-xs text-text-muted">{c._count?.bookings || 0} total bookings</p>
                      <Button size="sm" variant="secondary" icon={Clock} onClick={() => { setSelectedCourt(c); setIsSlotModalOpen(true); }}>
                        Manage Slots
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bookings */}
        {activeTab === 'Bookings' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold font-display">Booking Management</h3>
            </div>
            {bookings.length === 0 ? (
              <Card className="p-12 text-center border-dashed"><p className="text-text-muted">No bookings yet</p></Card>
            ) : (
              <div className="space-y-4">
                {bookings.map(b => (
                  <Card key={b.id} className="p-5">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <Avatar name={b.player?.name} size="md" />
                        <div>
                          <p className="font-bold">{b.player?.name}</p>
                          <p className="text-text-secondary text-sm">{b.player?.phone || b.player?.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-text-muted">{b.court?.name}</span>
                            <span className="text-text-muted">·</span>
                            <span className="text-xs font-bold">{b.date} at {b.startTime}</span>
                            <span className="text-text-muted">·</span>
                            <span className="text-xs">{b.duration}h</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold">Rs {b.totalAmount?.toLocaleString()}</p>
                          <p className="text-xs text-text-muted">{b.paymentMethod}</p>
                        </div>
                        <Badge className={`text-[10px] ${b.status === 'CONFIRMED' ? 'bg-accent/10 text-accent' : b.status === 'COMPLETED' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>{b.status}</Badge>
                        {b.status === 'CONFIRMED' && (
                          <div className="flex gap-2">
                            <button onClick={() => updateBookingStatus(b.id, 'COMPLETED')}
                              className="p-2 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors"><Check size={16} /></button>
                            <button onClick={() => updateBookingStatus(b.id, 'CANCELLED')}
                              className="p-2 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors"><X size={16} /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Slots Management */}
        {activeTab === 'Slots' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold font-display">Court Slot Management</h3>
            {courts.length === 0 ? (
              <Card className="p-12 text-center border-dashed"><p className="text-text-muted">Add courts first to manage their slots</p></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courts.map(c => (
                  <Card key={c.id} className="p-6 space-y-4">
                    <h4 className="font-bold text-lg">{c.name}</h4>
                    <p className="text-text-secondary text-sm">{c.surface} · Rs {c.pricePerHour?.toLocaleString()}/hr</p>
                    <Button icon={Clock} onClick={() => { setSelectedCourt(c); setIsSlotModalOpen(true); }}>Generate Slots</Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Club Profile */}
        {activeTab === 'Club Profile' && (
          <div className="max-w-2xl space-y-8">
            <div>
              <h3 className="text-xl font-bold font-display mb-6">Club Information</h3>
              {club && !club.isApproved && (
                <div className="p-4 bg-warning/10 border border-warning/30 rounded-xl mb-6 flex items-center gap-3">
                  <AlertCircle size={20} className="text-warning shrink-0" />
                  <p className="text-sm text-text-secondary">Your club is <strong>pending admin approval</strong>. You can update your profile while waiting.</p>
                </div>
              )}
              <div className="space-y-5">
                <div>
                  <Input label="Club Name *" placeholder="e.g. Karachi Padel Arena" value={clubForm.name} onChange={e => setClubForm({...clubForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea className="w-full bg-bg-elevated border border-border rounded-xl p-4 min-h-[100px] focus:border-accent outline-none text-text-primary resize-none"
                    placeholder="Describe your facility..." value={clubForm.description} onChange={e => setClubForm({...clubForm, description: e.target.value})} />
                </div>
                <Input label="Address *" placeholder="Full street address" value={clubForm.address} onChange={e => setClubForm({...clubForm, address: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Area *</label>
                    <select className="w-full bg-bg-elevated border border-border rounded-xl p-3 text-text-primary focus:border-accent outline-none"
                      value={clubForm.area} onChange={e => setClubForm({...clubForm, area: e.target.value})}>
                      <option value="">Select area</option>
                      {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <Input label="City" value={clubForm.city} onChange={e => setClubForm({...clubForm, city: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Contact Phone" placeholder="+92XXXXXXXXXX" value={clubForm.contactPhone} onChange={e => setClubForm({...clubForm, contactPhone: e.target.value})} />
                  <Input label="Contact Email" placeholder="club@email.com" value={clubForm.contactEmail} onChange={e => setClubForm({...clubForm, contactEmail: e.target.value})} />
                </div>
                <Input label="Website" placeholder="https://yourclub.pk" value={clubForm.website} onChange={e => setClubForm({...clubForm, website: e.target.value})} />
                <div>
                  <label className="block text-sm font-medium mb-3">Amenities</label>
                  <div className="flex flex-wrap gap-2">
                    {amenityOptions.map(a => (
                      <button key={a} onClick={() => toggleAmenity(a)}
                        className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${clubForm.amenities.includes(a) ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text-secondary hover:border-border-strong'}`}>
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
                <Button icon={Save} onClick={saveClubProfile} className="w-full">Save Club Profile</Button>
              </div>
            </div>
          </div>
        )}

        {/* Tournaments */}
        {activeTab === 'Tournaments' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold font-display">My Tournaments</h3>
              <Button icon={Plus} onClick={() => navigate('/tournaments')}>Create Tournament</Button>
            </div>
            {tournaments.length === 0 ? (
              <Card className="p-12 text-center border-dashed">
                <Trophy size={32} className="mx-auto mb-3 text-text-muted opacity-30" />
                <p className="text-text-muted">No tournaments yet. Create one from the Tournaments page.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tournaments.map(t => (
                  <Card key={t.id} className="p-6 space-y-3">
                    <div className="flex justify-between">
                      <h4 className="font-bold">{t.name}</h4>
                      <Badge className={`text-[10px] ${t.status === 'registration_open' ? 'bg-accent/10 text-accent' : 'bg-text-muted/10 text-text-muted'}`}>{t.status}</Badge>
                    </div>
                    <p className="text-sm text-text-secondary">{t.skillLevel} · {t.format}</p>
                    <p className="text-xs text-text-muted">{t.participants?.length || 0}/{t.maxParticipants} players · Rs {t.prizePool?.toLocaleString()} prize</p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Court Modal */}
      <Modal isOpen={isAddCourtOpen} onClose={() => setIsAddCourtOpen(false)} className="max-w-md">
        <h3 className="text-2xl font-bold font-display mb-6">Add New Court</h3>
        <div className="space-y-4">
          <Input label="Court Name *" placeholder="e.g. Court 1 — Main Arena" value={courtForm.name} onChange={e => setCourtForm({...courtForm, name: e.target.value})} />
          <div>
            <label className="block text-sm font-medium mb-2">Surface</label>
            <select className="w-full bg-bg-elevated border border-border rounded-xl p-3 text-text-primary focus:border-accent outline-none"
              value={courtForm.surface} onChange={e => setCourtForm({...courtForm, surface: e.target.value})}>
              {SURFACES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <Input label="Price per Hour (PKR) *" placeholder="e.g. 3500" type="number" value={courtForm.pricePerHour} onChange={e => setCourtForm({...courtForm, pricePerHour: e.target.value})} />
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea className="w-full bg-bg-elevated border border-border rounded-xl p-3 min-h-[80px] focus:border-accent outline-none resize-none text-text-primary"
              value={courtForm.description} onChange={e => setCourtForm({...courtForm, description: e.target.value})} />
          </div>
          <div className="flex gap-4 pt-2">
            <Button variant="secondary" onClick={() => setIsAddCourtOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={addCourt} className="flex-1">Add Court</Button>
          </div>
        </div>
      </Modal>

      {/* Slot Generation Modal */}
      <Modal isOpen={isSlotModalOpen} onClose={() => setIsSlotModalOpen(false)} className="max-w-sm">
        <h3 className="text-2xl font-bold font-display mb-2">Generate Slots</h3>
        <p className="text-text-secondary text-sm mb-6">{selectedCourt?.name}</p>
        <div className="space-y-4">
          <Input label="Date" type="date" value={slotDate} onChange={e => setSlotDate(e.target.value)} />
          <p className="text-xs text-text-muted">This will create 1-hour slots from 6:00 AM to 11:00 PM ({TIME_SLOTS.length - 1} slots)</p>
          <div className="flex gap-4">
            <Button variant="secondary" onClick={() => setIsSlotModalOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={generateDailySlots} className="flex-1">Generate</Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
};

export default ClubDashboard;
