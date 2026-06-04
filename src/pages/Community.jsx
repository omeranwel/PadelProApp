import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, MessageSquare, Newspaper, Mail, TrendingUp, 
  Award, ArrowRight 
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import CommunityCard from '../components/features/CommunityCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import Modal from '../components/ui/Modal';
import { communityService } from '../services/communityService';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import toast from 'react-hot-toast';

const Community = () => {
  const { user } = useAuthStore();
  const { openAuthModal } = useAppStore();
  
  const [activeTab, setActiveTab] = useState('Feed');
  const [activeForumTopic, setActiveForumTopic] = useState(null);
  const tabs = ['Feed', 'Forums', 'Blogs', 'Newsletter'];
  
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Replies states for active forum topic
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyText, setReplyText] = useState('');

  // Create Post Modal states
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [newPostType, setNewPostType] = useState('feed');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('General');
  const [submittingPost, setSubmittingPost] = useState(false);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');

  useEffect(() => {
    setIsLoading(true);
    let mapped = activeTab.toLowerCase();
    if (mapped === 'forums') mapped = 'forum';
    if (mapped === 'blogs') mapped = 'blog';
    
    communityService.getPosts(mapped).then(res => {
      setPosts(res.data || res);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, [activeTab]);

  useEffect(() => {
    if (activeForumTopic) {
      setLoadingReplies(true);
      communityService.getReplies(activeForumTopic.id).then(res => {
        setReplies(res.data || res);
      }).catch((err) => {
        toast.error(err.message || 'Failed to load replies');
      }).finally(() => setLoadingReplies(false));
    }
  }, [activeForumTopic]);

  const handleOpenCreatePost = () => {
    if (!user) {
      toast.error('Please sign in to post!');
      openAuthModal();
      return;
    }
    // Pre-select type based on active tab
    const mappedType = activeTab === 'Forums' ? 'forum' : activeTab === 'Blogs' ? 'blog' : 'feed';
    setNewPostType(mappedType);
    setCreatePostOpen(true);
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) { toast.error('Content is required'); return; }
    if ((newPostType === 'forum' || newPostType === 'blog') && !newPostTitle.trim()) { toast.error('Title is required'); return; }
    setSubmittingPost(true);
    try {
      const res = await communityService.createPost({
        type: newPostType,
        title: newPostType === 'feed' ? '' : newPostTitle,
        content: newPostContent,
        category: newPostCategory
      });
      const created = res.data || res;
      
      const activeType = activeTab.toLowerCase();
      const createdType = created.type === 'forum' ? 'forums' : created.type === 'blog' ? 'blogs' : 'feed';
      
      if (activeType === createdType) {
        const formatted = {
          ...created,
          likes: 0,
          comments: 0,
          createdAt: 'Just now',
          tags: created.category ? [created.category] : []
        };
        setPosts(prev => [formatted, ...prev]);
      }
      toast.success('Post shared successfully!');
      setCreatePostOpen(false);
      setNewPostTitle('');
      setNewPostContent('');
    } catch (err) {
      toast.error(err.message || 'Failed to share post');
    } finally {
      setSubmittingPost(false);
    }
  };

  const handlePostReply = async () => {
    if (!user) {
      toast.error('Please sign in to reply!');
      openAuthModal();
      return;
    }
    if (!replyText.trim() || !activeForumTopic) return;
    try {
      const res = await communityService.createReply(activeForumTopic.id, replyText);
      const created = res.data || res;
      const formatted = {
        ...created,
        author: {
          name: user.name,
          avatarUrl: user.avatarUrl,
          skillLevel: user.skillLevel
        },
        createdAt: 'Just now'
      };
      setReplies(prev => [...prev, formatted]);
      setReplyText('');
      toast.success('Reply posted!');
    } catch (err) {
      toast.error(err.message || 'Failed to post reply');
    }
  };

  const handleSubscribeNewsletter = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    toast.success('Thank you for subscribing to PadelPro Newsletter!');
    setNewsletterEmail('');
  };

  const blogPosts = [
    { title: 'Padel vs Tennis: Which is better for you?', date: 'Apr 12', author: 'Coach Ali' },
    { title: 'The Padel Pro Guide to Bandejas', date: 'Apr 10', author: 'Fatima K.' },
    { title: 'Top 5 courts in Karachi 2026', date: 'Mar 28', author: 'Editorial' },
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
           <div className="flex bg-bg-elevated p-1.5 rounded-2xl border border-border shadow-2xl overflow-x-auto max-w-full">
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
                       <button key={topic} onClick={() => { setActiveTab('Forums'); setActiveForumTopic(null); }} className="w-full text-left px-4 py-3 rounded-xl border border-transparent hover:border-border hover:bg-bg-card transition-all text-sm font-semibold text-text-secondary hover:text-text-primary flex items-center justify-between group">
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
                     {[1, 2, 3, 4].map(i => <div key={i} className="w-10 h-10 rounded-full border-4 border-bg-card bg-bg-elevated overflow-hidden"><Avatar name={`Player ${i}`} /></div>)}
                  </div>
              </Card>
           </div>

           {/* Main Feed */}
           <div className="lg:col-span-6 space-y-8">
              {activeTab === 'Feed' && (
                <>
                  <Card className="p-6">
                     <div className="flex gap-4">
                        <Avatar name={user?.name || 'Guest'} src={user?.avatarUrl} size="md" />
                        <div onClick={handleOpenCreatePost} className="flex-1 bg-bg-elevated rounded-2xl border border-border p-4 text-text-muted cursor-pointer hover:bg-bg-subtle transition-colors flex items-center justify-between text-sm">
                           What's on your mind?
                           <Plus size={20} />
                        </div>
                     </div>
                  </Card>
                  <div className="space-y-6">
                    {isLoading ? (
                      Array(3).fill(0).map((_, idx) => (
                         <div key={idx} className="p-6 bg-bg-card border border-border rounded-2xl animate-pulse">
                            <div className="flex items-center gap-4 mb-4">
                               <div className="w-10 h-10 bg-bg-elevated rounded-full"></div>
                               <div className="space-y-2">
                                  <div className="h-3 bg-bg-elevated w-24 rounded"></div>
                                  <div className="h-2 bg-bg-elevated w-16 rounded"></div>
                                </div>
                            </div>
                            <div className="space-y-3">
                               <div className="h-4 bg-bg-elevated w-full rounded"></div>
                               <div className="h-4 bg-bg-elevated w-5/6 rounded"></div>
                               <div className="h-4 bg-bg-elevated w-4/6 rounded"></div>
                            </div>
                         </div>
                      ))
                    ) : posts.length === 0 ? (
                      <div className="py-12 border border-dashed border-border rounded-xl text-center text-text-secondary">
                        <MessageSquare size={32} className="mx-auto mb-4 opacity-50" />
                        <p>No posts available. Be the first to share something!</p>
                      </div>
                    ) : (
                      posts.map((post) => (
                        <CommunityCard key={post.id} post={post} />
                      ))
                    )}
                  </div>
                </>
              )}

              {activeTab === 'Forums' && !activeForumTopic && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-2xl font-bold font-display">Active Discussions</h3>
                     <Button size="sm" icon={Plus} onClick={handleOpenCreatePost}>Start Topic</Button>
                  </div>
                  <div className="space-y-4">
                    {isLoading ? (
                      <p className="text-center text-text-muted animate-pulse">Loading discussions...</p>
                    ) : posts.length === 0 ? (
                      <div className="py-12 border border-dashed border-border rounded-xl text-center text-text-muted">
                         <p>No discussions found. Start the first topic!</p>
                      </div>
                    ) : (
                      posts.map((t) => (
                        <Card key={t.id} className="hover:border-accent-blue/30 cursor-pointer group" onClick={() => setActiveForumTopic(t)}>
                          <div className="flex justify-between items-start">
                             <div className="space-y-1">
                                <h4 className="text-lg font-bold group-hover:text-accent-blue transition-colors">{t.title || t.content?.slice(0, 50)}</h4>
                                <p className="text-xs text-text-muted font-body">Started by {t.author?.name || 'Anonymous'} • {t.createdAt}</p>
                             </div>
                             <div className="text-center bg-bg-elevated px-4 py-2 rounded-xl border border-border">
                                <span className="block font-bold text-text-primary text-sm">{t.comments || 0}</span>
                                <span className="text-[10px] text-text-muted uppercase font-bold font-body">Replies</span>
                             </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'Forums' && activeForumTopic && (
                 <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <button onClick={() => setActiveForumTopic(null)} className="text-text-secondary hover:text-text-primary flex items-center gap-2 text-sm font-bold w-fit mb-6"><ArrowRight className="rotate-180" size={16} /> Back to Forums</button>
                    <div className="space-y-2 mb-8">
                       <h3 className="text-3xl font-bold font-display text-text-primary">{activeForumTopic.title}</h3>
                       <p className="text-sm text-text-secondary">Started by <span className="font-bold text-accent-blue">{activeForumTopic.author?.name || 'Anonymous'}</span> • {activeForumTopic.createdAt}</p>
                    </div>
                    
                    <div className="space-y-6">
                       <Card className="flex gap-4">
                          <Avatar name={activeForumTopic.author?.name} src={activeForumTopic.author?.avatarUrl} size="md" />
                          <div className="flex-1 space-y-4">
                             <div className="flex justify-between">
                                <h5 className="font-bold text-sm text-text-primary">{activeForumTopic.author?.name || 'Anonymous'}</h5>
                                <span className="text-xs text-text-muted font-body">{activeForumTopic.createdAt}</span>
                             </div>
                             <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">{activeForumTopic.content}</p>
                          </div>
                       </Card>

                       {loadingReplies ? (
                          <p className="text-sm text-text-muted animate-pulse">Loading replies...</p>
                       ) : replies.length === 0 ? (
                          <p className="text-sm text-text-muted py-4">No replies yet. Be the first to share your thoughts!</p>
                       ) : (
                          replies.map((reply, i) => (
                             <Card key={reply.id || i} className="flex gap-4 ml-8 bg-bg-elevated border-border-strong relative">
                                <div className="absolute -left-6 top-6 w-6 h-px bg-border-strong" />
                                <div className="absolute -left-6 top-[-30px] w-px h-[54px] bg-border-strong" />
                                <Avatar name={reply.author?.name} src={reply.author?.avatarUrl} size="md" />
                                <div className="flex-1 space-y-4">
                                   <div className="flex justify-between">
                                      <div className="flex items-center gap-2">
                                        <h5 className="font-bold text-sm text-text-primary">{reply.author?.name || 'Anonymous'}</h5>
                                        {reply.author?.skillLevel === 'professional' && (
                                          <Badge variant="blue" className="!py-0 !px-1.5 text-[10px] uppercase">PRO</Badge>
                                        )}
                                      </div>
                                      <span className="text-xs text-text-muted font-body">{reply.createdAt}</span>
                                   </div>
                                   <p className="text-text-secondary text-sm leading-relaxed">{reply.content}</p>
                                </div>
                             </Card>
                          ))
                       )}
                       
                       <div className="pt-8 border-t border-border mt-8">
                          <h5 className="font-bold mb-4 text-text-primary">Leave a Reply</h5>
                          <textarea 
                             className="w-full bg-bg-elevated border border-border rounded-xl p-4 min-h-[120px] focus:border-accent-blue outline-none text-text-primary resize-none text-sm" 
                             placeholder="Share your thoughts..."
                             value={replyText}
                             onChange={e => setReplyText(e.target.value)}
                          />
                          <div className="flex justify-end mt-4">
                             <Button icon={MessageSquare} onClick={handlePostReply}>Post Reply</Button>
                          </div>
                       </div>
                    </div>
                 </motion.div>
              )}

              {activeTab === 'Blogs' && (
                <div className="grid grid-cols-1 gap-8">
                   {isLoading ? (
                     <p className="text-center text-text-muted animate-pulse">Loading blog posts...</p>
                   ) : posts.length === 0 ? (
                     blogPosts.map((blog, i) => (
                       <div key={i} className="group cursor-pointer">
                          <div className="aspect-[21/9] rounded-3xl overflow-hidden bg-bg-card border border-border mb-6 group-hover:border-accent-orange/50 transition-all">
                             <div className="w-full h-full bg-gradient-to-br from-bg-elevated to-bg-card flex items-center justify-center">
                                <Newspaper size={48} className="text-text-muted opacity-20 group-hover:scale-110 transition-transform" />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <div className="flex items-center gap-3">
                                <Badge variant="blue">{blog.author.toUpperCase()}</Badge>
                                <span className="text-xs text-text-muted font-bold font-body">{blog.date.toUpperCase()}, 2026</span>
                             </div>
                             <h3 className="text-2xl font-bold font-display group-hover:text-accent-orange transition-colors underline decoration-transparent group-hover:decoration-accent-orange/30 underline-offset-4">{blog.title}</h3>
                          </div>
                       </div>
                     ))
                   ) : (
                     posts.map((post) => (
                       <div key={post.id} className="group cursor-pointer" onClick={() => { setActiveTab('Feed'); setActiveForumTopic(null); }}>
                          <div className="aspect-[21/9] rounded-3xl overflow-hidden bg-bg-card border border-border mb-6 group-hover:border-accent-orange/50 transition-all">
                             <div className="w-full h-full bg-gradient-to-br from-bg-elevated to-bg-card flex items-center justify-center">
                                <Newspaper size={48} className="text-text-muted opacity-20 group-hover:scale-110 transition-transform" />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <div className="flex items-center gap-3">
                                <Badge variant="blue">{post.author?.name?.toUpperCase() || 'PLAYER'}</Badge>
                                <span className="text-xs text-text-muted font-bold font-body">{post.createdAt?.toUpperCase()}</span>
                             </div>
                             <h3 className="text-2xl font-bold font-display text-text-primary group-hover:text-accent-orange transition-colors underline decoration-transparent group-hover:decoration-accent-orange/30 underline-offset-4">{post.title}</h3>
                             <p className="text-sm text-text-secondary line-clamp-2">{post.content}</p>
                          </div>
                       </div>
                     ))
                   )}
                </div>
              )}

              {activeTab === 'Newsletter' && (
                <div className="py-12 space-y-12 text-center max-w-md mx-auto">
                   <div className="w-24 h-24 bg-accent-blue/10 text-accent-blue rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 transform rotate-6">
                      <Mail size={48} />
                   </div>
                   <div className="space-y-4">
                      <h2 className="text-4xl font-bold font-display text-text-primary">Stay in the Loop</h2>
                      <p className="text-text-secondary leading-relaxed text-sm">Weekly summaries of tournament registrations, new court openings, and community-exclusive gear drops in Karachi.</p>
                   </div>
                   <form onSubmit={handleSubscribeNewsletter} className="space-y-4 pt-8">
                      <Input placeholder="Your email address" className="text-center !bg-bg-card font-bold" value={newsletterEmail} onChange={e => setNewsletterEmail(e.target.value)} required type="email" />
                      <Button size="lg" className="w-full !bg-accent-blue shadow-xl shadow-accent-blue/20">Subscribe to Newsletter</Button>
                      <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest font-body">NO SPAM • WEEKLY UPDATE ONLY</p>
                   </form>
                </div>
              )}
           </div>

           {/* Trending / Right Rail */}
           <div className="lg:col-span-3 space-y-12">
              <div className="space-y-6">
                 <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted">Trending Now</h4>
                 <div className="space-y-4">
                    {[
                      { tag: 'Tournament', title: 'Ramadan Cup 2026', trend: 'high' },
                      { tag: 'Gear', title: 'Viper vs Metalbone', trend: 'medium' },
                      { tag: 'News', title: 'New Arena in Nazimabad', trend: 'high' },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4 items-start group cursor-pointer" onClick={() => { setActiveTab('Forums'); setActiveForumTopic(null); }}>
                         <div className="text-2xl font-bold font-display text-border-strong group-hover:text-accent-orange transition-colors">0{i+1}</div>
                         <div className="space-y-1">
                            <span className="text-[10px] font-bold text-accent-blue uppercase">{item.tag}</span>
                            <p className="text-sm font-bold group-hover:underline text-text-primary">{item.title}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="bg-bg-elevated rounded-3xl p-8 border border-border text-center space-y-6">
                 <h5 className="font-bold text-lg font-display text-text-primary">Grow the Game</h5>
                 <p className="text-xs text-text-secondary leading-relaxed">Know a great coach or a new court? Help us keep the community updated.</p>
                 <Button variant="outline" size="sm" className="w-full" onClick={handleOpenCreatePost}>Submit a Tip</Button>
              </div>
           </div>
        </div>
      </section>

      {/* Create Post Modal */}
      <Modal isOpen={createPostOpen} onClose={() => setCreatePostOpen(false)} className="max-w-lg">
         <h3 className="text-2xl font-bold font-display mb-6 text-text-primary">Create Community Post</h3>
         <div className="space-y-4">
            <div>
               <label className="block text-sm font-bold mb-2 text-text-secondary">Post Location</label>
               <div className="grid grid-cols-3 gap-2">
                  {[
                     { id: 'feed', label: '📱 Feed' },
                     { id: 'forum', label: '💬 Forum' },
                     { id: 'blog', label: '✍️ Blog' }
                  ].map(tab => (
                     <button key={tab.id} type="button" onClick={() => setNewPostType(tab.id)}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all ${newPostType === tab.id ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text-secondary hover:border-border-strong'}`}>
                        {tab.label}
                     </button>
                  ))}
               </div>
            </div>

            {(newPostType === 'forum' || newPostType === 'blog') && (
               <div>
                  <Input label="Post Title *" placeholder="What is your topic about?" value={newPostTitle} onChange={e => setNewPostTitle(e.target.value)} />
               </div>
            )}

            <div>
               <label className="block text-sm font-medium mb-2 text-text-secondary font-body">Content *</label>
               <textarea 
                  className="w-full bg-bg-elevated border border-border rounded-xl p-4 min-h-[120px] focus:border-accent outline-none text-text-primary resize-none text-sm"
                  placeholder="Write your post details here..."
                  value={newPostContent}
                  onChange={e => setNewPostContent(e.target.value)}
               />
            </div>

            <div>
               <label className="block text-sm font-medium mb-2 text-text-secondary font-body">Category</label>
               <select 
                  className="w-full bg-bg-elevated border border-border rounded-xl p-3 text-sm text-text-primary focus:border-accent outline-none"
                  value={newPostCategory}
                  onChange={e => setNewPostCategory(e.target.value)}
               >
                  <option value="General">General</option>
                  <option value="Tournament News">Tournament News</option>
                  <option value="Gear Talk">Gear Talk</option>
                  <option value="Rules & Strategy">Rules & Strategy</option>
                  <option value="Court Reviews">Court Reviews</option>
                  <option value="Matchmaking Help">Matchmaking Help</option>
               </select>
            </div>

            <div className="flex gap-4 pt-2">
               <Button variant="secondary" onClick={() => setCreatePostOpen(false)} className="flex-1">Cancel</Button>
               <Button onClick={handleCreatePost} loading={submittingPost} className="flex-1">Share Post</Button>
            </div>
         </div>
      </Modal>
    </PageWrapper>
  );
};

export default Community;
