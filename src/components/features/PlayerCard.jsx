import React from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Zap, MessageSquare, Plus, ChevronRight, Trophy, Check, X } from 'lucide-react';
import { useMatchStore } from '../../store/matchStore';
import toast from 'react-hot-toast';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

const PlayerCard = ({ player, isMatch = false, isRequest = false, isConnected = false, onAccept, onDecline, onChat }) => {
  const { sentRequests, sendRequest } = useMatchStore();
  const hasSent = sentRequests.includes(player.id);

  const handleSend = () => {
    if (hasSent) return;
    sendRequest(player.id);
    toast.success(`Match request sent to ${player.name}!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <Card className={`
        relative overflow-hidden group border-2 transition-all duration-500 flex flex-col h-full
        ${isMatch ? 'border-ai-purple/30 bg-gradient-to-br from-ai-purple/5 to-bg-card shadow-2xl shadow-ai-purple/10' : 'border-border hover:border-border-strong'}
      `}>
        {isMatch && (
          <div className="absolute top-0 right-0 bg-ai-purple text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1 z-10">
            <Zap size={10} fill="currentColor" /> 98% AI MATCH
          </div>
        )}

        <div className="flex items-start gap-5 mb-4">
          <div className="relative">
            <Avatar name={player.name} size="xl" className={`ring-2 ring-offset-4 ring-offset-bg-card ${isMatch ? 'ring-ai-purple' : 'ring-border'}`} />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full border-4 border-bg-card" />
          </div>
          
          <div className="flex-1 min-w-0">
             <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold font-display truncate">{player.name}</h3>
                {player.skillRank === 3 && <Trophy size={16} className="text-warning" />}
             </div>
             <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant={player.skillLevel}>{player.skillLevel.toUpperCase()}</Badge>
                <span className="text-xs text-text-muted font-bold flex items-center gap-1">
                  <MapPin size={12} /> {player.distance}km away
                </span>
             </div>
             <p className="text-sm text-text-secondary line-clamp-2 italic leading-relaxed">
               "{player.bio}"
             </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
           <div className="bg-bg-elevated p-2 rounded-xl text-center">
              <span className="text-[10px] text-text-muted font-bold uppercase block mb-1">Matches</span>
              <span className="font-bold text-text-primary">{player.matchesPlayed}</span>
           </div>
           <div className="bg-bg-elevated p-2 rounded-xl text-center">
              <span className="text-[10px] text-text-muted font-bold uppercase block mb-1">Win Rate</span>
              <span className="font-bold text-success">{player.winRate}%</span>
           </div>
           <div className="bg-bg-elevated p-2 rounded-xl text-center">
              <span className="text-[10px] text-text-muted font-bold uppercase block mb-1">Role</span>
              <span className="font-bold text-text-primary">{player.preferredPosition}</span>
           </div>
        </div>

        <div className="space-y-3 mb-6">
           <div className="flex flex-wrap gap-2">
              {player.availability.map((avail, i) => (
                <div key={i} className="px-2 py-1 bg-bg-card border border-border rounded-md text-[10px] font-bold text-text-secondary">
                  {avail.day} ({avail.slots[0]})
                </div>
              ))}
           </div>
        </div>

        <div className="mt-auto pt-4 border-t border-border flex gap-3">
           {isRequest ? (
             <>
               <Button className="flex-1 !bg-success text-white" icon={Check} onClick={onAccept}>Accept</Button>
               <Button variant="outline" className="flex-1 hover:text-danger hover:border-danger" icon={X} onClick={onDecline}>Decline</Button>
             </>
           ) : isConnected ? (
             <Button className="w-full !bg-accent-blue" icon={MessageSquare} onClick={() => onChat(player)}>Chat Now</Button>
           ) : (
             <>
               <Button variant="secondary" size="sm" className="flex-1" icon={MessageSquare} onClick={() => onChat(player)}>Chat</Button>
               <Button 
                 size="sm" 
                 className={`flex-1 ${hasSent ? '!bg-transparent border-2 !border-success !text-success opacity-100 cursor-default' : isMatch ? '!bg-ai-purple' : ''}`} 
                 icon={hasSent ? Check : Plus}
                 onClick={handleSend}
               >
                 {hasSent ? 'Request Sent ✓' : 'Challenge'}
               </Button>
             </>
           )}
        </div>
      </Card>
    </motion.div>
  );
};

export default PlayerCard;
