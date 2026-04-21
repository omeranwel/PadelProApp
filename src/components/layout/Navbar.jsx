import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Menu, X, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';

const Navbar = () => {
  const { isLoggedIn, user, logout } = useAuthStore();
  const { openAuthModal } = useAppStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const notifRef = React.useRef();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) setNotifOpen(false);
    };
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, []);

  const navLinks = [
    { name: 'Courts', path: '/courts' },
    { name: 'Matches', path: '/matches' },
    { name: 'Market', path: '/market' },
    { name: 'Community', path: '/community' },
  ];

  return (
    <nav className={`
      fixed top-0 left-0 right-0 z-[100] transition-all duration-300
      ${isScrolled ? 'bg-bg-base/85 backdrop-blur-lg border-b border-border py-4' : 'bg-transparent py-6'}
    `}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-accent-orange flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="14.31" y1="8" x2="20.05" y2="17.94" />
              <line x1="9.69" y1="8" x2="21.17" y2="8" />
              <line x1="7.38" y1="12" x2="13.12" y2="2.06" />
              <line x1="9.69" y1="16" x2="3.95" y2="6.06" />
              <line x1="14.31" y1="16" x2="2.83" y2="16" />
              <line x1="16.62" y1="12" x2="10.88" y2="21.94" />
            </svg>
          </div>
          <span className="text-xl font-bold font-display tracking-tight uppercase">PadelPro</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <NavLink 
              key={link.path} 
              to={link.path}
              className={({ isActive }) => `
                relative text-sm font-semibold transition-colors
                ${isActive ? 'text-accent-blue' : 'text-text-secondary hover:text-text-primary'}
              `}
            >
              {({ isActive }) => (
                <>
                  {link.name}
                  {isActive && (
                    <motion.div 
                      layoutId="nav-dot"
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent-blue rounded-full" 
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Auth Actions */}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <div className="relative" ref={notifRef}>
                <button 
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  <Bell size={20} />
                  {!notifOpen && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-orange rounded-full" />}
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-80 bg-bg-elevated border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="flex justify-between items-center p-4 border-b border-border">
                        <h4 className="font-bold">Notifications</h4>
                        <button className="text-xs text-accent-blue hover:text-accent-orange transition-colors">Mark all read</button>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        {/* Empty State could be shown if length === 0 */}
                        <div className="p-4 border-b border-border hover:bg-bg-subtle transition-colors flex gap-3 cursor-pointer">
                           <div className="w-2 h-2 bg-accent-blue rounded-full shrink-0 mt-1.5" />
                           <div>
                             <p className="text-sm font-medium">Your booking at Padel Arena DHA is confirmed for tomorrow 7PM</p>
                             <span className="text-xs text-text-muted mt-1 block">2 min ago</span>
                           </div>
                        </div>
                        <div className="p-4 border-b border-border hover:bg-bg-subtle transition-colors flex gap-3 cursor-pointer">
                           <div className="w-2 h-2 bg-purple-500 rounded-full shrink-0 mt-1.5" />
                           <div>
                             <p className="text-sm font-medium">Ali Hassan sent you a match request</p>
                             <span className="text-xs text-text-muted mt-1 block">1 hour ago</span>
                           </div>
                        </div>
                        <div className="p-4 hover:bg-bg-subtle transition-colors flex gap-3 cursor-pointer">
                           <div className="w-2 h-2 bg-accent-orange rounded-full shrink-0 mt-1.5" />
                           <div>
                             <p className="text-sm font-medium">Your listing 'Babolat Viper' has 12 new views</p>
                             <span className="text-xs text-text-muted mt-1 block">3 hours ago</span>
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="relative group">
                <button className="flex items-center gap-2">
                  <Avatar name={user?.name} size="sm" />
                </button>
                {/* Dropdown would go here in full implementation */}
                <div className="absolute right-0 mt-2 w-48 bg-bg-elevated border border-border rounded-xl p-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all translate-y-2 group-hover:translate-y-0">
                  <Link to="/dashboard" className="block w-full text-left px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-subtle rounded-lg">My Dashboard</Link>
                  <Link to="/bookings" className="block w-full text-left px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-subtle rounded-lg">My Bookings</Link>
                  <Link to="/profile" className="block w-full text-left px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-subtle rounded-lg">My Profile</Link>
                  <Link to="/chat" className="block w-full text-left px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-subtle rounded-lg">Messages</Link>
                  <div className="h-px bg-border my-1" />
                  <button onClick={logout} className="block w-full text-left px-3 py-2 text-sm text-danger hover:bg-danger/10 rounded-lg">Sign Out</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <button 
                onClick={() => openAuthModal('signin')}
                className="text-sm font-semibold text-text-primary hover:text-accent-blue transition-colors px-4 py-2"
              >
                Sign In
              </button>
              <Button size="sm" onClick={() => openAuthModal('register')}>Sign Up</Button>
            </>
          )}
          
          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-text-primary"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[101] bg-bg-base md:hidden pt-24 px-6"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map(link => (
                <NavLink 
                  key={link.path} 
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `text-2xl font-bold ${isActive ? 'text-accent-blue' : 'text-text-primary'}`}
                >
                  {link.name}
                </NavLink>
              ))}
              <div className="h-px bg-border my-4" />
              {isLoggedIn ? (
                <Button onClick={() => { logout(); setIsMobileMenuOpen(false); }} variant="outline">Sign Out</Button>
              ) : (
                <div className="flex flex-col gap-4">
                  <Button onClick={() => { openAuthModal('signin'); setIsMobileMenuOpen(false); }}>Sign In</Button>
                  <Button onClick={() => { openAuthModal('register'); setIsMobileMenuOpen(false); }} variant="outline">Sign Up</Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
