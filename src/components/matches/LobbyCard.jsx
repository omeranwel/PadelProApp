import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Star, Users, Crown, Globe, Lock, Check, X, UserCheck } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { lobbyService } from '../../services/lobbyService';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  WAITING:   'bg-warning/10 text-warning border-warning/20',
  FULL:      'bg-accent/10 text-accent border-accent/20',
  CONFIRMED: 'bg-success/10 text-success border-success/20',
  CANCELLED: 'bg-danger/10 text-danger border-danger/20',
  COMPLETED: 'bg-white/5 text-text-muted border-white/10',
  BOOKING:   'bg-accent-blue/10 text-accent-blue border-accent-blue/20',
};

const SlotBadge = ({ player, slot, isOrganizer }) => (
  <div className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${player ? 'bg-white/5 border-white/10' : 'border-dashed border-white/15'}`}>
    {player ? (
      <>
        <div className="relative">
          <Avatar name={player.user?.name || player.name} src={player.user?.avatarUrl || player.avatarUrl} size="sm" />
          {isOrganizer && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-warning rounded-full flex items-center justify-center">
              <Crown size={8} className="text-bg-base" />
            </div>
          )}
        </div>
        <p className="text-[10px] font-semibold text-white text-center truncate w-14">
          {player.user?.name?.split(' ')[0] || player.name?.split(' ')[0]}
        </p>
        <span className="text-[9px] text-text-muted font-mono">
          {(player.user?.skillRating || player.skillRating)?.toFixed(1)}
        </span>
      </>
    ) : (
      <>
        <div className="w-8 h-8 rounded-full bg-white/5 border-2 border-dashed border-white/15 flex items-center justify-center text-text-muted">
          <span className="text-xs font-bold">{slot}</span>
        </div>
        <p className="text-[10px] text-text-muted">Open</p>
      </>
    )}
  </div>
);

export default function LobbyCard({ lobby, viewAs = 'browser', onRefresh }) {
  const { user: currentUser } = useAuthStore();
  const filledSlots = lobby.confirmedPlayers || [];
  const openSlots = 4 - filledSlots.length;
  const isFull = openSlots === 0;
  const progress = (filledSlots.length / 4) * 100;

  const handleAcceptInvite = async () => {
    const invite = lobby.pendingInvite;
    if (!invite) return;
    try {
      await lobbyService.respondToInvite(invite.id, 'accept');
      toast.success('🎾 You joined the match!');
      onRefresh?.();
    } catch (err) { toast.error(err.message); }
  };

  const handleDeclineInvite = async () => {
    const invite = lobby.pendingInvite;
    if (!invite) return;
    try {
      await lobbyService.respondToInvite(invite.id, 'decline');
      toast.success('Invite declined');
      onRefresh?.();
    } catch (err) { toast.error(err.message); }
  };

  const handleRequestJoin = async () => {
    try {
      await lobbyService.requestJoin(lobby.id);
      toast.success('Request sent to organizer!');
      onRefresh?.();
    } catch (err) { toast.error(err.message); }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel this match? All players will be notified.')) return;
    try {
      await lobbyService.cancel(lobby.id);
      toast.success('Match cancelled');
      onRefresh?.();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }} transition={{ duration: 0.3 }}>
      <Card className="overflow-hidden flex flex-col h-full relative">
        {/* Mode ribbon */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${lobby.mode === 'PRIVATE' ? 'bg-gradient-to-r from-accent to-accent-blue' : 'bg-gradient-to-r from-accent-blue to-purple-500'}`} />

        {/* Header */}
        <div className="p-4 pb-0 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Avatar name={lobby.organizer?.name} src={lobby.organizer?.avatarUrl} size="sm" />
            <div>
              <p className="text-xs font-semibold text-white">{lobby.organizer?.name}</p>
              <p className="text-[10px] text-text-muted">Organizer</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${lobby.mode === 'PRIVATE' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-accent-blue/10 text-accent-blue border-accent-blue/20'}`}>
              {lobby.mode === 'PRIVATE' ? <Lock size={9} /> : <Globe size={9} />}
              {lobby.mode === 'PRIVATE' ? 'Private' : 'Open'}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[lobby.status] || STATUS_STYLES.WAITING}`}>
              {lobby.status}
            </span>
          </div>
        </div>

        {/* 4-Slot grid */}
        <div className="p-4 grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map(slot => {
            const player = filledSlots.find(p => p.slot === slot);
            return (
              <SlotBadge key={slot} slot={slot} player={player} isOrganizer={slot === 1} />
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="px-4">
          <div className="flex items-center justify-between text-[10px] text-text-muted mb-1">
            <span>{filledSlots.length}/4 players</span>
            <span>{openSlots} slot{openSlots !== 1 ? 's' : ''} remaining</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${isFull ? 'bg-accent' : 'bg-accent-blue'}`} style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Details */}
        <div className="px-4 py-3 flex flex-wrap gap-x-4 gap-y-1.5">
          {lobby.preferredDate && (
            <span className="flex items-center gap-1 text-xs text-text-secondary">
              <Calendar size={11} className="text-accent" />
              {new Date(lobby.preferredDate).toLocaleDateString()}
            </span>
          )}
          {lobby.preferredTimeSlot && (
            <span className="flex items-center gap-1 text-xs text-text-secondary capitalize">
              <Clock size={11} className="text-accent" />
              {lobby.preferredTimeSlot}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-text-secondary">
            <MapPin size={11} className="text-accent" />
            {lobby.city}
          </span>
          <span className="flex items-center gap-1 text-xs text-text-secondary">
            <Star size={11} className="text-warning" />
            {lobby.skillLevelMin}–{lobby.skillLevelMax} rating
          </span>
        </div>

        {lobby.message && (
          <p className="px-4 text-xs text-text-muted italic line-clamp-2 mb-1">"{lobby.message}"</p>
        )}

        {/* Actions */}
        <div className="p-4 pt-2 mt-auto flex flex-col gap-2 border-t border-white/5">

          {/* Organizer: join requests badge */}
          {viewAs === 'organizer' && (lobby.joinRequests?.length || 0) > 0 && (
            <div className="flex items-center gap-2 text-xs text-accent-blue font-semibold">
              <Users size={12} /> {lobby.joinRequests.length} pending join request{lobby.joinRequests.length !== 1 ? 's' : ''}
            </div>
          )}

          {/* Organizer: book court when full */}
          {viewAs === 'organizer' && lobby.status === 'FULL' && (
            <Button size="sm" className="w-full">🏟️ Book a Court</Button>
          )}

          {/* Organizer: cancel */}
          {viewAs === 'organizer' && !['CANCELLED', 'COMPLETED', 'CONFIRMED'].includes(lobby.status) && (
            <Button size="sm" variant="ghost" onClick={handleCancel} className="w-full text-danger hover:text-danger">
              Cancel Match
            </Button>
          )}

          {/* Invitee: accept/decline */}
          {viewAs === 'invitee' && (
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 !bg-success/80" icon={Check} onClick={handleAcceptInvite}>Accept</Button>
              <Button size="sm" variant="outline" className="flex-1 hover:text-danger hover:border-danger" icon={X} onClick={handleDeclineInvite}>Decline</Button>
            </div>
          )}

          {/* Browser: request to join open lobby */}
          {viewAs === 'browser' && !isFull && lobby.mode === 'OPEN' && (
            <Button size="sm" className="w-full" icon={UserCheck} onClick={handleRequestJoin}>
              Request to Join
            </Button>
          )}

          {/* Member: status */}
          {viewAs === 'member' && (
            <div className="flex items-center gap-2 text-xs text-success font-semibold">
              <Check size={12} /> You're in this match
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
