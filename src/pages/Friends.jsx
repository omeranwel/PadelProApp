import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Search, MessageSquare, ChevronRight, UserCheck, X } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { api } from '../services/api';
import { playerService } from '../services/playerService';
import { chatService } from '../services/chatService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Friends = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        api.get('/friends'),
        playerService.getRequests()
      ]);
      setFriends(friendsRes.friends || []);
      setRequests(requestsRes.requests || []);
    } catch (err) {
      toast.error('Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAccept = async (requestId) => {
    try {
      await playerService.updateRequest(requestId, 'accepted');
      toast.success('Request accepted!');
      loadData();
    } catch {
      toast.error('Failed to accept request');
    }
  };

  const handleDecline = async (requestId) => {
    try {
      await playerService.cancelRequest(requestId);
      toast.success('Request declined');
      loadData();
    } catch {
      toast.error('Failed to decline request');
    }
  };

  const handleRemoveFriend = async (friendId) => {
    if (!window.confirm('Are you sure you want to remove this friend?')) return;
    try {
      await api.delete(`/friends/${friendId}`);
      toast.success('Friend removed');
      loadData();
    } catch {
      toast.error('Failed to remove friend');
    }
  };

  const handleChat = async (playerId) => {
    try {
      const res = await chatService.createConversation(playerId);
      const convoId = res.id || res.conversation?.id;
      navigate(`/chat?conversation=${convoId}`);
    } catch {
      toast.error('Could not start chat');
    }
  };

  const filteredFriends = friends.filter(f => f.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <PageWrapper bg="/bg-player.png">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-bold font-display mb-2">Network</h1>
            <p className="text-text-secondary">Manage your connections and incoming match requests.</p>
          </div>
          <Button icon={UserPlus} onClick={() => navigate('/matches')}>Find Players</Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-bg-elevated p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'friends' ? 'bg-bg-card text-accent-blue shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
          >
            My Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'requests' ? 'bg-bg-card text-accent-blue shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
          >
            Pending Requests 
            {requests.length > 0 && <span className="ml-2 bg-accent-orange text-white px-2 py-0.5 rounded-full text-xs">{requests.length}</span>}
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><Spinner /></div>
        ) : activeTab === 'friends' ? (
          <div className="space-y-6">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input 
                type="text" 
                placeholder="Search friends..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-bg-card border border-border rounded-2xl py-3 pl-10 pr-4 text-sm focus:border-accent outline-none transition-colors"
              />
            </div>

            {filteredFriends.length === 0 ? (
              <div className="text-center py-20 bg-bg-card border border-dashed border-border rounded-3xl">
                <Users size={40} className="mx-auto mb-4 text-text-muted opacity-30" />
                <h4 className="text-xl font-bold mb-2">No friends found</h4>
                <p className="text-text-secondary mb-6">You haven't connected with anyone yet.</p>
                <Button onClick={() => navigate('/matches')} variant="outline">Browse Players</Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredFriends.map(friend => (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={friend.id}>
                    <Card className="p-4 flex items-center justify-between gap-4 hover:border-border-strong transition-colors group">
                      <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => navigate(`/players/${friend.id}`)}>
                        <Avatar name={friend.name} src={friend.avatarUrl} size="lg" />
                        <div>
                          <h4 className="font-bold text-lg group-hover:text-accent-blue transition-colors">{friend.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            {friend.skillLevel && <Badge variant={friend.skillLevel} className="!text-[10px] !py-0 !px-1.5">{friend.skillLevel.toUpperCase()}</Badge>}
                            {friend.city && <span className="text-xs text-text-muted">{friend.city}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" icon={MessageSquare} onClick={() => handleChat(friend.id)}>Message</Button>
                        <Button size="sm" variant="ghost" onClick={() => handleRemoveFriend(friend.id)} className="text-text-muted hover:text-danger hover:bg-danger/10 px-2"><X size={16}/></Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="text-center py-20 bg-bg-card border border-dashed border-border rounded-3xl">
                <UserCheck size={40} className="mx-auto mb-4 text-text-muted opacity-30" />
                <h4 className="text-xl font-bold mb-2">No pending requests</h4>
                <p className="text-text-secondary">You're all caught up!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {requests.map(req => (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={req.id}>
                    <Card className="p-4 flex items-center justify-between gap-4 border-accent/20 bg-accent/5">
                      <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => navigate(`/players/${req.sender.id}`)}>
                        <Avatar name={req.sender.name} src={req.sender.avatarUrl} size="lg" />
                        <div>
                          <h4 className="font-bold text-lg">{req.sender.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            {req.sender.skillLevel && <Badge variant={req.sender.skillLevel} className="!text-[10px] !py-0 !px-1.5">{req.sender.skillLevel.toUpperCase()}</Badge>}
                            {req.sender.city && <span className="text-xs text-text-muted">{req.sender.city}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" className="!bg-success hover:!bg-success/90" onClick={() => handleAccept(req.id)}>Accept</Button>
                        <Button size="sm" variant="outline" className="hover:text-danger hover:border-danger" onClick={() => handleDecline(req.id)}>Decline</Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Friends;
