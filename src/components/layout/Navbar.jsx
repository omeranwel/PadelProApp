import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Menu, X, Search, Trophy, Swords } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { notificationService } from '../../services/notificationService';
import { initSocket, disconnectSocket } from '../../services/socketService';
import SearchModal from '../features/SearchModal';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import { formatDistanceToNow } from 'date-fns';

const Navbar = () => {
  const { isLoggedIn, user, logout } = useAuthStore();
  const { openAuthModal, notifications, unreadCount, setNotifications, markAllRead } = useAppStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const notifRef = React.useRef();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isLoggedIn) {
      notificationService.getAll().then(setNotifications).catch(() => {});
      const token = localStorage.getItem('accessToken');
      if (token) {
        const socket = initSocket(token);
        const { addNotification, pushToast } = useAppStore.getState();

        socket.on('notification:new', (notif) => {
          addNotification(notif);
          pushToast({
            type: notif.type,
            title: notif.title || 'New notification',
            message: notif.message,
            link: notif.link,
          });
        });

        socket.on('match:accepted', ({ conversationId }) => {
          pushToast({
            type: 'match_accepted',
            title: 'Match accepted!',
            message: 'Your match request was accepted. Head to chat to connect.',
            link: conversationId ? `/chat?id=${conversationId}` : '/matches',
          });
        });
      }
    } else {
      disconnectSocket();
    }
    return () => disconnectSocket();
  }, [isLoggedIn, setNotifications]);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    return () => { window.removeEventListener('scroll', handleScroll); document.removeEventListener('mousedown', handleClickOutside); };
  }, []);

  const navLinks = [
    { name: 'Courts', path: '/courts' },
    { name: 'Matches', path: '/matches' },
    { name: 'Market', path: '/market' },
    { name: 'Ladder', path: '/leaderboard' },
    { name: 'Tournaments', path: '/tournaments' },
    { name: 'Community', path: '/community' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300
      ${isScrolled ? 'bg-bg-base/90 backdrop-blur-xl border-b border-border py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,230,118,0.3)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#070D1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="14.31" y1="8" x2="20.05" y2="17.94" />
              <line x1="9.69" y1="8" x2="21.17" y2="8" /><line x1="7.38" y1="12" x2="13.12" y2="2.06" />
              <line x1="9.69" y1="16" x2="3.95" y2="6.06" /><line x1="14.31" y1="16" x2="2.83" y2="16" />
              <line x1="16.62" y1="12" x2="10.88" y2="21.94" />
            </svg>
          </div>
          <span className="text-2xl font-display tracking-widest text-text-primary group-hover:text-accent transition-colors">PADELPRO</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map(link => (
            <NavLink key={link.path} to={link.path}
              className={({ isActive }) => `relative text-sm font-bold tracking-wider transition-colors ${isActive ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}`}>
              {({ isActive }) => (
                <>
                  {link.name}
                  {isActive && <motion.div layoutId="nav-accent" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent rounded-full" />}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button onClick={() => setSearchOpen(true)} className="p-2 text-text-secondary hover:text-text-primary transition-colors hover:scale-110 hidden sm:flex">
            <Search size={18} />
          </button>

          {isLoggedIn ? (
            <>
              <div className="relative" ref={notifRef}>
                <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 text-text-secondary hover:text-text-primary transition-colors">
                  <Bell size={18} />
                  {unreadCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center text-[9px] font-bold text-bg-base">{unreadCount}</span>}
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-80 bg-bg-elevated border border-border rounded-2xl shadow-2xl z-50 overflow-hidden">
                      <div className="flex justify-between items-center p-4 border-b border-border">
                        <h4 className="font-display text-lg">NOTIFICATIONS</h4>
                        {unreadCount > 0 && <button onClick={async()=>{try{await notificationService.markAllRead();markAllRead();}catch(e){}}} className="text-xs text-accent hover:underline">Mark all read</button>}
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0
                          ? <div className="p-8 text-center text-text-muted text-sm">No notifications yet.</div>
                          : notifications.map(n => (
                            <div key={n.id} onClick={() => n.link && navigate(n.link)}
                              className={`p-4 border-b border-border hover:bg-bg-subtle transition-colors flex gap-3 cursor-pointer ${!n.read && !n.isRead ? 'bg-bg-subtle' : ''}`}>
                              <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${!n.read && !n.isRead ? 'bg-accent' : 'bg-transparent'}`} />
                              <div>
                                <p className={`text-sm ${!n.read && !n.isRead ? 'font-bold text-text-primary' : 'font-medium text-text-secondary'}`}>{n.message}</p>
                                <span className="text-xs text-text-muted mt-1 block">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="relative group">
                <button className="flex items-center gap-2"><Avatar name={user?.name} src={user?.avatarUrl} size="sm" /></button>
                <div className="absolute right-0 mt-2 w-52 bg-bg-elevated border border-border rounded-2xl p-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all translate-y-2 group-hover:translate-y-0 shadow-2xl">
                  {[
                    ...(user?.role === 'APP_ADMIN' ? [{label:'Admin Dashboard',path:'/admin'}] : []),
                    ...(user?.role === 'CLUB_ADMIN' ? [{label:'Club Dashboard',path:'/club'}] : []),
                    {label:'Dashboard',path:'/dashboard'},
                    {label:'My Bookings',path:'/bookings'},
                    {label:'Profile',path:'/profile'},
                    {label:'Messages',path:'/chat'}
                  ].map(({label,path}) => (
                    <Link key={path} to={path} className="block px-3 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-subtle rounded-xl transition-all">{label}</Link>
                  ))}
                  <div className="h-px bg-border my-1" />
                  <button onClick={logout} className="block w-full text-left px-3 py-2.5 text-sm font-bold text-danger hover:bg-danger/10 rounded-xl">Sign Out</button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => openAuthModal('signin')} className="text-sm font-bold text-text-secondary hover:text-text-primary transition-colors px-3 py-2 hidden sm:block">Sign In</button>
              <Button size="sm" onClick={() => openAuthModal('register')}>Join Free</Button>
            </div>
          )}

          <button className="lg:hidden p-2 text-text-primary" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[101] bg-bg-base lg:hidden pt-24 px-8">
            <div className="flex flex-col gap-5">
              {navLinks.map(link => (
                <NavLink key={link.path} to={link.path} onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `text-4xl font-display ${isActive ? 'text-accent' : 'text-text-primary'}`}>
                  {link.name.toUpperCase()}
                </NavLink>
              ))}
              <div className="h-px bg-border my-2" />
              {isLoggedIn
                ? <Button variant="outline" onClick={() => { logout(); setIsMobileMenuOpen(false); }}>Sign Out</Button>
                : <div className="flex flex-col gap-3">
                    <Button onClick={() => { openAuthModal('signin'); setIsMobileMenuOpen(false); }}>Sign In</Button>
                    <Button variant="outline" onClick={() => { openAuthModal('register'); setIsMobileMenuOpen(false); }}>Join Free</Button>
                  </div>
              }
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </nav>
  );
};

export default Navbar;
