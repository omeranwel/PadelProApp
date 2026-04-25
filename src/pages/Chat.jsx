import React, { useState } from 'react';
import { Search, Send, MapPin, User, MoreVertical, Phone, Video, MessageSquare } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useNavigate, useLocation } from 'react-router-dom';
import { chatService } from '../services/chatService';
import { getSocket } from '../services/socketService';
import { useAuthStore } from '../store/authStore';
import { formatDistanceToNow } from 'date-fns';

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [activeConvoId, setActiveConvoId] = useState(new URLSearchParams(location.search).get('conversation') || null);
  const activeConvo = conversations.find(c => c.id === activeConvoId) || null;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  React.useEffect(() => {
    chatService.getConversations().then(res => {
      setConversations(res.data || res);
    });
  }, []);

  React.useEffect(() => {
    if (activeConvoId) {
      chatService.getMessages(activeConvoId).then(res => {
        setMessages((res.data || res).reverse()); // newest last
      });
    }
  }, [activeConvoId]);

  React.useEffect(() => {
    const socket = getSocket();
    if (socket) {
      const handleMsg = (msg) => {
        if (msg.conversationId === activeConvoId) {
          setMessages(prev => [...prev, msg]);
        }
        setConversations(prev => {
          const arr = [...prev];
          const idx = arr.findIndex(c => c.id === msg.conversationId);
          if (idx !== -1) {
            const [c] = arr.splice(idx, 1);
            arr.unshift(c);
          }
          return arr;
        });
      };
      socket.on('new_message', handleMsg);
      return () => socket.off('new_message', handleMsg);
    }
  }, [activeConvoId]);

  const handleSend = async () => {
    if (!message.trim() || !activeConvoId) return;
    try {
      const res = await chatService.sendMessage(activeConvoId, message);
      setMessages(prev => [...prev, res.data || res]);
      setMessage('');
    } catch(err) {}
  };

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-6 pb-24 h-[90vh]">
        <div className="flex h-full gap-6">
          {/* Sidebar */}
          <div className="w-[350px] bg-bg-card rounded-3xl border border-border flex flex-col overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-2xl font-bold font-display mb-4">Messages</h2>
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                 <input 
                   type="text" 
                   placeholder="Search conversations..." 
                   className="w-full bg-bg-elevated border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:border-accent-blue outline-none text-text-primary"
                 />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar">
               {conversations.map((convo, i) => (
                 <div 
                   key={convo.id} 
                   onClick={() => setActiveConvoId(convo.id)}
                   className={`p-4 flex items-center gap-4 cursor-pointer transition-colors border-b border-border ${activeConvoId === convo.id ? 'bg-bg-elevated' : 'hover:bg-bg-subtle'}`}
                 >
                    <div className="relative">
                      <Avatar name={convo.name} size="md" />
                      {i < 2 && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-bg-card" />}
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex justify-between items-center mb-1">
                          <h5 className="font-bold text-sm truncate">{convo.partner?.name}</h5>
                       </div>
                       <p className="text-xs text-text-secondary truncate">
                         {i === 0 ? "Perfect. See you there!" : "Sounds good."}
                       </p>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Main Chat Area */}
          {activeConvo ? (
            <Card className="flex-1 flex flex-col p-0 overflow-hidden h-full">
               <div className="p-6 border-b border-border bg-bg-card flex justify-between items-center z-10 shrink-0">
                  <div className="flex items-center gap-4">
                     <Avatar name={activeConvo.partner?.name} size="md" />
                     <div>
                        <h4 className="font-bold flex items-center gap-2">{activeConvo.partner?.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                          <span className="w-2 h-2 rounded-full bg-success animate-pulse" /> Online
                          <span className="px-1 text-border">•</span>
                          {activeConvo.partner?.skillLevel && <Badge variant={activeConvo.partner.skillLevel} className="!text-[10px] !py-0 !px-1.5">{activeConvo.partner.skillLevel.toUpperCase()}</Badge>}
                        </div>
                     </div>
                  </div>
                  <div className="flex gap-2 text-text-muted">
                     <button className="p-2 hover:bg-bg-elevated rounded-lg transition-colors"><Phone size={20} /></button>
                     <button className="p-2 hover:bg-bg-elevated rounded-lg transition-colors"><Video size={20} /></button>
                     <button className="p-2 hover:bg-bg-elevated rounded-lg transition-colors"><MoreVertical size={20} /></button>
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-bg-elevated/50 to-bg-base/50">
                  <div className="text-center">
                     <span className="text-xs font-bold text-text-muted bg-bg-elevated px-3 py-1 rounded-full border border-border">Today</span>
                  </div>
                  {messages.map((msg, i) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div key={msg.id || i} className={`flex flex-col max-w-[70%] ${isMe ? 'self-end items-end ml-auto' : 'self-start items-start'} relative group`}>
                         <div className={`p-4 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-accent-blue text-white rounded-tr-sm' : 'bg-bg-elevated border border-border rounded-tl-sm text-text-primary'}`}>
                            {msg.content || msg.text}
                         </div>
                         <span className="text-[10px] text-text-muted mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-4">{msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true }) : msg.time}</span>
                      </div>
                    );
                  })}
               </div>

               <div className="p-4 border-t border-border bg-bg-card flex gap-3 items-center shrink-0">
                  <Input 
                    placeholder="Type a message..." 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="!mb-0 flex-1" 
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  />
                  <Button onClick={handleSend} size="lg" className="px-6" icon={Send} />
               </div>
            </Card>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-bg-elevated rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={28} className="text-text-muted" />
                </div>
                <h3 className="font-semibold mb-2">No conversation selected</h3>
                <p className="text-sm text-text-secondary">
                  {conversations.length === 0
                    ? 'No conversations yet — accept a match request to start chatting.'
                    : 'Select a conversation from the list'}
                </p>
                {conversations.length === 0 && (
                  <Button className="mt-4" onClick={() => navigate('/matches')}>Find Match Partners</Button>
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
