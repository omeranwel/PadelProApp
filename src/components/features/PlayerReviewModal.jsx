import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Send, X, Award, Clock, Zap, MessageSquare, Users } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const REVIEW_TAGS = [
  'Fair Player','Great Teammate','Good Sport','Punctual',
  'Skilful','Fun to Play With','Competitive','Encouraging',
  'Reliable','Good Communicator'
];

const CRITERIA = [
  { key: 'sportsmanship', label: 'Sportsmanship', icon: Award, desc: 'Fair play & attitude' },
  { key: 'punctuality', label: 'Punctuality', icon: Clock, desc: 'On time, reliable' },
  { key: 'skillDisplay', label: 'Skill Level', icon: Zap, desc: 'Technical quality of play' },
  { key: 'communication', label: 'Communication', icon: MessageSquare, desc: 'Court communication' },
  { key: 'teamwork', label: 'Teamwork', icon: Users, desc: 'Partner collaboration' },
];

const StarRating = ({ value, onChange, size = 28 }) => (
  <div className="flex gap-1">
    {[1,2,3,4,5].map(n => (
      <button key={n} type="button" onClick={() => onChange(n)} className="transition-transform hover:scale-110">
        <Star size={size} className={`transition-colors ${n <= value ? 'fill-warning text-warning' : 'text-border-strong'}`} />
      </button>
    ))}
  </div>
);

const PlayerReviewModal = ({ isOpen, onClose, opponent, matchId }) => {
  const { user } = useAuthStore();
  const [ratings, setRatings] = useState({ sportsmanship: 3, punctuality: 3, skillDisplay: 3, communication: 3, teamwork: 3 });
  const [selectedTags, setSelectedTags] = useState([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRatings({ sportsmanship: 3, punctuality: 3, skillDisplay: 3, communication: 3, teamwork: 3 });
      setSelectedTags([]); setComment(''); setSubmitted(false);
    }
  }, [isOpen]);

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : prev.length < 5 ? [...prev, tag] : prev);
  };

  const overall = (Object.values(ratings).reduce((a, b) => a + b, 0) / 5).toFixed(1);

  const handleSubmit = async () => {
    if (!opponent || !user) return;
    setLoading(true);
    try {
      await api.post('/reviews', { subjectId: opponent.id, matchId: matchId || null, ...ratings, tags: selectedTags, comment: comment.trim() || null });
      setSubmitted(true);
      toast.success('Review submitted!');
      setTimeout(() => { onClose(); }, 2000);
    } catch(err) {
      toast.error(err.message || 'Failed to submit review');
    } finally { setLoading(false); }
  };

  if (!opponent) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
      {submitted ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
          <div className="w-20 h-20 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-6">
            <Award size={40} />
          </div>
          <h3 className="text-2xl font-bold font-display mb-2">Review Submitted!</h3>
          <p className="text-text-secondary">Thanks for helping build the PadelPro community.</p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold font-display mb-1">Rate Your Opponent</h3>
            <p className="text-text-secondary text-sm">Your review helps build better player profiles</p>
          </div>

          {/* Player Card */}
          <div className="flex items-center gap-4 p-4 bg-bg-elevated rounded-2xl border border-border">
            <Avatar name={opponent.name} src={opponent.avatarUrl} size="lg" />
            <div>
              <h4 className="font-bold text-lg">{opponent.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                {opponent.skillLevel && <Badge variant={opponent.skillLevel} className="text-[10px]">{opponent.skillLevel}</Badge>}
                {opponent.city && <span className="text-xs text-text-muted">{opponent.city}</span>}
              </div>
            </div>
            <div className="ml-auto text-center">
              <p className="text-3xl font-bold font-display text-warning">{overall}</p>
              <p className="text-[10px] text-text-muted uppercase font-bold">Overall</p>
            </div>
          </div>

          {/* Rating Criteria */}
          <div className="space-y-4">
            {CRITERIA.map(c => (
              <div key={c.key} className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-bg-elevated border border-border flex items-center justify-center shrink-0">
                    <c.icon size={16} className="text-text-secondary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm">{c.label}</p>
                    <p className="text-[10px] text-text-muted">{c.desc}</p>
                  </div>
                </div>
                <StarRating value={ratings[c.key]} onChange={val => setRatings(r => ({...r, [c.key]: val}))} size={22} />
              </div>
            ))}
          </div>

          {/* Tags */}
          <div>
            <p className="text-sm font-bold mb-3">Tags <span className="text-text-muted font-normal">(select up to 5)</span></p>
            <div className="flex flex-wrap gap-2">
              {REVIEW_TAGS.map(tag => (
                <button key={tag} onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${selectedTags.includes(tag) ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text-secondary hover:border-border-strong'}`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <p className="text-sm font-bold mb-2">Comment <span className="text-text-muted font-normal">(optional)</span></p>
            <textarea
              className="w-full bg-bg-elevated border border-border rounded-xl p-4 min-h-[80px] focus:border-accent outline-none text-text-primary resize-none text-sm"
              placeholder="Share a quick note about this player..."
              value={comment} onChange={e => setComment(e.target.value)} maxLength={300}
            />
          </div>

          <div className="flex gap-4">
            <Button variant="secondary" onClick={onClose} className="flex-1">Skip</Button>
            <Button onClick={handleSubmit} loading={loading} icon={Send} className="flex-1">Submit Review</Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default PlayerReviewModal;
