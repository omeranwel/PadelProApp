import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Users, MapPin, Building2, Calendar, 
  BarChart3, Shield, CheckCircle, XCircle, AlertCircle,
  TrendingUp, DollarSign, Activity, Search, Eye, Trash2,
  ChevronDown, RefreshCw, Award
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import Input from '../components/ui/Input';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, sub, color = 'text-accent' }) => (
  <Card className="p-6">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl bg-current/10 flex items-center justify-center ${color}`}>
        <Icon size={22} className={color} />
      </div>
    </div>
    <p className="text-3xl font-bold font-display">{value}</p>
    <p className="text-text-secondary text-sm mt-1">{label}</p>
    {sub && <p className="text-xs text-text-muted mt-1">{sub}</p>}
  </Card>
);

const TABS = ['Overview', 'Users', 'Clubs', 'Courts', 'Bookings'];

const AdminPanel = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [courts, setCourts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user?.role !== 'APP_ADMIN') { navigate('/'); return; }
    loadDashboard();
  }, []);

  useEffect(() => {
    if (activeTab === 'Users') loadUsers();
    else if (activeTab === 'Clubs') loadClubs();
    else if (activeTab === 'Courts') loadCourts();
    else if (activeTab === 'Bookings') loadBookings();
  }, [activeTab]);

  const loadDashboard = async () => {
    try {
      const data = await api.get('/admin/overview');
      setStats(data.stats);
    } catch { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  const loadUsers = async () => {
    try {
      const data = await api.get(`/admin/users?search=${search}`);
      setUsers(data.users || []);
    } catch {}
  };

  const loadClubs = async () => {
    try {
      const data = await api.get('/admin/clubs');
      setClubs(data.clubs || []);
    } catch {}
  };

  const loadCourts = async () => {
    try {
      const data = await api.get('/admin/courts');
      setCourts(data.courts || []);
    } catch {}
  };

  const loadBookings = async () => {
    try {
      const data = await api.get('/admin/bookings');
      setBookings(data.bookings || []);
    } catch {}
  };

  const approveClub = async (id, approve) => {
    try {
      await api.patch(`/admin/clubs/${id}`, { isApproved: approve });
      toast.success(approve ? 'Club approved!' : 'Club suspended');
      loadClubs();
    } catch { toast.error('Failed to update club'); }
  };

  const toggleUser = async (id, isVerified) => {
    try {
      await api.patch(`/admin/users/${id}`, { isVerified });
      toast.success(isVerified ? 'User verified' : 'User unverified');
      loadUsers();
    } catch { toast.error('Failed to update user'); }
  };

  const toggleCourt = async (id, isActive) => {
    try {
      await api.patch(`/admin/courts/${id}`, { isActive });
      toast.success(isActive ? 'Court activated' : 'Court deactivated');
      loadCourts();
    } catch { toast.error('Failed'); }
  };

  if (user?.role !== 'APP_ADMIN') return null;

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="orange" className="bg-accent/10 text-accent uppercase py-1 flex items-center gap-1">
                <Shield size={12} /> APP ADMIN
              </Badge>
            </div>
            <h1 className="text-4xl font-bold font-display">Control Center</h1>
            <p className="text-text-secondary mt-1">Manage PadelPro Pakistan</p>
          </div>
          <Button variant="secondary" icon={RefreshCw} onClick={loadDashboard}>Refresh</Button>
        </div>

        {/* Tab Bar */}
        <div className="flex bg-bg-elevated p-1 rounded-2xl border border-border w-fit mb-10 overflow-x-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-6 py-3 text-sm font-bold rounded-xl transition-all whitespace-nowrap relative ${activeTab === t ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}>
              {activeTab === t && <motion.div layoutId="admin-tab" className="absolute inset-0 bg-bg-card border border-border rounded-xl shadow-sm" />}
              <span className="relative z-10">{t}</span>
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'Overview' && (
          <div className="space-y-10">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1,2,3,4].map(i => <div key={i} className="h-36 bg-bg-card rounded-xl animate-pulse border border-border" />)}
              </div>
            ) : stats ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <StatCard icon={Users} label="Total Players" value={stats.totalUsers?.toLocaleString()} color="text-accent" />
                  <StatCard icon={MapPin} label="Active Courts" value={stats.totalCourts} color="text-accent-blue" />
                  <StatCard icon={Calendar} label="Total Bookings" value={stats.totalBookings?.toLocaleString()} color="text-accent-orange" />
                  <StatCard icon={Activity} label="Total Matches" value={stats.totalMatches?.toLocaleString()} color="text-success" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <StatCard icon={Building2} label="Pending Clubs" value={stats.pendingClubs} color="text-warning" />
                  <StatCard icon={Activity} label="Community Posts" value={stats.totalPosts} color="text-text-secondary" />
                </div>

                <div>
                  <h3 className="text-xl font-bold font-display mb-6">Recent Registrations</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-xs text-text-muted uppercase tracking-widest border-b border-border">
                          <th className="text-left py-3 pr-6">Player</th>
                          <th className="text-left py-3 pr-6">Role</th>
                          <th className="text-left py-3 pr-6">City</th>
                          <th className="text-left py-3">Verified</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.slice(0,8).map(u => (
                          <tr key={u.id} className="border-b border-border/50 hover:bg-bg-elevated transition-colors">
                            <td className="py-4 pr-6">
                              <div className="flex items-center gap-3">
                                <Avatar name={u.name} size="sm" />
                                <div>
                                  <p className="font-bold text-sm">{u.name}</p>
                                  <p className="text-xs text-text-muted">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 pr-6"><Badge variant={u.role === 'APP_ADMIN' ? 'orange' : u.role === 'CLUB_ADMIN' ? 'blue' : 'default'} className="text-[10px]">{u.role}</Badge></td>
                            <td className="py-4 pr-6 text-sm text-text-secondary">{u.city}</td>
                            <td className="py-4">
                              {u.isVerified ? <CheckCircle size={16} className="text-success" /> : <AlertCircle size={16} className="text-warning" />}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* Users */}
        {activeTab === 'Users' && (
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input placeholder="Search users by name or email..." icon={Search} value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <Button onClick={loadUsers}>Search</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-text-muted uppercase tracking-widest border-b border-border">
                    <th className="text-left py-3 pr-4">User</th>
                    <th className="text-left py-3 pr-4">Role</th>
                    <th className="text-left py-3 pr-4">Skill</th>
                    <th className="text-left py-3 pr-4">City</th>
                    <th className="text-left py-3 pr-4">Verified</th>
                    <th className="text-left py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-bg-elevated transition-colors">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} size="sm" />
                          <div>
                            <p className="font-bold text-sm">{u.name}</p>
                            <p className="text-xs text-text-muted">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4"><Badge variant={u.role === 'CLUB_ADMIN' ? 'blue' : 'default'} className="text-[10px]">{u.role}</Badge></td>
                      <td className="py-4 pr-4 text-xs text-text-secondary">{u.skillLevel}</td>
                      <td className="py-4 pr-4 text-sm text-text-secondary">{u.city}</td>
                      <td className="py-4 pr-4">
                        {u.isVerified ? <span className="text-success flex items-center gap-1 text-xs"><CheckCircle size={14} /> Verified</span>
                          : <span className="text-warning flex items-center gap-1 text-xs"><AlertCircle size={14} /> Unverified</span>}
                      </td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <button onClick={() => toggleUser(u.id, !u.isVerified)}
                            className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-bg-elevated transition-colors font-medium">
                            {u.isVerified ? 'Unverify' : 'Verify'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Clubs */}
        {activeTab === 'Clubs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold font-display">Club Applications</h3>
              <div className="flex gap-2">
                <button onClick={() => loadClubs()} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-bg-elevated transition-colors font-medium">All</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {clubs.map(club => (
                <Card key={club.id} className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg">{club.name}</h4>
                      <p className="text-text-secondary text-sm">{club.area}, {club.city}</p>
                      <p className="text-xs text-text-muted mt-1">Owner: {club.owner?.name} · {club.owner?.email}</p>
                    </div>
                    <Badge variant={club.isApproved ? 'default' : 'orange'} className={club.isApproved ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}>
                      {club.isApproved ? 'Approved' : 'Pending'}
                    </Badge>
                  </div>
                  {club.description && <p className="text-sm text-text-secondary">{club.description}</p>}
                  <div className="flex gap-3 pt-2">
                    {!club.isApproved ? (
                      <Button size="sm" onClick={() => approveClub(club.id, true)} icon={CheckCircle} className="flex-1">Approve</Button>
                    ) : (
                      <Button size="sm" variant="danger" onClick={() => approveClub(club.id, false)} icon={XCircle} className="flex-1">Suspend</Button>
                    )}
                  </div>
                </Card>
              ))}
              {clubs.length === 0 && (
                <div className="col-span-2 text-center py-12 text-text-muted">
                  <Building2 size={32} className="mx-auto mb-3 opacity-30" />
                  <p>No club applications yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Courts */}
        {activeTab === 'Courts' && (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-text-muted uppercase tracking-widest border-b border-border">
                    <th className="text-left py-3 pr-4">Court</th>
                    <th className="text-left py-3 pr-4">Club</th>
                    <th className="text-left py-3 pr-4">Area</th>
                    <th className="text-left py-3 pr-4">Price/hr</th>
                    <th className="text-left py-3 pr-4">Bookings</th>
                    <th className="text-left py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {courts.map(c => (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-bg-elevated transition-colors">
                      <td className="py-4 pr-4 font-bold text-sm">{c.name}</td>
                      <td className="py-4 pr-4 text-sm text-text-secondary">{c.clubName}</td>
                      <td className="py-4 pr-4 text-sm text-text-secondary">{c.area}</td>
                      <td className="py-4 pr-4 text-sm">Rs {c.pricePerHour?.toLocaleString()}</td>
                      <td className="py-4 pr-4 text-sm">{c._count?.bookings || 0}</td>
                      <td className="py-4">
                        <button onClick={() => toggleCourt(c.id, !c.isActive)}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium ${c.isActive ? 'border-success/30 text-success hover:bg-success/10' : 'border-danger/30 text-danger hover:bg-danger/10'}`}>
                          {c.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {courts.length === 0 && <div className="text-center py-12 text-text-muted"><MapPin size={28} className="mx-auto mb-2 opacity-30" /><p>No courts loaded</p></div>}
            </div>
          </div>
        )}

        {/* Bookings */}
        {activeTab === 'Bookings' && (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-text-muted uppercase tracking-widest border-b border-border">
                    <th className="text-left py-3 pr-4">Ref</th>
                    <th className="text-left py-3 pr-4">Player</th>
                    <th className="text-left py-3 pr-4">Court</th>
                    <th className="text-left py-3 pr-4">Date</th>
                    <th className="text-left py-3 pr-4">Amount</th>
                    <th className="text-left py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id} className="border-b border-border/50 hover:bg-bg-elevated transition-colors">
                      <td className="py-4 pr-4 text-xs text-text-muted font-mono">{b.bookingRef?.slice(0,8)}</td>
                      <td className="py-4 pr-4 text-sm font-medium">{b.player?.name}</td>
                      <td className="py-4 pr-4 text-sm text-text-secondary">{b.court?.name}</td>
                      <td className="py-4 pr-4 text-sm text-text-secondary">{b.date} {b.startTime}</td>
                      <td className="py-4 pr-4 text-sm font-medium">Rs {b.totalAmount?.toLocaleString()}</td>
                      <td className="py-4">
                        <Badge variant={b.status === 'CONFIRMED' ? 'default' : b.status === 'COMPLETED' ? 'green' : 'orange'}
                          className={`text-[10px] ${b.status === 'CONFIRMED' ? 'bg-accent/10 text-accent' : b.status === 'COMPLETED' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                          {b.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bookings.length === 0 && <div className="text-center py-12 text-text-muted"><Calendar size={28} className="mx-auto mb-2 opacity-30" /><p>No bookings loaded</p></div>}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default AdminPanel;
