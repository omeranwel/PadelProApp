import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, Shield, Bell, 
  Trophy, Settings, LogOut, Camera, 
  CheckCircle2, AlertCircle, Save, ChevronRight,
  Target, Zap, Crosshair, Sparkles
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Avatar from '../components/ui/Avatar';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('Personal');
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Profile updated successfully');
    }, 1500);
  };

  const skillData = [
    { label: 'Attacking', val: 75, icon: Zap, color: 'text-accent-orange' },
    { label: 'Defensive', val: 62, icon: Shield, color: 'text-accent-blue' },
    { label: 'Technique', val: 84, icon: Target, color: 'text-ai-purple' },
    { label: 'Stamina', val: 90, icon: Crosshair, color: 'text-success' },
  ];

  const sidebarItems = [
    { id: 'Personal', label: 'Personal Information', icon: User },
    { id: 'Skill', label: 'Skill Assessment', icon: Trophy },
    { id: 'Preferences', label: 'Player Preferences', icon: Settings },
    { id: 'Security', label: 'Security & Login', icon: Shield },
    { id: 'Notifications', label: 'Notification Settings', icon: Bell },
  ];

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <h1 className="text-4xl font-bold font-display mb-12">Account Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
           {/* Sidebar */}
           <div className="space-y-4">
              <Card className="p-1 space-y-1">
                 {sidebarItems.map(item => (
                   <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-6 py-4 rounded-xl text-sm font-bold transition-all
                      ${activeTab === item.id ? 'bg-bg-elevated text-text-primary border border-border/50 shadow-sm' : 'text-text-muted hover:text-text-secondary hover:bg-bg-subtle/50'}
                    `}
                   >
                     <item.icon size={18} className={activeTab === item.id ? 'text-accent-blue' : ''} />
                     {item.label}
                   </button>
                 ))}
              </Card>

              <button 
                onClick={logout}
                className="w-full flex items-center gap-3 px-6 py-4 rounded-xl text-sm font-bold text-danger hover:bg-danger/10 transition-all mt-8"
              >
                <LogOut size={18} />
                Sign Out
              </button>
           </div>

           {/* Content */}
           <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                 {activeTab === 'Personal' && (
                   <motion.div 
                    key="personal"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                   >
                     <Card className="p-10">
                        <div className="flex flex-col md:flex-row items-center gap-10 mb-12">
                           <div className="relative group">
                              <Avatar name={user?.name} size="xl" className="w-32 h-32 text-4xl ring-4 ring-border group-hover:ring-accent-blue transition-all" />
                              <button className="absolute bottom-0 right-0 p-3 bg-accent-blue text-white rounded-full border-4 border-bg-card shadow-lg hover:scale-110 transition-all">
                                 <Camera size={20} />
                              </button>
                           </div>
                           <div className="text-center md:text-left">
                              <h3 className="text-2xl font-bold font-display mb-2">{user?.name}</h3>
                              <p className="text-text-secondary font-medium mb-4">Member since Feb 2024 • Karachi</p>
                              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                 <Badge variant="blue">VERIFIED PLAYER</Badge>
                                 <Badge variant="orange">TOP 10% KARACHI</Badge>
                              </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <Input label="Full Name" defaultValue={user?.name} icon={User} />
                           <Input label="Email Address" defaultValue={user?.email} icon={Mail} />
                           <Input label="Phone Number" defaultValue="+92 300 1234567" icon={Phone} />
                           <div className="flex flex-col gap-1.5">
                              <label className="text-sm font-medium text-text-primary">Date Of Birth</label>
                              <input type="date" className="bg-bg-elevated border border-border-strong rounded-lg py-2.5 px-4 text-text-primary text-sm" defaultValue="1995-12-15" />
                           </div>
                        </div>

                        <div className="pt-10 mt-10 border-t border-border flex justify-end">
                           <Button size="lg" className="px-12" onClick={handleSave} loading={loading} icon={Save}>Save Changes</Button>
                        </div>
                     </Card>
                   </motion.div>
                 )}

                 {activeTab === 'Skill' && (
                    <motion.div 
                      key="skill"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-8"
                    >
                      <Card className="p-10">
                         <div className="flex items-center justify-between mb-12">
                            <div>
                               <h3 className="text-2xl font-bold font-display mb-1 flex items-center gap-2">
                                 <Trophy className="text-warning" /> Skill Profile
                               </h3>
                               <p className="text-text-secondary">AI generated performance profile from your match history.</p>
                            </div>
                            <Button variant="outline" size="sm" icon={Sparkles}>Recalculate Rank</Button>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-8">
                               {skillData.map((skill, i) => (
                                 <div key={i} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                       <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-text-secondary">
                                          <skill.icon size={16} className={skill.color} />
                                          {skill.label}
                                       </span>
                                       <span className="text-xl font-bold font-display">{skill.val}%</span>
                                    </div>
                                    <div className="h-3 bg-bg-elevated rounded-full overflow-hidden border border-border">
                                       <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${skill.val}%` }}
                                        transition={{ duration: 1.5, delay: i * 0.1 }}
                                        className={`h-full ${skill.color.replace('text', 'bg')}`}
                                       />
                                    </div>
                                 </div>
                               ))}
                            </div>

                            <div className="bg-bg-elevated/40 border-2 border-dashed border-border p-8 rounded-3xl text-center space-y-6 flex flex-col items-center justify-center">
                               <div className="text-5xl font-bold font-display text-accent-orange">3.5</div>
                               <div className="space-y-1">
                                  <p className="font-bold">Calculated Skill Level</p>
                                  <Badge variant="intermediate">INTERMEDIATE</Badge>
                               </div>
                               <p className="text-xs text-text-muted leading-relaxed">You are in the top 24% of players in Karachi DHA. 3 more wins to reach 'Advanced' status.</p>
                               <Button variant="ghost" className="text-accent-blue font-bold uppercase text-[10px] tracking-widest">How is this calculated?</Button>
                            </div>
                         </div>
                      </Card>
                    </motion.div>
                 )}

                 {activeTab === 'Preferences' && (
                   <motion.div 
                    key="pref"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                   >
                     <Card className="p-10">
                        <div className="mb-10">
                           <h3 className="text-2xl font-bold font-display mb-2">Matchmaking Preferences</h3>
                           <p className="text-text-secondary">Tailor your AI matching experience to your style.</p>
                        </div>
                        
                        <div className="space-y-10">
                           <div className="space-y-4">
                              <label className="text-sm font-bold uppercase tracking-widest text-text-muted">Preferred Position</label>
                              <div className="grid grid-cols-3 gap-4">
                                 {['Left Side', 'Right Side', 'Both'].map(p => (
                                   <button key={p} className={`py-4 rounded-xl border-2 font-bold transition-all ${p === 'Both' ? 'border-accent-blue bg-accent-blue/5 text-accent-blue' : 'border-border text-text-muted hover:border-border-strong'}`}>
                                      {p}
                                   </button>
                                 ))}
                              </div>
                           </div>

                           <div className="space-y-4">
                              <label className="text-sm font-bold uppercase tracking-widest text-text-muted">Court Preference</label>
                              <div className="grid grid-cols-2 gap-4">
                                 {['Indoor Only', 'Outdoor Only', 'No Preference'].map(c => (
                                   <button key={c} className={`py-4 rounded-xl border-2 font-bold transition-all ${c === 'No Preference' ? 'border-accent-blue bg-accent-blue/5 text-accent-blue' : 'border-border text-text-muted hover:border-border-strong'}`}>
                                      {c}
                                   </button>
                                 ))}
                              </div>
                           </div>

                           <div className="pt-6 border-t border-border flex justify-end">
                              <Button size="lg" className="px-12" onClick={handleSave} loading={loading}>Update Preferences</Button>
                           </div>
                        </div>
                     </Card>
                   </motion.div>
                 )}
                 {activeTab === 'Security' && (
                   <motion.div 
                    key="security"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                   >
                     <Card className="p-10 space-y-8">
                        <div>
                           <h3 className="text-2xl font-bold font-display mb-2">Security & Login</h3>
                           <p className="text-text-secondary">Manage your password and security preferences.</p>
                        </div>
                        <div className="space-y-6 max-w-xl">
                           <Input label="Current Password" type="password" />
                           <Input label="New Password" type="password" />
                           <Input label="Confirm New Password" type="password" />
                           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-bg-elevated rounded-xl border border-border mt-8 gap-4">
                              <div>
                                 <h5 className="font-bold">Two-Factor Authentication</h5>
                                 <p className="text-xs text-text-secondary">Add an extra layer of security to your account.</p>
                              </div>
                              <Button variant="outline" size="sm">Enable 2FA</Button>
                           </div>
                        </div>
                        <div className="pt-6 border-t border-border flex justify-end">
                           <Button size="lg" className="px-12" onClick={handleSave} loading={loading}>Update Security</Button>
                        </div>
                     </Card>
                   </motion.div>
                 )}

                 {activeTab === 'Notifications' && (
                   <motion.div 
                    key="notifications"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                   >
                     <Card className="p-10 space-y-8">
                        <div>
                           <h3 className="text-2xl font-bold font-display mb-2">Notification Preferences</h3>
                           <p className="text-text-secondary">Control what alerts you receive.</p>
                        </div>
                        <div className="space-y-0 border border-border rounded-2xl overflow-hidden divide-y divide-border">
                           {[
                             { title: 'Match Requests', desc: 'When someone invites you to play', email: true, push: true },
                             { title: 'Booking Reminders', desc: 'Alerts 2 hours before your game', email: false, push: true },
                             { title: 'Marketplace Alerts', desc: 'When saved items drop in price', email: true, push: false },
                             { title: 'Community Updates', desc: 'Newsletters and announcements', email: true, push: false },
                           ].map((item, i) => (
                             <div key={i} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between bg-bg-card gap-4">
                                <div>
                                   <h5 className="font-bold">{item.title}</h5>
                                   <p className="text-xs text-text-secondary">{item.desc}</p>
                                </div>
                                <div className="flex items-center gap-6">
                                   <label className="flex items-center gap-2 cursor-pointer">
                                      <input type="checkbox" defaultChecked={item.email} className="accent-accent-blue" />
                                      <span className="text-sm font-semibold text-text-muted">Email</span>
                                   </label>
                                   <label className="flex items-center gap-2 cursor-pointer">
                                      <input type="checkbox" defaultChecked={item.push} className="accent-accent-blue" />
                                      <span className="text-sm font-semibold text-text-muted">Push</span>
                                   </label>
                                </div>
                             </div>
                           ))}
                        </div>
                        <div className="pt-6 border-t border-border flex justify-end">
                           <Button size="lg" className="px-12" onClick={handleSave} loading={loading}>Save Settings</Button>
                        </div>
                     </Card>
                   </motion.div>
                 )}
              </AnimatePresence>
           </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Profile;
