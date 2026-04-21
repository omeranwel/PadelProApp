import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, MessageSquare, Newspaper, Mail, TrendingUp, 
  Search, Award, Users, Filter, ArrowRight 
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import CommunityCard from '../components/features/CommunityCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import { mockPosts } from '../data/mockPosts';

const Community = () => {
  const [activeTab, setActiveTab] = useState('Feed');
  const [activeForumTopic, setActiveForumTopic] = useState(null);
  const tabs = ['Feed', 'Forums', 'Blogs', 'Newsletter'];

  const forumtopics = [
    { title: 'Best beginner racket under 20k?', replies: 42, activity: '5m' },
    { title: 'Any indoor courts opening in DHA Phase 8?', replies: 18, activity: '2h' },
    { title: 'Rules question: Ball hitting the fence after glass', replies: 89, activity: '1d' },
    { title: 'Looking for a coach for semi-private sessions', replies: 5, activity: '2d' },
  ];

  const blogPosts = [
    { title: 'Padel vs Tennis: Which is better for you?', date: 'Apr 12', author: 'Coach Ali' },
    { title: 'The Padel Pro Guide to Bandejas', date: 'Apr 10', author: 'Fatima K.' },
    { title: 'Top 5 courts in Karachi 2024', date: 'Mar 28', author: 'Editorial' },
  ];

  return (
    <PageWrapper>
      {/* Community Header */}
      <section className="bg-bg-card border-b border-border py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="text-center md:text-left">
              <h1 className="text-5xl font-bold font-display mb-4">Community Square</h1>
              <p className="text-text-secondary text-lg max-w-md">Connect with Karachi's fastest growing athletic network.</p>
           </div>
           <div className="flex bg-bg-elevated p-1.5 rounded-2xl border border-border shadow-2xl">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setActiveForumTopic(null); }}
                  className={`
                    px-8 py-3 text-sm font-bold rounded-xl transition-all relative
                    ${activeTab === tab ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'}
                  `}
                >
                  {activeTab === tab && (
                    <motion.div layoutId="comm-tab" className="absolute inset-0 bg-bg-card border border-border rounded-xl shadow-lg" />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {tab === 'Feed' && <TrendingUp size={16} />}
                    {tab === 'Forums' && <MessageSquare size={16} />}
                    {tab === 'Blogs' && <Newspaper size={16} />}
                    {tab === 'Newsletter' && <Mail size={16} />}
                    {tab}
                  </span>
                </button>
              ))}
           </div>
        </div>
      </section>

      <section className="px-6 max-w-7xl mx-auto py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           {/* Sidebar / Filters */}
           <div className="lg:col-span-3 space-y-12">
              <div className="space-y-6">
                 <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted">Explore Topics</h4>
                 <div className="space-y-2">
                    {['Tournament News', 'Gear Talk', 'Rules & Strategy', 'Court Reviews', 'Matchmaking Help'].map(topic => (
                      <button key={topic} className="w-full text-left px-4 py-3 rounded-xl border border-transparent hover:border-border hover:bg-bg-card transition-all text-sm font-semibold text-text-secondary hover:text-text-primary flex items-center justify-between group">
                         {topic}
                         <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      </button>
                    ))}
                 </div>
              </div>

              <Card className="bg-accent-blue/5 border-accent-blue/10 p-6 space-y-4">
                 <h5 className="font-bold flex items-center gap-2"><Award size={18} className="text-accent-blue" /> Verified Pro's</h5>
                 <p className="text-[11px] text-text-secondary">Professional coaches and players share tips daily. Look for the badge!</p>
                 <div className="flex -space-x-3 pt-2">
                    {[1, 2, 3, 4].map(i => <div key={i} className="w-10 h-10 rounded-full border-4 border-bg-card bg-bg-elevated overflow-hidden"><Avatar name={`P ${i}`} /></div>)}
                 </div>
              </Card>
           </div>

           {/* Main Feed */}
           <div className="lg:col-span-6 space-y-8">
              {activeTab === 'Feed' && (
                <>
                  <Card className="p-6">
                     <div className="flex gap-4">
                        <Avatar name="Sharjeel" size="md" />
                        <div className="flex-1 bg-bg-elevated rounded-2xl border border-border p-4 text-text-muted cursor-pointer hover:bg-bg-subtle transition-colors flex items-center justify-between">
                           What's on your mind?
                           <Plus size={20} />
                        </div>
                     </div>
                  </Card>
                  <div className="space-y-6">
                    {mockPosts.map((post) => (
                      <CommunityCard key={post.id} post={post} />
                    ))}
                  </div>
                  <div className="py-8 flex justify-center">
                     <Button variant="ghost" className="text-accent-blue font-bold">Show More Activity</Button>
                  </div>
                </>
              )}

              {activeTab === 'Forums' && !activeForumTopic && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-2xl font-bold font-display">Active Discussions</h3>
                     <Button size="sm" icon={Plus}>Start Topic</Button>
                  </div>
                  <div className="space-y-4">
                    {forumtopics.map((t, i) => (
                      <Card key={i} className="hover:border-accent-blue/30 cursor-pointer" onClick={() => setActiveForumTopic(t)}>
                        <div className="flex justify-between items-start">
                           <div className="space-y-1">
                              <h4 className="text-lg font-bold group-hover:text-accent-blue transition-colors">{t.title}</h4>
                              <p className="text-xs text-text-muted">Started by Zain Ali • {t.activity} ago</p>
                           </div>
                           <div className="text-center bg-bg-elevated px-4 py-2 rounded-xl border border-border">
                              <span className="block font-bold text-text-primary text-sm">{t.replies}</span>
                              <span className="text-[10px] text-text-muted uppercase font-bold">Replies</span>
                           </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'Forums' && activeForumTopic && (
                 <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <button onClick={() => setActiveForumTopic(null)} className="text-text-secondary hover:text-text-primary flex items-center gap-2 text-sm font-bold w-fit mb-6"><ArrowRight className="rotate-180" size={16} /> Back to Forums</button>
                    <div className="space-y-2 mb-8">
                       <h3 className="text-3xl font-bold font-display">{activeForumTopic.title}</h3>
                       <p className="text-sm text-text-secondary">Started by <span className="font-bold text-accent-blue">Zain Ali</span> • {activeForumTopic.activity} ago</p>
                    </div>
                    
                    <div className="space-y-6">
                       <Card className="flex gap-4">
                          <Avatar name="Zain Ali" size="md" />
                          <div className="flex-1 space-y-4">
                             <div className="flex justify-between">
                                <h5 className="font-bold text-sm">Zain Ali</h5>
                                <span className="text-xs text-text-muted">Today at 10:15 AM</span>
                             </div>
                             <p className="text-text-primary text-sm leading-relaxed">Hey everyone! I've been playing with a rented racket for 2 months now and I want to buy my first one. My budget is around 20k. I prefer control over power right now while I learn. Any suggestions?</p>
                          </div>
                       </Card>

                       <Card className="flex gap-4 ml-8 bg-bg-elevated border-border-strong relative">
                          <div className="absolute -left-6 top-6 w-6 h-px bg-border-strong" />
                          <div className="absolute -left-6 top-[-30px] w-px h-[54px] bg-border-strong" />
                          <Avatar name="Coach Fatima" size="md" />
                          <div className="flex-1 space-y-4">
                             <div className="flex justify-between">
                                <div className="flex items-center gap-2">
                                  <h5 className="font-bold text-sm text-accent-blue">Coach Fatima</h5>
                                  <Badge variant="blue" className="!py-0 !px-1.5 text-[10px]">VERIFIED COACH</Badge>
                                </div>
                                <span className="text-xs text-text-muted">Today at 11:30 AM</span>
                             </div>
                             <p className="text-text-primary text-sm leading-relaxed">For that budget, I highly recommend looking at the Kuikma PR990 series from Decathlon, or finding a lightly used Babolat Air Vertuo in the marketplace. Round shaped rackets are best for what you want (control).</p>
                          </div>
                       </Card>
                       
                       <div className="pt-8 border-t border-border mt-8">
                          <h5 className="font-bold mb-4">Leave a Reply</h5>
                          <textarea className="w-full bg-bg-elevated border border-border rounded-xl p-4 min-h-[120px] focus:border-accent-blue outline-none text-text-primary" placeholder="Share your thoughts..."></textarea>
                          <div className="flex justify-end mt-4">
                             <Button icon={MessageSquare}>Post Reply</Button>
                          </div>
                       </div>
                    </div>
                 </motion.div>
              )}

              {activeTab === 'Blogs' && (
                <div className="grid grid-cols-1 gap-8">
                   {blogPosts.map((blog, i) => (
                     <div key={i} className="group cursor-pointer">
                        <div className="aspect-[21/9] rounded-3xl overflow-hidden bg-bg-card border border-border mb-6 group-hover:border-accent-orange/50 transition-all">
                           <div className="w-full h-full bg-gradient-to-br from-bg-elevated to-bg-card flex items-center justify-center">
                              <Newspaper size={48} className="text-text-muted opacity-20 group-hover:scale-110 transition-transform" />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <div className="flex items-center gap-3">
                              <Badge variant="blue">{blog.author.toUpperCase()}</Badge>
                              <span className="text-xs text-text-muted font-bold">{blog.date.toUpperCase()}, 2025</span>
                           </div>
                           <h3 className="text-2xl font-bold font-display group-hover:text-accent-orange transition-colors underline decoration-transparent group-hover:decoration-accent-orange/30 underline-offset-4">{blog.title}</h3>
                        </div>
                     </div>
                   ))}
                </div>
              )}

              {activeTab === 'Newsletter' && (
                <div className="py-12 space-y-12 text-center max-w-md mx-auto">
                   <div className="w-24 h-24 bg-accent-blue/10 text-accent-blue rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 transform rotate-6">
                      <Mail size={48} />
                   </div>
                   <div className="space-y-4">
                      <h2 className="text-4xl font-bold font-display">Stay in the Loop</h2>
                      <p className="text-text-secondary leading-relaxed">Weekly summaries of tournament registrations, new court openings, and community-exclusive gear drops in Karachi.</p>
                   </div>
                   <div className="space-y-4 pt-8">
                      <Input placeholder="Your email address" className="text-center !bg-bg-card font-bold" />
                      <Button size="lg" className="w-full !bg-accent-blue shadow-xl shadow-accent-blue/20">Subscribe to Newsletter</Button>
                      <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">NO SPAM • WEEKLY UPDATE ONLY</p>
                   </div>
                </div>
              )}
           </div>

           {/* Trending / Right Rail */}
           <div className="lg:col-span-3 space-y-12">
              <div className="space-y-6">
                 <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted">Trending Now</h4>
                 <div className="space-y-4">
                    {[
                      { tag: 'Tournament', title: 'Ramadan Cup 2025', trend: 'high' },
                      { tag: 'Gear', title: 'Viper vs Metalbone', trend: 'medium' },
                      { tag: 'News', title: 'New Arena in Nazimabad', trend: 'high' },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4 items-start group cursor-pointer">
                         <div className="text-2xl font-bold font-display text-border-strong group-hover:text-accent-orange transition-colors">0{i+1}</div>
                         <div className="space-y-1">
                            <span className="text-[10px] font-bold text-accent-blue uppercase">{item.tag}</span>
                            <p className="text-sm font-bold group-hover:underline">{item.title}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="bg-bg-elevated rounded-3xl p-8 border border-border text-center space-y-6">
                 <h5 className="font-bold text-lg font-display">Grow the Game</h5>
                 <p className="text-xs text-text-secondary leading-relaxed">Know a great coach or a new court? Help us keep the community updated.</p>
                 <Button variant="outline" size="sm" className="w-full">Submit a Tip</Button>
              </div>
           </div>
        </div>
      </section>
    </PageWrapper>
  );
};

export default Community;
