import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

export default function Register() {
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
      } else if (!user.isVerified) {
        navigate('/verify-email');
      } else {
        navigate(redirect || '/dashboard');
      }
    } catch (err) {
      console.error('Sign in error:', err);
      toast.error('Sign up failed. Please try again.');
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-md mx-auto px-6 py-20">
        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-display mb-2">Join PadelPro</h1>
            <p className="text-text-secondary">Pakistan's premier padel community</p>
          </div>

          <Button onClick={handleGoogleSignIn} className="w-full justify-center shadow-lg mb-8">
            Sign up with Google
          </Button>

          <p className="text-center text-text-secondary text-sm">
            Already have an account? <Link to="/login" className="text-accent hover:underline">Sign in</Link>
          </p>
        </Card>
      </div>
    </PageWrapper>
  );
}
