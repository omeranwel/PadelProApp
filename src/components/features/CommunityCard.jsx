import React from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, MessageSquare, Share2, MoreHorizontal, 
  Award, Zap, Calendar, ArrowUpRight, TrendingUp
} from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';

const CommunityCard = ({ post }) => {
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
                <Avatar name={post.author.name} size="md" />
                {post.author.skill === 'professional' && (
                  <div className="absolute -bottom-1 -right-1 bg-warning text-white p-0.5 rounded-full ring-2 ring-bg-card">
                    <Award size={10} />
                  </div>
                )}
              </div>
              <div>
                 <h4 className="font-bold text-sm">{post.author.name}</h4>
                 <div className="flex items-center gap-2">
                    <Badge variant={post.author.skill === 'professional' ? 'professional' : 'default'} className="!text-[9px] py-0">{post.author.skill}</Badge>
                    <span className="text-[10px] text-text-muted font-bold">• {post.createdAt.toUpperCase()}</span>
                 </div>
              </div>
           </div>
           <button className="text-text-muted hover:text-text-primary transition-colors"><MoreHorizontal size={20} /></button>
        </div>

        {post.title && <h3 className="text-xl font-bold font-display mb-3">{post.title}</h3>}
        <p className="text-text-secondary leading-relaxed mb-6 whitespace-pre-line">{post.content}</p>

        {post.type === 'event' && (
          <div className="bg-accent-orange/5 border border-accent-orange/20 rounded-2xl p-6 mb-6 flex items-center justify-between group cursor-pointer hover:bg-accent-orange/10 transition-all">
             <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-accent-orange uppercase tracking-widest">Featured Tournament</span>
                <span className="font-bold">Register for Ramadan Games</span>
             </div>
             <ArrowUpRight size={24} className="text-accent-orange group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </div>
        )}

        <div className="flex items-center gap-3 mb-6">
          {post.tags.map(tag => (
            <span key={tag} className="text-[10px] font-bold text-accent-blue bg-accent-blue/5 px-2 py-0.5 rounded-md">#{tag.toUpperCase()}</span>
          ))}
        </div>

        <div className="pt-6 border-t border-border flex items-center justify-between">
           <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 text-text-secondary hover:text-danger transition-colors font-bold text-xs group">
                 <Heart size={18} className="group-hover:fill-danger/20" /> {post.likes}
              </button>
              <button className="flex items-center gap-2 text-text-secondary hover:text-accent-blue transition-colors font-bold text-xs">
                 <MessageSquare size={18} /> {post.comments}
              </button>
           </div>
           <button className="text-text-secondary hover:text-white transition-colors"><Share2 size={18} /></button>
        </div>
      </Card>
    </motion.div>
  );
};

export default CommunityCard;
