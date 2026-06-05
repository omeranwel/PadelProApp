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

  const handleGoogleSignIn = async (isClubRegistration = false) => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const res = await api.post('/auth/sync');
      const { user, isNewUser, redirect } = res;
      
      useAuthStore.setState({ user, isLoggedIn: true, token: await result.user.getIdToken() });
      
      if (isClubRegistration === true) {
        navigate('/register/club');
      } else if (isNewUser) {
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
      <div className="max-w-md mx-auto px-6 py-20">
        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-display mb-2">Welcome Back</h1>
            <p className="text-text-secondary">Sign in to your PadelPro account</p>
          </div>

          <Button onClick={handleGoogleSignIn} className="w-full justify-center shadow-lg shadow-accent/20 mb-8">
            Continue with Google
          </Button>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-bg-card text-text-secondary">New to PadelPro?</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Button onClick={() => navigate('/register')} variant="outline" className="w-full justify-center">
              Create Player Account
            </Button>
            <Button onClick={() => handleGoogleSignIn(true)} variant="outline" className="w-full justify-center border-accent-blue text-accent-blue hover:bg-accent-blue/10">
              Register Your Club
            </Button>
          </div>
        </Card>
      </div>
    </PageWrapper>
  );
}
