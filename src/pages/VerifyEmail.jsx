import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const otpRefs = useRef([]);

  useEffect(() => {
    // Send OTP automatically when page loads
    api.post('/auth/send-otp').catch(console.error);
  }, []);

  const handleOtpChange = (i, val) => {
    const newOtp = [...otp];
    newOtp[i] = val.slice(-1);
    setOtp(newOtp);
    if (val && i < 5) otpRefs.current[i+1]?.focus();
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i-1]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) return toast.error('Enter all 6 digits');
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { otp: code });
      useAuthStore.setState({ user: { ...user, isVerified: true } });
      toast.success('Email verified successfully!');
      if (!user.profileComplete) navigate('/onboarding');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/send-otp');
      setOtp(['', '', '', '', '', '']);
      toast.success('New code sent to your email');
    } catch (err) {
      toast.error(err.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <div className="w-20 h-20 bg-accent/20 text-accent rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck size={40} />
        </div>
        <h1 className="text-3xl font-bold font-display mb-4">Verify Your Email</h1>
        <p className="text-text-secondary mb-8">
          We sent a 6-digit verification code to<br/>
          <span className="font-bold text-accent">{user?.email}</span>
        </p>

        <Card className="p-8">
          <div className="flex gap-2 justify-center mb-8">
            {[0, 1, 2, 3, 4, 5].map(i => (
              <input 
                key={i} 
                ref={el => otpRefs.current[i] = el}
                value={otp[i]}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(i, e)}
                className="w-12 h-14 bg-bg-base border border-border-strong rounded-xl text-center font-bold text-2xl focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors" 
                maxLength={1} 
              />
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <Button onClick={handleVerify} loading={loading} className="w-full text-lg shadow-lg shadow-accent/20 py-4">
              Verify Email
            </Button>
            <button 
              onClick={handleResend} 
              disabled={resending}
              className="text-sm font-semibold text-text-muted hover:text-accent flex items-center justify-center gap-2 transition-colors py-2"
            >
              <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
              Resend Code
            </button>
          </div>
        </Card>
      </div>
    </PageWrapper>
  );
}
