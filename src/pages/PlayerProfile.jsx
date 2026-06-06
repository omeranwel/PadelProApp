import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Trophy, TrendingUp, Zap, MessageCircle, UserPlus, UserCheck, ArrowLeft, Calendar, Shield } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export default function PlayerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [friendLoading, setFriendLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.get(`/players/${id}`);
        setData(res);
      } catch (err) {
        toast.error('Failed to load profile');
        navigate('/players');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [id, navigate]);

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-full min-h-[50vh]">
          <Spinner size="lg" />
        </div>
      </PageWrapper>
    );
  }

  if (!data) return null;

  const { player, recentMatches, friendshipStatus, friendRequestId, isOwnProfile } = data;

  async function handleFriendAction() {
    if (friendLoading) return;
    setFriendLoading(true);

    try {
      if (friendshipStatus === 'none') {
        const res = await api.post('/friends/request', { targetUserId: player.id });
        setData(d => ({ ...d, friendshipStatus: 'request_sent', friendRequestId: res.request.id }));
        toast.success(`Friend request sent to ${player.name}`);
      } else if (friendshipStatus === 'request_sent') {
        await api.delete(`/friends/request/${friendRequestId}`);
        setData(d => ({ ...d, friendshipStatus: 'none', friendRequestId: null }));
        toast.success('Request cancelled');
      } else if (friendshipStatus === 'request_received') {
        await api.patch(`/friends/request/${friendRequestId}`, { action: 'accept' });
        setData(d => ({ ...d, friendshipStatus: 'friends' }));
        toast.success(`You are now friends with ${player.name}`);
      } else if (friendshipStatus === 'friends') {
        if (window.confirm(`Remove ${player.name} from friends?`)) {
          await api.delete(`/friends/${player.id}`);
          setData(d => ({ ...d, friendshipStatus: 'none' }));
          toast.success('Friend removed');
        }
      }
    } catch (err) {
      toast.error(err.message || 'Action failed');
    } finally {
      setFriendLoading(false);
    }
  }

  const btnConfig = {
    none: { label: '+ Add Friend', className: 'bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30' },
    request_sent: { label: '✓ Requested', className: 'bg-transparent border border-accent text-accent hover:bg-red-500/10 hover:border-red-500 hover:text-red-500' },
    request_received: { label: '✓ Accept Request', className: 'bg-blue-500 text-white animate-pulse' },
    friends: { label: '✓ Friends', className: 'bg-transparent border border-white/20 text-text-secondary hover:border-red-500 hover:text-red-500' },
  }[friendshipStatus] || { label: '...', className: 'bg-white/5 text-text-muted' };

  return (
    <PageWrapper bg="/bg-courts.png">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-text-muted hover:text-white mb-6 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info Column */}
          <div className="md:col-span-1 space-y-6">
            <Card className="p-6 flex flex-col items-center text-center">
              <Avatar name={player.name} src={player.avatarUrl} size="xl" className="ring-4 ring-white/10 mb-4" />
              <h1 className="text-2xl font-bold text-white mb-1">{player.name}</h1>
              <p className="text-sm text-text-muted flex items-center gap-1 mb-4">
                <MapPin size={14} /> {player.city || 'No city set'}
              </p>

              <div className="flex gap-2 mb-6 w-full">
                {!isOwnProfile && (
                  <>
                    <Button variant="secondary" className="flex-1 text-xs px-2" icon={MessageCircle} onClick={() => navigate(`/chat?userId=${player.id}`)}>
                      Message
                    </Button>
                    <button
                      className={`flex-1 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${btnConfig.className} ${friendLoading ? 'opacity-70' : ''}`}
                      onClick={handleFriendAction} disabled={friendLoading}
                      onMouseEnter={(e) => { if (friendshipStatus === 'request_sent') e.currentTarget.innerText = 'Cancel?'; else if (friendshipStatus === 'friends') e.currentTarget.innerText = 'Remove'; }}
                      onMouseLeave={(e) => { if (friendshipStatus === 'request_sent') e.currentTarget.innerText = btnConfig.label; else if (friendshipStatus === 'friends') e.currentTarget.innerText = btnConfig.label; }}
                    >
                      {friendLoading ? <Spinner size="xs" /> : btnConfig.label}
                    </button>
                  </>
                )}
                {isOwnProfile && (
                  <Button variant="secondary" className="w-full" onClick={() => navigate('/settings')}>
                    Edit Profile
                  </Button>
                )}
              </div>

              <div className="w-full border-t border-white/10 pt-4 grid grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-xs text-text-muted mb-1 uppercase tracking-wider">Skill Level</p>
                  <p className="font-semibold text-white capitalize">{player.skillLevel}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-1 uppercase tracking-wider">Rating</p>
                  <p className="font-semibold text-accent font-mono">{player.skillRating?.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-1 uppercase tracking-wider">Style</p>
                  <p className="font-semibold text-white capitalize">{player.playingStyle || 'Any'}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-1 uppercase tracking-wider">Position</p>
                  <p className="font-semibold text-white capitalize">{player.preferredPosition || 'Any'}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-1 uppercase tracking-wider">Hand</p>
                  <p className="font-semibold text-white capitalize">{player.dominantHand || 'Any'}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Stats & Matches Column */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-accent" /> Player Stats
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 flex flex-col items-center justify-center text-center">
                <Trophy size={24} className="text-yellow-500 mb-2" />
                <p className="text-2xl font-bold text-white">{player.stats.wins}</p>
                <p className="text-xs text-text-muted uppercase tracking-wider">Wins</p>
              </Card>
              <Card className="p-4 flex flex-col items-center justify-center text-center">
                <TrendingUp size={24} className="text-blue-500 mb-2" />
                <p className="text-2xl font-bold text-white">{player.stats.winRate}%</p>
                <p className="text-xs text-text-muted uppercase tracking-wider">Win Rate</p>
              </Card>
              <Card className="p-4 flex flex-col items-center justify-center text-center">
                <Shield size={24} className="text-accent/60 mb-2" />
                <p className="text-2xl font-bold text-white">{player.stats.totalMatches}</p>
                <p className="text-xs text-text-muted uppercase tracking-wider">Total Matches</p>
              </Card>
            </div>

            <h2 className="text-xl font-bold text-white mt-8 flex items-center gap-2">
              <Calendar size={20} className="text-accent" /> Recent Matches
            </h2>
            {recentMatches.length === 0 ? (
              <Card className="p-8 text-center border-dashed border-white/20">
                <p className="text-text-muted">No completed matches found.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {recentMatches.map(match => {
                  const isTeam1 = match.team1Player1Id === player.id || match.team1Player2Id === player.id;
                  const won = (isTeam1 && match.winnerId === 'team1') || (!isTeam1 && match.winnerId === 'team2');
                  
                  return (
                    <Card key={match.id} className="p-4 flex items-center gap-4">
                      <div className={`w-1.5 h-12 rounded-full ${won ? 'bg-success' : 'bg-red-500'}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${won ? 'bg-success/20 text-success' : 'bg-red-500/20 text-red-500'}`}>
                            {won ? 'VICTORY' : 'DEFEAT'}
                          </span>
                          <span className="text-xs text-text-muted">
                            {new Date(match.completedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-white">
                          {match.booking?.court?.club?.name || 'Local Club'} - {match.booking?.court?.name || 'Court'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold font-mono text-white">
                          {match.team1SetsScore} - {match.team2SetsScore}
                        </p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
