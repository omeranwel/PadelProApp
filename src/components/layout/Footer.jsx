import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, SendHorizontal, Earth, CirclePlay } from 'lucide-react';
import toast from 'react-hot-toast';

const Footer = () => {
  const [email, setEmail] = useState('');
  return (
    <footer className="border-t border-border bg-bg-card mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Col 1: Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent-orange flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="14.31" y1="8" x2="20.05" y2="17.94"/><line x1="9.69" y1="8" x2="21.17" y2="8"/><line x1="7.38" y1="12" x2="13.12" y2="2.06"/><line x1="9.69" y1="16" x2="3.95" y2="6.06"/><line x1="14.31" y1="16" x2="2.83" y2="16"/><line x1="16.62" y1="12" x2="10.88" y2="21.94"/></svg>
              </div>
              <span className="font-bold text-lg font-display uppercase tracking-tight">PadelPro</span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed mb-6">Pakistan's premier padel ecosystem. Built for Karachi's growing padel community.</p>
            <div className="flex gap-3">
              {[Camera, SendHorizontal, Earth, CirclePlay].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-bg-elevated border border-border rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border-strong transition-all">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
          {/* Col 2: Platform */}
          <div>
            <h5 className="font-bold text-xs uppercase tracking-widest text-text-muted mb-6">Platform</h5>
            <div className="space-y-3">
              {[['Courts','/courts'],['Matchmaking','/matches'],['Marketplace','/market'],['Community','/community']].map(([l,p]) => (
                <Link key={p} to={p} className="block text-sm text-text-secondary hover:text-text-primary transition-colors">{l}</Link>
              ))}
            </div>
          </div>
          {/* Col 3: Account */}
          <div>
            <h5 className="font-bold text-xs uppercase tracking-widest text-text-muted mb-6">Account</h5>
            <div className="space-y-3">
              {[['Dashboard','/dashboard'],['My Bookings','/bookings'],['My Profile','/profile'],['Club Admin','/admin']].map(([l,p]) => (
                <Link key={p} to={p} className="block text-sm text-text-secondary hover:text-text-primary transition-colors">{l}</Link>
              ))}
            </div>
          </div>
          {/* Col 4: Newsletter */}
          <div>
            <h5 className="font-bold text-xs uppercase tracking-widest text-text-muted mb-6">Stay Updated</h5>
            <p className="text-sm text-text-secondary mb-4">Join 500+ players getting weekly padel news and tips.</p>
            <div className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="bg-bg-elevated border border-border-strong rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none"
              />
              <button
                onClick={() => { if (email) { toast.success('Subscribed! Welcome to the community.'); setEmail(''); } }}
                className="px-4 py-2.5 bg-accent-orange text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-text-muted">© 2025 PadelPro. All rights reserved. Built for Karachi's padel community.</p>
          <div className="flex gap-6">
            {['Privacy Policy','Terms of Service','Contact'].map(l => (
              <a key={l} href="#" className="text-xs text-text-muted hover:text-text-secondary transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
