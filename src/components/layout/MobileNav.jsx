import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, MapPin, Users, Trophy, LayoutDashboard, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';

const tabs = [
  { label: 'Home', icon: Home, path: '/' },
  { label: 'Courts', icon: MapPin, path: '/courts' },
  { label: 'Matches', icon: Users, path: '/matches', protected: true },
  { label: 'Ladder', icon: Trophy, path: '/leaderboard' },
  { label: 'Market', icon: ShoppingBag, path: '/market' },
];

const MobileNav = () => {
  const { isLoggedIn } = useAuthStore();
  const { openAuthModal, setIntendedPath } = useAppStore();
  const navigate = useNavigate();

  const handleTab = (tab) => {
    if (tab.protected && !isLoggedIn) {
      setIntendedPath(tab.path);
      openAuthModal('signin');
    } else {
      navigate(tab.path);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-bg-card/95 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around px-2 h-16">
        {tabs.map(tab => (
          <NavLink key={tab.path} to={tab.path}
            onClick={e => { if (tab.protected && !isLoggedIn) { e.preventDefault(); handleTab(tab); } }}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${isActive ? 'text-accent' : 'text-text-muted'}`
            }>
            {({ isActive }) => (
              <>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-accent/10' : ''}`}>
                  <tab.icon size={20} />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-accent' : ''}`}>{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;
