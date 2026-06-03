import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, CheckCircle2, RefreshCw, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { authService } from '../../services/authService';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthModal = () => {
  const { authModalOpen, closeAuthModal, authModalTab, setAuthModalTab, intendedPath, clearIntendedPath } = useAppStore();
  const { clearError } = useAuthStore();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errors, setErrors] = useState({});
  const [otp, setOtp] = useState(['','','','','','']);
  const [pendingEmail, setPendingEmail] = useState('');
  const otpRefs = useRef([]);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'PLAYER', skillLevel: 'beginner'
  });

  const resetModal = () => {
    setStep(1); setOtp(['','','','','','']); setErrors({}); setPendingEmail('');
    setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'PLAYER', skillLevel: 'beginner' });
  };

  const handleClose = () => { resetModal(); closeAuthModal(); };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;
    setLoading(true); clearError();
    try {
      const result = await authService.login(formData.email, formData.password);
      useAuthStore.setState({ user: result.user, token: result.accessToken, refreshToken: result.refreshToken, isLoggedIn: true, authError: null });
      toast.success(`Welcome back, ${result.user.name}!`);
      handleClose();
      if (intendedPath) { navigate(intendedPath); clearIntendedPath(); }
      if (result.user.role === 'APP_ADMIN') navigate('/admin');
      else if (result.user.role === 'CLUB_ADMIN') navigate('/club');
    } catch(err) {
      const data = err.response?.data || {};
      if (data.requiresVerification) {
        setPendingEmail(data.email || formData.email);
        setAuthModalTab('register');
        setStep(3);
        toast('Check your email for a verification code.', { icon: '📧' });
      } else {
        setErrors({ signin: data.error || err.message || 'Login failed.' });
      }
    } finally { setLoading(false); }
  };

  const handleStep1Continue = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) errs.email = 'Valid email required';
    const pkPhone = /^(\+92|0)[0-9]{10}$/;
    if (formData.phone && !pkPhone.test(formData.phone.replace(/\s/g, ''))) errs.phone = 'Valid Pakistani number (+92XXXXXXXXXX or 0XXXXXXXXXX)';
    if (!formData.password || formData.password.length < 8) errs.password = 'At least 8 characters';
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setStep(2);
  };

  const handleStep2Continue = async () => {
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = formData;
      await authService.register({ ...payload, role: formData.role });
      setPendingEmail(formData.email);
      setStep(3);
      toast.success('Account created! Check your email for the OTP.', { duration: 5000 });
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Registration failed.';
      setErrors({ submit: msg });
    } finally { setLoading(false); }
  };

  const handleOtpChange = (i, val) => {
    const newOtp = [...otp];
    newOtp[i] = val.slice(-1);
    setOtp(newOtp);
    if (val && i < 5) otpRefs.current[i+1]?.focus();
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i-1]?.focus();
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length < 6) { setErrors({ otp: 'Enter all 6 digits' }); return; }
    setLoading(true);
    try {
      const result = await authService.verifyOtp(pendingEmail, code);
      useAuthStore.setState({ user: result.user, token: result.accessToken, refreshToken: result.refreshToken, isLoggedIn: true, authError: null });
      toast.success('Email verified! Welcome to PadelPro!');
      handleClose();
      if (result.user.role === 'CLUB_ADMIN') navigate('/club');
    } catch(err) {
      setErrors({ otp: err.response?.data?.error || err.message || 'Invalid code' });
    } finally { setLoading(false); }
  };

  const handleResendOtp = async () => {
    if (!pendingEmail) return;
    setResending(true);
    try {
      await authService.resendOtp(pendingEmail);
      setOtp(['','','','','','']);
      toast.success('New code sent to your email!');
    } catch {} finally { setResending(false); }
  };

  const pwStrength = [
    formData.password.length >= 6, formData.password.length >= 8,
    /\d/.test(formData.password), /[^a-zA-Z0-9]/.test(formData.password)
  ].filter(Boolean).length;
  const pwColors = ['bg-danger','bg-warning','bg-yellow-400','bg-success'];

  const skillOptions = [
    { id: 'beginner', name: 'Beginner', desc: 'Learning the basics.' },
    { id: 'intermediate', name: 'Intermediate', desc: 'Can rally and use the glass.' },
    { id: 'advanced', name: 'Advanced', desc: 'Competitive with strong technique.' },
    { id: 'professional', name: 'Professional', desc: 'Tournament-level player.' }
  ];

  return (
    <Modal isOpen={authModalOpen} onClose={handleClose} className="max-w-md overflow-hidden">
      <div className="flex bg-bg-elevated/50 p-1 rounded-xl mb-6">
        {['signin', 'register'].map(tab => (
          <button key={tab} onClick={() => { setAuthModalTab(tab); setStep(1); setErrors({}); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all relative ${authModalTab === tab ? 'text-text-primary' : 'text-text-secondary'}`}>
            {authModalTab === tab && <motion.div layoutId="auth-tab" className="absolute inset-0 bg-bg-card border border-border rounded-lg shadow-sm" />}
            <span className="relative z-10">{tab === 'signin' ? 'Sign In' : 'Create Account'}</span>
          </button>
        ))}
      </div>

      {authModalTab === 'signin' ? (
        <form onSubmit={handleSignIn} className="space-y-4">
          <Input label="Email Address" placeholder="name@email.com" icon={Mail} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
          <Input label="Password" type="password" placeholder="••••••••" icon={Lock} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
          <div className="flex justify-end">
            <button type="button" className="text-sm font-semibold text-accent hover:underline">Forgot Password?</button>
          </div>
          {errors.signin && <div className="p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm font-medium">{errors.signin}</div>}
          <Button type="submit" loading={loading} className="w-full">Sign In</Button>
        </form>
      ) : (
        <div className="space-y-6">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div>
                <Input label="Full Name" placeholder="Your full name" icon={User} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                {errors.name && <p className="text-danger text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <Input label="Email Address" placeholder="name@email.com" icon={Mail} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                {errors.email && <p className="text-danger text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <Input label="Phone (Pakistani)" placeholder="+923001234567" icon={Phone} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                {errors.phone && <p className="text-danger text-xs mt-1">{errors.phone}</p>}
                <p className="text-text-muted text-xs mt-1">Format: +92XXXXXXXXXX or 0XXXXXXXXXX</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input label="Password" type="password" placeholder="••••••••" icon={Lock} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  {errors.password && <p className="text-danger text-xs mt-1">{errors.password}</p>}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex gap-1">{[1,2,3,4].map(l => <div key={l} className={`h-1 flex-1 rounded-full transition-all ${pwStrength >= l ? pwColors[pwStrength-1] : 'bg-border'}`} />)}</div>
                      <p className="text-xs text-text-muted mt-1">{['','Weak','Fair','Good','Strong'][pwStrength]}</p>
                    </div>
                  )}
                </div>
                <div>
                  <Input label="Confirm" type="password" placeholder="••••••••" icon={Lock} value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
                  {errors.confirmPassword && <p className="text-danger text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
              <Button onClick={handleStep1Continue} className="w-full">Continue →</Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div>
                <p className="text-sm font-bold mb-3">I am joining as</p>
                <div className="grid grid-cols-2 gap-4">
                  {[{ id: 'PLAYER', label: '🎾 Player', desc: 'Find courts & partners' }, { id: 'CLUB_ADMIN', label: '🏟️ Club Owner', desc: 'Manage my venue' }].map(r => (
                    <button key={r.id} onClick={() => setFormData({...formData, role: r.id})}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${formData.role === r.id ? 'border-accent bg-accent/5' : 'border-border hover:border-border-strong'}`}>
                      <p className={`font-bold ${formData.role === r.id ? 'text-accent' : ''}`}>{r.label}</p>
                      <p className="text-xs text-text-muted mt-1">{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              {formData.role === 'PLAYER' && (
                <div className="space-y-3">
                  <p className="text-sm font-bold">Skill level</p>
                  <div className="grid grid-cols-2 gap-3">
                    {skillOptions.map(opt => (
                      <button key={opt.id} onClick={() => setFormData({...formData, skillLevel: opt.id})}
                        className={`p-3 rounded-lg border text-left transition-all ${formData.skillLevel === opt.id ? 'border-accent ring-1 ring-accent' : 'border-border hover:border-border-strong'}`}>
                        <Badge variant={opt.id} className="mb-2 text-xs">{opt.name}</Badge>
                        <p className="text-[10px] text-text-muted leading-tight">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {errors.submit && <p className="text-danger text-sm font-medium bg-danger/10 border border-danger/30 rounded p-2">{errors.submit}</p>}
              <div className="flex gap-4">
                <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">Back</Button>
                <Button onClick={handleStep2Continue} loading={loading} className="flex-1">Create Account</Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center py-2">
              <div className="w-20 h-20 bg-accent/20 text-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={40} />
              </div>
              <h4 className="text-2xl font-bold mb-2">Verify Your Email</h4>
              <p className="text-text-secondary text-sm mb-2">We sent a 6-digit code to</p>
              <p className="font-bold text-accent text-sm mb-8">{pendingEmail}</p>
              <div className="flex gap-2 justify-center mb-4">
                {[0,1,2,3,4,5].map(i => (
                  <input key={i} ref={el => otpRefs.current[i] = el} value={otp[i]}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className="w-11 h-13 bg-bg-elevated border border-border-strong rounded-lg text-center font-bold text-xl focus:border-accent focus:ring-1 focus:ring-accent outline-none" maxLength={1} />
                ))}
              </div>
              {errors.otp && <p className="text-danger text-xs mb-4">{errors.otp}</p>}
              <div className="flex flex-col gap-3">
                <Button onClick={handleVerifyOtp} loading={loading} className="w-full">Verify & Continue</Button>
                <button type="button" onClick={handleResendOtp} disabled={resending}
                  className="text-sm font-semibold text-text-muted hover:text-accent flex items-center justify-center gap-2 transition-colors">
                  <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
                  Resend code
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default AuthModal;
