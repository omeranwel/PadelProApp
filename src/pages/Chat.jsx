import React, { useState } from 'react';
import { Search, Send, MapPin, User, MoreVertical, Phone, Video, MessageSquare } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { mockPlayers } from '../data/mockPlayers';

const Chat = () => {
  const [activeChat, setActiveChat] = useState(mockPlayers[0]);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { text: "Hey! Are we still on for tomorrow's match?", sender: 'them', time: '10:30 AM' },
    { text: "Yes, definitely. 7 PM at Padel Arena right?", sender: 'me', time: '10:35 AM' },
    { text: "Perfect. See you there!", sender: 'them', time: '10:36 AM' }
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages([...messages, { text: message, sender: 'me', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setMessage('');
    setTimeout(() => {
      setMessages(prev => [...prev, { text: "Got it!", sender: 'them', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 1000);
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
               {mockPlayers.slice(0, 5).map((player, i) => (
                 <div 
                   key={player.id} 
                   onClick={() => setActiveChat(player)}
                   className={`p-4 flex items-center gap-4 cursor-pointer transition-colors border-b border-border ${activeChat?.id === player.id ? 'bg-bg-elevated' : 'hover:bg-bg-subtle'}`}
                 >
                    <div className="relative">
                      <Avatar name={player.name} size="md" />
                      {i < 2 && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-bg-card" />}
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex justify-between items-center mb-1">
                          <h5 className="font-bold text-sm truncate">{player.name}</h5>
                          <span className="text-[10px] text-text-muted">10:30 AM</span>
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
          {activeChat ? (
            <Card className="flex-1 flex flex-col p-0 overflow-hidden h-full">
               <div className="p-6 border-b border-border bg-bg-card flex justify-between items-center z-10 shrink-0">
                  <div className="flex items-center gap-4">
                     <Avatar name={activeChat.name} size="md" />
                     <div>
                        <h4 className="font-bold flex items-center gap-2">{activeChat.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                          <span className="w-2 h-2 rounded-full bg-success animate-pulse" /> Online
                          <span className="px-1 text-border">•</span>
                          <Badge variant={activeChat.skillLevel} className="!text-[10px] !py-0 !px-1.5">{activeChat.skillLevel.toUpperCase()}</Badge>
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
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex flex-col max-w-[70%] ${msg.sender === 'me' ? 'self-end items-end ml-auto' : 'self-start items-start'} relative group`}>
                       <div className={`p-4 rounded-2xl text-sm shadow-sm ${msg.sender === 'me' ? 'bg-accent-blue text-white rounded-tr-sm' : 'bg-bg-elevated border border-border rounded-tl-sm text-text-primary'}`}>
                          {msg.text}
                       </div>
                       <span className="text-[10px] text-text-muted mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-4">{msg.time}</span>
                    </div>
                  ))}
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
            <Card className="flex-[2] flex flex-col items-center justify-center text-text-muted">
               <MessageSquare size={48} className="mb-4 opacity-20" />
               <p>Select a conversation to start chatting</p>
            </Card>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default Chat;
