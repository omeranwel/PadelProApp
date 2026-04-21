import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, User, Bot, ExternalLink, Minimize2 } from 'lucide-react';
import { chatbotResponses } from '../../data/chatbotResponses';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';

const Chatbot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Salam! I am your PadelPro AI assistant. How can I help you today?', type: 'text' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = inputValue.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI logic
    setTimeout(() => {
      const lowerMsg = userMsg.toLowerCase();
      let foundResponse = null;
      
      for (const [key, resp] of Object.entries(chatbotResponses.keywords)) {
        if (lowerMsg.includes(key)) {
          foundResponse = resp;
          break;
        }
      }

      const response = foundResponse || chatbotResponses.default;
      
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: response.text, 
        link: response.link 
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[150]">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 bg-accent-blue text-white rounded-full shadow-2xl flex items-center justify-center relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent-blue to-ai-purple opacity-0 group-hover:opacity-100 transition-opacity" />
            <MessageSquare size={28} className="relative z-10" />
            <motion.div 
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 border-4 border-white/30 rounded-full"
            />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40, x: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 40, x: 40 }}
            className="w-[380px] h-[550px] bg-bg-card border border-border rounded-[2rem] shadow-[0_32px_64px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-bg-elevated to-bg-card border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-ai-purple/10 text-ai-purple rounded-xl flex items-center justify-center border border-ai-purple/20">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">PadelPro AI</h4>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Active Now</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-bg-subtle rounded-lg text-text-muted transition-colors">
                  <Minimize2 size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar"
            >
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse text-right' : 'text-left'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'bg-bg-elevated border-border' : 'bg-ai-purple/10 border-ai-purple/20 text-ai-purple'}`}>
                         {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                      </div>
                      <div className="space-y-3">
                         <div className={`
                           p-4 rounded-2xl text-sm leading-relaxed
                           ${msg.role === 'user' ? 'bg-accent-blue text-white rounded-tr-none' : 'bg-bg-elevated text-text-primary rounded-tl-none border border-border'}
                         `}>
                            {msg.text}
                         </div>
                         {msg.link && (
                           <button 
                            onClick={() => navigate(msg.link)}
                            className="flex items-center gap-2 text-[11px] font-bold text-ai-purple/80 hover:text-ai-purple transition-all bg-ai-purple/5 border border-ai-purple/10 px-3 py-1.5 rounded-lg"
                           >
                             GO TO PAGE <ExternalLink size={12} />
                           </button>
                         )}
                      </div>
                   </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                   <div className="flex gap-3 items-center">
                      <div className="w-8 h-8 rounded-lg bg-ai-purple/10 border border-ai-purple/20 flex items-center justify-center text-ai-purple">
                        <Bot size={14} />
                      </div>
                      <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <motion.div 
                            key={i}
                            animate={{ y: [0, -3, 0] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                            className="w-1.5 h-1.5 bg-ai-purple/40 rounded-full"
                          />
                        ))}
                      </div>
                   </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-bg-card">
              <form onSubmit={handleSend} className="relative">
                <input 
                  type="text"
                  placeholder="Ask me anything..."
                  className="w-full bg-bg-elevated border border-border-strong rounded-2xl py-4 pl-6 pr-14 text-sm focus:border-ai-purple ring-ai-purple/10 transition-all outline-none"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-ai-purple text-white rounded-xl hover:scale-105 transition-all"
                >
                  <Send size={20} />
                </button>
              </form>
              <p className="text-[9px] text-text-muted text-center mt-3 uppercase font-bold tracking-widest">Powered by PadelPro AI Core</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chatbot;
