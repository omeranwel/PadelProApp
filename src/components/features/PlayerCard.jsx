import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Zap, MessageSquare, Plus, Trophy, Check, X, TrendingUp, Star } from 'lucide-react';
import { useMatchStore } from '../../store/matchStore';
import toast from 'react-hot-toast';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

const CompatibilityBar = ({ score, label, max = 100 }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs">
      <span className="text-text-muted font-medium">{label}</span>
      <span className="font-bold text-text-primary">{score}{max===100?'%':''}</span>
    </div>
    <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
      <div className="h-full bg-accent rounded-full transition-all duration-700" style={{ width: `${(score/max)*100}%` }} />
    </div>
  </div>
);

const FormDots = ({ form = [] }) => (
  <div className="flex gap-1 items-center">
    {(form||[]).slice(-5).map((r,i)=>(
      <div key={i} className={`w-2 h-2 rounded-full ${r==='W'?'bg-accent':'bg-danger'}`} title={r}/>
    ))}
  </div>
);

const PlayerCard = ({ player, isMatch = false, isRequest = false, isConnected = false, onAccept, onDecline, onChat }) => {
  const { sentRequests, sendRequest } = useMatchStore();
  const hasSent = sentRequests.includes(player.id);

  const handleSend = () => {
    if (hasSent) return;
    sendRequest(player.id);
    toast.success(`Challenge sent to ${player.name}!`);
  };

  const compatibility = player.compatibility;
  const overallScore = compatibility?.overall || (player.matchScore ? Math.round(player.matchScore) : null);
  const breakdown = compatibility?.breakdown || {};

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Card className={`relative overflow-hidden group border-2 transition-all duration-500 flex flex-col h-full
        ${isMatch ? 'border-accent/30 bg-gradient-to-br from-accent/5 to-bg-card shadow-2xl shadow-accent/10'
          : 'border-border hover:border-border-strong'}`}>

        {overallScore && (
          <div className={`absolute top-0 right-0 text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1 z-10
            ${overallScore>=80 ? 'bg-accent text-bg-base' : overallScore>=60 ? 'bg-accent-blue text-white' : 'bg-bg-elevated text-text-muted border-l border-b border-border'}`}>
            <Zap size={10} fill="currentColor" /> {overallScore}% MATCH
          </div>
        )}

        <div className="flex items-start gap-4 mb-4">
          <div className="relative shrink-0">
            <Avatar name={player.name} src={player.avatarUrl} size="xl"
              className={`ring-2 ring-offset-4 ring-offset-bg-card ${isMatch ? 'ring-accent' : 'ring-border'}`} />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full border-4 border-bg-card" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-xl font-display truncate">{player.name}</h3>
              {player.totalWins >= 20 && <Trophy size={14} className="text-warning shrink-0" />}
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant={player.skillLevel}>{(player.skillLevel||'beginner').toUpperCase()}</Badge>
              {player.skillRating && <span className="text-xs font-mono font-bold text-accent border border-accent/20 bg-accent/5 px-2 py-0.5 rounded-full">{player.skillRating?.toFixed(1)}</span>}
              {player.preferredArea && <span className="text-xs text-text-muted flex items-center gap-1"><MapPin size={10}/>{player.preferredArea}</span>}
            </div>
            {player.bio && <p className="text-xs text-text-secondary line-clamp-2 italic leading-relaxed">"{player.bio}"</p>}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-bg-elevated p-2 rounded-xl text-center">
            <span className="text-[9px] text-text-muted font-bold uppercase block mb-1">W/L</span>
            <span className="font-bold text-sm font-mono text-success">{player.totalWins||player.matchesWon||0}</span>
            <span className="text-text-muted">/</span>
            <span className="font-bold text-sm font-mono text-danger">{player.totalLosses||player.matchesLost||0}</span>
          </div>
          <div className="bg-bg-elevated p-2 rounded-xl text-center">
            <span className="text-[9px] text-text-muted font-bold uppercase block mb-1">Win%</span>
            <span className="font-bold text-sm text-accent">{(player.winRate||50).toFixed(0)}%</span>
          </div>
          <div className="bg-bg-elevated p-2 rounded-xl text-center">
            <span className="text-[9px] text-text-muted font-bold uppercase block mb-1">Style</span>
            <span className="font-bold text-sm text-text-primary capitalize" title={player.playingStyle||'—'}>{(player.playingStyle||'—').slice(0,7)}</span>
          </div>
        </div>

        {/* Recent Form */}
        {(player.recentForm||[]).length > 0 && (
          <div className="flex items-center gap-2 mb-4 px-1">
            <span className="text-[9px] font-bold uppercase text-text-muted tracking-widest">Form</span>
            <FormDots form={player.recentForm} />
          </div>
        )}

        {/* Compatibility Breakdown (when matched) */}
        {isMatch && overallScore && Object.keys(breakdown).length > 0 && (
          <div className="space-y-2 mb-4 p-3 bg-bg-elevated rounded-xl border border-accent/10">
            <h5 className="text-[9px] font-bold uppercase tracking-widest text-text-muted mb-3 flex items-center gap-1"><Star size={10}/>Compatibility</h5>
            {breakdown.skill !== undefined && <CompatibilityBar label="Skill Match" score={breakdown.skill} />}
            {breakdown.schedule !== undefined && <CompatibilityBar label="Schedule" score={breakdown.schedule} />}
            {breakdown.style !== undefined && <CompatibilityBar label="Play Style" score={breakdown.style} />}
          </div>
        )}

        {/* Availability */}
        {(player.availability||[]).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {(player.availability||[]).slice(0,4).map((avail, i) => (
              <div key={i} className="px-2 py-0.5 bg-bg-card border border-border rounded-md text-[10px] font-bold text-text-secondary">
                {avail.day||avail} {avail.slots?`(${avail.slots[0]})`:''}</div>
            ))}
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-border flex gap-2">
          {isRequest ? (
            <>
              <Button className="flex-1 !bg-success text-white" icon={Check} onClick={onAccept} size="sm">Accept</Button>
              <Button variant="outline" className="flex-1 hover:text-danger hover:border-danger" icon={X} onClick={onDecline} size="sm">Decline</Button>
            </>
          ) : isConnected ? (
            <Button className="w-full !bg-accent-blue" icon={MessageSquare} onClick={() => onChat(player)}>Chat Now</Button>
          ) : (
            <>
              <Button variant="secondary" size="sm" className="flex-1" icon={MessageSquare} onClick={() => onChat && onChat(player)}>Chat</Button>
              <Button size="sm" className={`flex-1 ${hasSent ? '!bg-transparent border-2 !border-accent !text-accent cursor-default' : isMatch ? '!bg-accent !text-bg-base' : ''}`}
                icon={hasSent ? Check : Plus} onClick={handleSend}>
                {hasSent ? 'Sent ✓' : 'Challenge'}
              </Button>
            </>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default PlayerCard;
