import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, MapPin, Building2, Calendar, 
  BarChart3, Shield, CheckCircle, XCircle, AlertCircle,
  Search, RefreshCw, Edit, Trash2, Ban, Mail
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

const StatCard = ({ icon: Icon, label, value, sub, color = 'text-accent' }) => (
  <Card className="p-6 flex flex-col justify-between">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl bg-current/10 flex items-center justify-center ${color}`}>
        <Icon size={22} className={color} />
      </div>
    </div>
    <div>
      <p className="text-3xl font-bold font-display">{value}</p>
      <p className="text-text-secondary text-sm mt-1">{label}</p>
      {sub && <p className="text-xs text-text-muted mt-1">{sub}</p>}
    </div>
  </Card>
);

const TABS = ['Overview', 'Users', 'Clubs', 'Courts', 'Bookings'];

export default function AdminPanel() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  
  // Data states
  const [users, setUsers] = useState({ data: [], total: 0, page: 1, pages: 1 });
  const [clubs, setClubs] = useState([]);
  const [courts, setCourts] = useState([]);
  const [bookings, setBookings] = useState({ data: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [userSearch, setUserSearch] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userBanned, setUserBanned] = useState('');

  // Modals
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    if (user?.role !== 'APP_ADMIN') { navigate('/'); return; }
    loadDashboard();
  }, [user, navigate]);

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

  const loadUsers = async (page = 1) => {
    try {
      const params = new URLSearchParams({ page, limit: 20, search: userSearch, role: userRole, banned: userBanned });
      const data = await api.get(`/admin/users?${params.toString()}`);
      setUsers({ data: data.users || [], total: data.total, page: data.page, pages: data.pages });
    } catch { toast.error('Failed to load users'); }
  };

  const loadClubs = async () => {
    try {
      const data = await api.get('/admin/clubs?status=PENDING');
      setClubs(data.clubs || []);
    } catch { toast.error('Failed to load clubs'); }
  };

  const loadCourts = async () => {
    try {
      const data = await api.get('/admin/courts');
      setCourts(data.courts || []);
    } catch { toast.error('Failed to load courts'); }
  };

  const loadBookings = async (page = 1) => {
    try {
      const data = await api.get(`/admin/bookings?page=${page}&limit=20`);
      setBookings({ data: data.bookings || [], total: data.total, page: data.page, pages: data.pages });
    } catch { toast.error('Failed to load bookings'); }
  };

  // User Actions
  const handleUserUpdate = async (id, data) => {
    try {
      await api.patch(`/admin/users/${id}`, data);
      toast.success('User updated successfully');
      loadUsers(users.page);
      setIsUserModalOpen(false);
    } catch (err) { toast.error(err.message || 'Failed to update user'); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to completely delete this user? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      loadUsers(users.page);
    } catch (err) { toast.error(err.message); }
  };

  // Club Actions
  const handleClubDecision = async (id, status, reason = '') => {
    try {
      await api.patch(`/admin/clubs/${id}`, { status, reason });
      toast.success(`Club application ${status.toLowerCase()}`);
      loadClubs();
      loadDashboard();
    } catch (err) { toast.error(err.message); }
  };

  // Booking Actions
  const handleBookingUpdate = async (id, data) => {
    try {
      await api.patch(`/admin/bookings/${id}`, data);
      toast.success('Booking updated');
      loadBookings(bookings.page);
      setIsBookingModalOpen(false);
    } catch (err) { toast.error(err.message); }
  };

  if (user?.role !== 'APP_ADMIN') return null;

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-6 pb-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="orange" className="bg-accent/10 text-accent uppercase py-1 flex items-center gap-1">
                <Shield size={12} /> APP ADMIN
              </Badge>
            </div>
            <h1 className="text-4xl font-bold font-display">Control Center</h1>
            <p className="text-text-secondary mt-1">Manage PadelPro Pakistan Platform</p>
          </div>
          <Button variant="secondary" icon={RefreshCw} onClick={loadDashboard}>Refresh Data</Button>
        </div>

        {/* Navigation */}
        <div className="flex bg-bg-elevated p-1 rounded-2xl border border-border w-fit mb-10 overflow-x-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-6 py-3 text-sm font-bold rounded-xl transition-all whitespace-nowrap relative ${activeTab === t ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}>
              {activeTab === t && <motion.div layoutId="admin-tab" className="absolute inset-0 bg-bg-card border border-border rounded-xl shadow-sm" />}
              <span className="relative z-10">{t}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'Overview' && stats && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <StatCard icon={Users} label="Total Players" value={stats.totalUsers?.toLocaleString()} sub={`${stats.newThisWeek} new this week`} color="text-accent" />
                  <StatCard icon={Calendar} label="Total Bookings" value={stats.totalBookings?.toLocaleString()} sub={`${stats.bookingsToday} today`} color="text-accent-blue" />
                  <StatCard icon={BarChart3} label="Total Revenue" value={`Rs ${(stats.totalRevenue/1000).toFixed(0)}k`} sub={`Rs ${stats.revenueToday} today`} color="text-success" />
                  <StatCard icon={Building2} label="Pending Clubs" value={stats.pendingClubApps} color="text-warning" />
                </div>
              </div>
            )}

            {activeTab === 'Users' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 bg-bg-card p-4 rounded-xl border border-border">
                  <div className="flex-1">
                    <Input placeholder="Search name, email, or phone..." icon={Search} value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                  </div>
                  <select className="bg-bg-elevated border border-border rounded-xl px-4 text-text-primary focus:border-accent outline-none" value={userRole} onChange={e => setUserRole(e.target.value)}>
                    <option value="">All Roles</option>
                    <option value="PLAYER">Players</option>
                    <option value="CLUB_OWNER">Club Owners</option>
                    <option value="APP_ADMIN">Admins</option>
                  </select>
                  <select className="bg-bg-elevated border border-border rounded-xl px-4 text-text-primary focus:border-accent outline-none" value={userBanned} onChange={e => setUserBanned(e.target.value)}>
                    <option value="">Status: All</option>
                    <option value="false">Active</option>
                    <option value="true">Banned</option>
                  </select>
                  <Button onClick={() => loadUsers(1)}>Filter</Button>
                </div>

                <div className="overflow-x-auto bg-bg-card border border-border rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-xs text-text-muted uppercase tracking-widest border-b border-border bg-bg-elevated/50">
                        <th className="py-4 pl-6 pr-4 font-semibold">User</th>
                        <th className="py-4 pr-4 font-semibold">Role</th>
                        <th className="py-4 pr-4 font-semibold">Location</th>
                        <th className="py-4 pr-4 font-semibold">Stats</th>
                        <th className="py-4 pr-4 font-semibold">Status</th>
                        <th className="py-4 pr-6 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.data.map(u => (
                        <tr key={u.id} className="border-b border-border/50 hover:bg-bg-elevated/30 transition-colors">
                          <td className="py-4 pl-6 pr-4">
                            <div className="flex items-center gap-3">
                              <Avatar name={u.name} url={u.avatarUrl} size="sm" />
                              <div>
                                <p className="font-bold text-sm text-text-primary">{u.name}</p>
                                <p className="text-xs text-text-muted font-mono">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 pr-4">
                            <Badge variant={u.role === 'APP_ADMIN' ? 'orange' : u.role === 'CLUB_OWNER' ? 'blue' : 'default'} className="text-[10px]">{u.role}</Badge>
                          </td>
                          <td className="py-4 pr-4 text-sm text-text-secondary">{u.city || '-'}</td>
                          <td className="py-4 pr-4">
                            <div className="flex flex-col gap-1 text-xs text-text-muted">
                              <span>M: {u._count?.matches || 0}</span>
                              <span>B: {u._count?.bookings || 0}</span>
                            </div>
                          </td>
                          <td className="py-4 pr-4">
                            {u.banned ? <Badge variant="danger" className="text-[10px] bg-danger/10 text-danger">Banned</Badge> 
                              : u.emailVerified ? <Badge variant="default" className="text-[10px] bg-success/10 text-success">Verified</Badge>
                              : <Badge variant="default" className="text-[10px] bg-warning/10 text-warning">Unverified</Badge>}
                          </td>
                          <td className="py-4 pr-6 text-right">
                            <Button size="sm" variant="secondary" icon={Edit} onClick={() => { setSelectedUser(u); setIsUserModalOpen(true); }}>Edit</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.data.length === 0 && <div className="text-center py-12 text-text-muted">No users found matching filters.</div>}
                </div>
              </div>
            )}

            {activeTab === 'Clubs' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {clubs.map(club => (
                    <Card key={club.id} className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-xl">{club.clubName}</h4>
                          <p className="text-text-secondary text-sm">{club.city} · {club.numberOfCourts} Courts</p>
                        </div>
                        <Badge variant="orange" className="bg-warning/10 text-warning">Pending Review</Badge>
                      </div>
                      <div className="space-y-2 mb-6 bg-bg-elevated p-4 rounded-xl border border-border text-sm">
                        <p><span className="text-text-muted">Owner:</span> {club.owner?.name}</p>
                        <p><span className="text-text-muted">Email:</span> {club.owner?.email}</p>
                        <p><span className="text-text-muted">Phone:</span> {club.ownerPhone}</p>
                        <p><span className="text-text-muted">Address:</span> {club.address}</p>
                      </div>
                      <div className="flex gap-3">
                        <Button size="sm" onClick={() => handleClubDecision(club.id, 'APPROVED')} icon={CheckCircle} className="flex-1 bg-success hover:bg-success/90 text-white border-none">Approve & Create</Button>
                        <Button size="sm" variant="danger" onClick={() => handleClubDecision(club.id, 'REJECTED', 'Did not meet criteria')} icon={XCircle} className="flex-1">Reject</Button>
                      </div>
                    </Card>
                  ))}
                  {clubs.length === 0 && (
                    <div className="col-span-2 text-center py-16 text-text-muted border-2 border-dashed border-border rounded-xl">
                      <Building2 size={48} className="mx-auto mb-4 opacity-20" />
                      <p className="text-lg">No pending club applications</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* User Edit Modal */}
        <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} className="max-w-md">
          {selectedUser && (
            <div>
              <h3 className="text-2xl font-bold font-display mb-6">Edit User</h3>
              <div className="flex items-center gap-4 mb-6 p-4 bg-bg-elevated rounded-xl border border-border">
                <Avatar name={selectedUser.name} url={selectedUser.avatarUrl} />
                <div>
                  <p className="font-bold">{selectedUser.name}</p>
                  <p className="text-xs text-text-muted">{selectedUser.email}</p>
                </div>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2 text-text-secondary">System Role</label>
                  <select 
                    className="w-full bg-bg-elevated border border-border rounded-xl p-3 text-text-primary focus:border-accent outline-none"
                    value={selectedUser.role} 
                    onChange={e => setSelectedUser({...selectedUser, role: e.target.value})}
                  >
                    <option value="PLAYER">Player</option>
                    <option value="CLUB_OWNER">Club Owner</option>
                    <option value="APP_ADMIN">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-text-secondary">Account Status</label>
                  <select 
                    className="w-full bg-bg-elevated border border-border rounded-xl p-3 text-text-primary focus:border-accent outline-none"
                    value={selectedUser.banned ? 'true' : 'false'} 
                    onChange={e => setSelectedUser({...selectedUser, banned: e.target.value === 'true'})}
                  >
                    <option value="false">Active (Normal)</option>
                    <option value="true">Banned (Suspended)</option>
                  </select>
                </div>
                <div className="pt-4 border-t border-border flex justify-between items-center gap-4">
                  <button onClick={() => handleDeleteUser(selectedUser.id)} className="text-danger hover:text-danger/80 text-sm font-medium flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-danger/10 transition-colors">
                    <Trash2 size={16} /> Delete User
                  </button>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setIsUserModalOpen(false)}>Cancel</Button>
                    <Button onClick={() => handleUserUpdate(selectedUser.id, { role: selectedUser.role, banned: selectedUser.banned })}>Save Changes</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>

      </div>
    </PageWrapper>
  );
}
