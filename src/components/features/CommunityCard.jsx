import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, MessageSquare, Share2, MoreHorizontal, 
  Award, Zap, Calendar, ArrowUpRight, Send
} from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import { communityService } from '../../services/communityService';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import toast from 'react-hot-toast';

const CommunityCard = ({ post }) => {
  const { user } = useAuthStore();
  const { openAuthModal } = useAppStore();
  const [likes, setLikes] = useState(post.likes || 0);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsCount, setCommentsCount] = useState(post.comments || 0);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  const handleLike = async () => {
    if (!user) {
      toast.error('Please sign in to like posts!');
      openAuthModal();
      return;
    }
    try {
      const action = isLiked ? 'unlike' : 'like';
      await communityService.toggleLike(post.id, action);
      setIsLiked(!isLiked);
      setLikes(prev => isLiked ? prev - 1 : prev + 1);
    } catch (err) {
      toast.error(err.message || 'Failed to like post');
    }
  };

  const handleToggleComments = async () => {
    const nextShowState = !showComments;
    setShowComments(nextShowState);
    if (nextShowState && comments.length === 0) {
      setLoadingComments(true);
      try {
        const res = await communityService.getReplies(post.id);
        setComments(res.data || res);
      } catch (err) {
        toast.error(err.message || 'Failed to load comments');
      } finally {
        setLoadingComments(false);
      }
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to comment!');
      openAuthModal();
      return;
    }
    if (!newComment.trim()) return;
    try {
      const res = await communityService.createReply(post.id, newComment);
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
      setComments(prev => [...prev, formatted]);
      setCommentsCount(prev => prev + 1);
      setNewComment('');
      toast.success('Comment posted!');
    } catch (err) {
      toast.error(err.message || 'Failed to post comment');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/community?post=${post.id}`);
    toast.success('Post link copied to clipboard!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
    >
      <Card className="hover:border-accent-blue/20 transition-all duration-300">
        <div className="flex items-start justify-between mb-6">
           <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar name={post.author?.name} src={post.author?.avatarUrl} size="md" />
                {post.author?.skillLevel === 'professional' && (
                  <div className="absolute -bottom-1 -right-1 bg-warning text-white p-0.5 rounded-full ring-2 ring-bg-card">
                    <Award size={10} />
                  </div>
                )}
              </div>
              <div>
                 <h4 className="font-bold text-sm">{post.author?.name || 'Padel Player'}</h4>
                 <div className="flex items-center gap-2">
                    <Badge variant={post.author?.skillLevel === 'professional' ? 'professional' : 'default'} className="!text-[9px] py-0">{post.author?.skillLevel || 'Player'}</Badge>
                    <span className="text-[10px] text-text-muted font-bold">• {post.createdAt?.toUpperCase()}</span>
                 </div>
              </div>
           </div>
           <button className="text-text-muted hover:text-text-primary transition-colors"><MoreHorizontal size={20} /></button>
        </div>

        {post.title && <h3 className="text-xl font-bold font-display mb-3 text-text-primary">{post.title}</h3>}
        <p className="text-text-secondary leading-relaxed mb-6 whitespace-pre-line text-sm">{post.content}</p>

        {post.type === 'event' && (
          <div className="bg-accent-orange/5 border border-accent-orange/20 rounded-2xl p-6 mb-6 flex items-center justify-between group cursor-pointer hover:bg-accent-orange/10 transition-all">
             <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-accent-orange uppercase tracking-widest">Featured Tournament</span>
                <span className="font-bold text-text-primary">Register for Ramadan Games</span>
             </div>
             <ArrowUpRight size={24} className="text-accent-orange group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </div>
        )}

        {Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            {post.tags.map(tag => (
              <span key={tag} className="text-[10px] font-bold text-accent-blue bg-accent-blue/5 px-2 py-0.5 rounded-md">#{tag.toUpperCase()}</span>
            ))}
          </div>
        )}

        <div className="pt-6 border-t border-border flex items-center justify-between">
           <div className="flex items-center gap-6">
              <button onClick={handleLike} className={`flex items-center gap-2 transition-colors font-bold text-xs group ${isLiked ? 'text-danger' : 'text-text-secondary hover:text-danger'}`}>
                 <Heart size={18} className={isLiked ? 'fill-danger text-danger' : 'group-hover:fill-danger/20'} /> {likes}
              </button>
              <button onClick={handleToggleComments} className={`flex items-center gap-2 transition-colors font-bold text-xs ${showComments ? 'text-accent-blue' : 'text-text-secondary hover:text-accent-blue'}`}>
                 <MessageSquare size={18} /> {commentsCount}
              </button>
           </div>
           <button onClick={handleShare} className="text-text-secondary hover:text-white transition-colors"><Share2 size={18} /></button>
        </div>

        {/* Inline Comments Section */}
        {showComments && (
          <div className="mt-6 pt-6 border-t border-border space-y-4">
            <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Comments ({commentsCount})</h4>
            
            {loadingComments ? (
              <div className="space-y-3">
                <div className="h-10 bg-bg-elevated animate-pulse rounded-xl" />
                <div className="h-10 bg-bg-elevated animate-pulse rounded-xl" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-xs text-text-muted">No comments yet. Share your thoughts!</p>
            ) : (
              <div className="space-y-4 max-h-60 overflow-y-auto no-scrollbar">
                {comments.map((comment, index) => (
                  <div key={comment.id || index} className="flex gap-3 items-start bg-bg-elevated/40 p-3 rounded-xl border border-border/50">
                    <Avatar name={comment.author?.name} src={comment.author?.avatarUrl} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-xs text-text-primary">{comment.author?.name}</span>
                        <span className="text-[9px] text-text-muted font-semibold">{comment.createdAt}</span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAddComment} className="flex gap-2 items-center mt-4">
              <input
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                className="flex-1 bg-bg-elevated border border-border rounded-xl px-4 py-2.5 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
              />
              <button type="submit" className="p-2.5 rounded-xl bg-accent text-bg-base hover:bg-accent-hover transition-colors">
                <Send size={14} />
              </button>
            </form>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default CommunityCard;
