import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, User, MapPin, MessageSquare, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { api } from '../../services/api';

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ players: [], courts: [], posts: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults({ players: [], courts: [], posts: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/search?q=${query}`);
        setResults(res.data || res);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-bg-base/95 backdrop-blur-xl flex flex-col items-center pt-[10vh] px-6"
        >
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-3 bg-bg-elevated rounded-full text-text-secondary hover:text-accent-orange transition-colors"
          >
            <X size={24} />
          </button>

          <div className="w-full max-w-3xl">
            <div className="relative mb-12">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted" size={24} />
               <input 
                 autoFocus
                 placeholder="Search for players, courts, or community posts..."
                 className="w-full bg-bg-elevated border border-border rounded-[2rem] py-6 pl-16 pr-8 text-xl focus:border-accent-blue outline-none text-text-primary shadow-2xl"
                 value={query}
                 onChange={(e) => setQuery(e.target.value)}
               />
               {loading && (
                 <div className="absolute right-8 top-1/2 -translate-y-1/2">
                   <div className="w-5 h-5 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
                 </div>
               )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {/* Players */}
               <div>
                  <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                    <User size={14} /> Players
                  </h3>
                  <div className="space-y-2">
                    {results.players.map(p => (
                      <div 
                        key={p.id} 
                        onClick={() => handleSelect(`/profile/${p.id}`)}
                        className="p-3 bg-bg-card border border-border rounded-xl flex items-center gap-3 hover:border-accent-blue cursor-pointer transition-all group"
                      >
                         <Avatar name={p.name} size="sm" src={p.avatarUrl} />
                         <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-bold truncate group-hover:text-accent-blue">{p.name}</h5>
                            <span className="text-[10px] text-text-muted uppercase font-bold">{p.skillLevel}</span>
                         </div>
                      </div>
                    ))}
                    {query && results.players.length === 0 && !loading && <p className="text-xs text-text-muted italic">No players found</p>}
                  </div>
               </div>

               {/* Courts */}
               <div>
                  <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                    <MapPin size={14} /> Courts
                  </h3>
                  <div className="space-y-2">
                    {results.courts.map(c => (
                      <div 
                        key={c.id} 
                        onClick={() => handleSelect(`/courts/${c.id}`)}
                        className="p-3 bg-bg-card border border-border rounded-xl flex items-center gap-3 hover:border-accent-blue cursor-pointer transition-all group"
                      >
                         <div className="w-10 h-10 bg-bg-elevated rounded-lg flex items-center justify-center shrink-0">
                            <MapPin size={18} className="text-accent-orange" />
                         </div>
                         <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-bold truncate group-hover:text-accent-blue">{c.name}</h5>
                            <span className="text-[10px] text-text-muted truncate block">{c.area}</span>
                         </div>
                      </div>
                    ))}
                    {query && results.courts.length === 0 && !loading && <p className="text-xs text-text-muted italic">No courts found</p>}
                  </div>
               </div>

               {/* Community */}
               <div>
                  <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                    <MessageSquare size={14} /> Community
                  </h3>
                  <div className="space-y-2">
                    {results.posts.map(p => (
                      <div 
                        key={p.id} 
                        onClick={() => handleSelect(`/community?id=${p.id}`)}
                        className="p-3 bg-bg-card border border-border rounded-xl space-y-1 hover:border-accent-blue cursor-pointer transition-all group"
                      >
                         <h5 className="text-sm font-bold truncate group-hover:text-accent-blue">{p.title || 'Untitled Post'}</h5>
                         <p className="text-[10px] text-text-secondary line-clamp-1">{p.content}</p>
                      </div>
                    ))}
                    {query && results.posts.length === 0 && !loading && <p className="text-xs text-text-muted italic">No posts found</p>}
                  </div>
               </div>
            </div>

            {query && !loading && Object.values(results).every(r => r.length === 0) && (
              <div className="mt-24 text-center">
                 <p className="text-text-secondary">No results found for "<span className="text-text-primary font-bold">{query}</span>"</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
