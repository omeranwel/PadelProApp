import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, MessageSquare, Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useNavigate, useLocation } from 'react-router-dom';
import { chatService } from '../services/chatService';
import { getSocket } from '../services/socketService';
import { useAuthStore } from '../store/authStore';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const messagesEndRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [search, setSearch] = useState('');
  const [activeConvoId, setActiveConvoId] = useState(
    new URLSearchParams(location.search).get('conversation') || null
  );
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const activeConvo = conversations.find(c => c.id === activeConvoId) || null;

  // Load conversations
  useEffect(() => {
    setLoadingConvos(true);
    chatService.getConversations()
      .then(res => setConversations(res.data || res))
      .catch(() => toast.error('Failed to load conversations'))
      .finally(() => setLoadingConvos(false));
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (!activeConvoId) return;
    setLoadingMessages(true);
    setMessages([]);
    chatService.getMessages(activeConvoId)
      .then(res => setMessages(res.data || res))
      .catch(() => toast.error('Failed to load messages'))
      .finally(() => setLoadingMessages(false));
  }, [activeConvoId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Socket listener for real-time incoming messages
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleMsg = (msg) => {
      if (msg.conversationId === activeConvoId) {
        setMessages(prev => [...prev, msg]);
      }
      // Bubble the conversation to top and update last message preview
      setConversations(prev => {
        const arr = [...prev];
        const idx = arr.findIndex(c => c.id === msg.conversationId);
        if (idx !== -1) {
          const [convo] = arr.splice(idx, 1);
          arr.unshift({
            ...convo,
            lastMessage: { content: msg.content, createdAt: msg.createdAt, isRead: msg.conversationId === activeConvoId },
            unreadCount: msg.conversationId === activeConvoId ? 0 : (convo.unreadCount || 0) + 1
          });
        }
        return arr;
      });
    };

    socket.on('new_message', handleMsg);
    return () => socket.off('new_message', handleMsg);
  }, [activeConvoId]);

  const handleSelectConvo = (id) => {
    setActiveConvoId(id);
    // Clear unread badge for this convo
    setConversations(prev =>
      prev.map(c => c.id === id ? { ...c, unreadCount: 0 } : c)
    );
  };

  const handleSend = async () => {
    if (!message.trim() || !activeConvoId || sending) return;
    const text = message.trim();
    setMessage('');
    setSending(true);
    try {
      const res = await chatService.sendMessage(activeConvoId, text);
      const sent = res.data || res;
      setMessages(prev => [...prev, sent]);
      // Update last message preview in sidebar
      setConversations(prev =>
        prev.map(c => c.id === activeConvoId
          ? { ...c, lastMessage: { content: text, createdAt: new Date().toISOString(), isRead: true } }
          : c
        )
      );
    } catch {
      toast.error('Failed to send message');
      setMessage(text); // restore message if failed
    } finally {
      setSending(false);
    }
  };

  const filteredConvos = conversations.filter(c =>
    !search || c.partner?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return '';
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24" style={{ height: 'calc(100vh - 120px)' }}>
        <div className="flex h-full gap-6">

          {/* ── Sidebar: Conversation List ── */}
          <div className={`${activeConvoId ? 'hidden md:flex' : 'flex'} w-full md:w-[320px] lg:w-[360px] bg-bg-card rounded-3xl border border-border flex-col overflow-hidden shrink-0`}>
            <div className="p-5 border-b border-border">
              <h2 className="text-2xl font-bold font-display mb-4 text-text-primary">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={15} />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-bg-elevated border border-border rounded-xl py-2.5 pl-9 pr-4 text-sm focus:border-accent outline-none text-text-primary placeholder-text-muted"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
              {loadingConvos ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="p-4 flex items-center gap-3 border-b border-border animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-bg-elevated shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-bg-elevated rounded w-28" />
                      <div className="h-2 bg-bg-elevated rounded w-40" />
                    </div>
                  </div>
                ))
              ) : filteredConvos.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center px-6">
                  <MessageSquare size={36} className="text-text-muted opacity-40 mb-3" />
                  <p className="font-bold text-text-primary mb-1">No conversations yet</p>
                  <p className="text-xs text-text-muted mb-4">Accept a match request to start chatting</p>
                  <Button size="sm" onClick={() => navigate('/matches')}>Find Partners</Button>
                </div>
              ) : (
                filteredConvos.map(convo => (
                  <div
                    key={convo.id}
                    onClick={() => handleSelectConvo(convo.id)}
                    className={`p-4 flex items-center gap-3 cursor-pointer transition-colors border-b border-border ${activeConvoId === convo.id ? 'bg-accent/5 border-l-2 border-l-accent' : 'hover:bg-bg-elevated'}`}
                  >
                    <div className="relative shrink-0">
                      <Avatar name={convo.partner?.name} src={convo.partner?.avatarUrl} size="md" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <h5 className="font-bold text-sm text-text-primary truncate">{convo.partner?.name || 'Unknown'}</h5>
                        <span className="text-[10px] text-text-muted shrink-0 ml-2">
                          {formatTime(convo.lastMessage?.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-text-secondary truncate">
                          {convo.lastMessage?.content || 'No messages yet'}
                        </p>
                        {(convo.unreadCount > 0) && (
                          <span className="shrink-0 w-5 h-5 rounded-full bg-accent text-bg-base text-[10px] font-bold flex items-center justify-center">
                            {convo.unreadCount > 9 ? '9+' : convo.unreadCount}
                          </span>
                        )}
                      </div>
                      {convo.partner?.skillLevel && (
                        <Badge variant={convo.partner.skillLevel} className="!text-[8px] !py-0 !px-1 mt-1 inline-block">
                          {convo.partner.skillLevel.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── Main Chat Area ── */}
          {activeConvoId && activeConvo ? (
            <Card className="flex-1 flex flex-col p-0 overflow-hidden h-full">
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-border bg-bg-card flex justify-between items-center shrink-0 z-10">
                <div className="flex items-center gap-3">
                  <button onClick={() => setActiveConvoId(null)} className="md:hidden p-2 text-text-muted hover:text-text-primary transition-colors mr-1">
                    <ArrowLeft size={20} />
                  </button>
                  <div className="relative">
                    <Avatar name={activeConvo.partner?.name} src={activeConvo.partner?.avatarUrl} size="md" />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary">{activeConvo.partner?.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      {activeConvo.partner?.skillLevel && (
                        <Badge variant={activeConvo.partner.skillLevel} className="!text-[9px] !py-0 !px-1.5">
                          {activeConvo.partner.skillLevel.toUpperCase()}
                        </Badge>
                      )}
                      {activeConvo.partner?.lastActive && (
                        <span className="text-text-muted">{activeConvo.partner.lastActive}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 text-text-muted">
                  <button className="p-2 hover:bg-bg-elevated rounded-xl transition-colors"><Phone size={18} /></button>
                  <button className="p-2 hover:bg-bg-elevated rounded-xl transition-colors"><Video size={18} /></button>
                  <button className="p-2 hover:bg-bg-elevated rounded-xl transition-colors"><MoreVertical size={18} /></button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {loadingMessages ? (
                  <div className="space-y-4">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                        <div className={`h-10 rounded-2xl animate-pulse bg-bg-elevated ${i % 2 === 0 ? 'w-48' : 'w-36'}`} />
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageSquare size={36} className="text-text-muted opacity-30 mb-3" />
                    <p className="text-text-secondary font-medium">No messages yet</p>
                    <p className="text-xs text-text-muted mt-1">Say hello to {activeConvo.partner?.name}! 👋</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, i) => {
                      const isMe = msg.senderId === user?.id;
                      const showTime = i === 0 || 
                        new Date(msg.createdAt) - new Date(messages[i - 1]?.createdAt) > 5 * 60 * 1000;
                      return (
                        <React.Fragment key={msg.id || i}>
                          {showTime && msg.createdAt && (
                            <div className="text-center">
                              <span className="text-[10px] font-bold text-text-muted bg-bg-elevated px-3 py-1 rounded-full border border-border">
                                {formatTime(msg.createdAt)}
                              </span>
                            </div>
                          )}
                          <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            {!isMe && (
                              <Avatar name={activeConvo.partner?.name} src={activeConvo.partner?.avatarUrl} size="sm" className="mr-2 mt-1 shrink-0 self-end" />
                            )}
                            <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm shadow-sm ${isMe
                              ? 'bg-accent text-bg-base rounded-tr-sm'
                              : 'bg-bg-elevated border border-border text-text-primary rounded-tl-sm'
                            }`}>
                              {msg.content || msg.text}
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <div className="p-3 sm:p-4 border-t border-border bg-bg-card flex gap-3 items-center shrink-0">
                <input
                  type="text"
                  placeholder={`Message ${activeConvo.partner?.name || ''}...`}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  className="flex-1 bg-bg-elevated border border-border rounded-2xl px-4 py-3 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || sending}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${message.trim() && !sending ? 'bg-accent text-bg-base hover:bg-accent/90 shadow-lg shadow-accent/20' : 'bg-bg-elevated text-text-muted cursor-not-allowed'}`}
                >
                  <Send size={16} />
                </button>
              </div>
            </Card>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-bg-elevated rounded-3xl flex items-center justify-center mx-auto mb-5 border border-border">
                  <MessageSquare size={32} className="text-text-muted" />
                </div>
                <h3 className="font-bold text-xl font-display text-text-primary mb-2">Select a Conversation</h3>
                <p className="text-sm text-text-secondary max-w-xs">
                  {conversations.length === 0
                    ? 'No conversations yet — accept a match request to start chatting.'
                    : 'Choose a conversation from the list to start messaging.'}
                </p>
                {conversations.length === 0 && (
                  <Button className="mt-5" onClick={() => navigate('/matches')}>Find Match Partners</Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default Chat;
