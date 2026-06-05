import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Building2, ChevronRight } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const res = await api.post('/auth/sync');
      const { user, isNewUser, redirect } = res;
      
      useAuthStore.setState({ user, isLoggedIn: true, token: await result.user.getIdToken() });
      
      if (isNewUser) {
        navigate('/onboarding');
      } else {
        navigate(redirect || '/dashboard');
      }
    } catch (err) {
      console.error('Sign in error:', err);
      toast.error('Sign in failed. Please try again.');
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold font-display mb-4">Welcome to PadelPro</h1>
          <p className="text-text-secondary text-lg">How would you like to continue?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Player Path */}
          <Card className="p-8 hover:border-accent transition-colors flex flex-col justify-between group">
            <div>
              <div className="w-16 h-16 bg-accent/10 text-accent rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap size={32} />
              </div>
              <h3 className="text-2xl font-bold font-display mb-2">I'm a Player</h3>
              <p className="text-text-secondary mb-8">Find matches, track your game, join tournaments, and connect with the community.</p>
            </div>
            <Button onClick={handleGoogleSignIn} className="w-full justify-center shadow-lg shadow-accent/20" icon={ChevronRight} iconPosition="right">
              Continue with Google
            </Button>
          </Card>

          {/* Club Owner Path */}
          <Card className="p-8 hover:border-accent-blue transition-colors flex flex-col justify-between group border-dashed border-2">
            <div>
              <div className="w-16 h-16 bg-accent-blue/10 text-accent-blue rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Building2 size={32} />
              </div>
              <h3 className="text-2xl font-bold font-display mb-2">I Own a Club</h3>
              <p className="text-text-secondary mb-8">List your courts, manage bookings, grow your business, and reach new players.</p>
            </div>
            <Button onClick={() => navigate('/register/club')} variant="outline" className="w-full border-accent-blue text-accent-blue hover:bg-accent-blue/10" icon={ChevronRight} iconPosition="right">
              Register Your Club
            </Button>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
