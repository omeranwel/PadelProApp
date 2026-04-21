import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import { useNavigate } from 'react-router-dom';

const AuthModal = () => {
  const { authModalOpen, closeAuthModal, authModalTab, setAuthModalTab, intendedPath, clearIntendedPath } = useAppStore();
  const { login, register, authError, clearError } = useAuthStore();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'Player',
    skillLevel: 'beginner'
  });

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;
    setLoading(true);
    clearError();
    const result = await login(formData.email, formData.password);
    setLoading(false);
    if (result.success) {
      closeAuthModal();
      if (intendedPath) { navigate(intendedPath); clearIntendedPath(); }
    }
  };

  const handleRegister = async () => {
    if (otp.join('').length < 6) {
      setErrors({ otp: 'Please enter the full 6-digit code' });
      return;
    }
    // We strictly check for '123456' as a mock OTP for the demo environment
    if (otp.join('') !== '123456') {
      setErrors({ otp: 'Invalid OTP code. For demo, use 123456' });
      return;
    }
    setLoading(true);
    clearError();
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      role: formData.role?.toUpperCase() || 'PLAYER',
      skillLevel: formData.skillLevel || 'beginner'
    });
    setLoading(false);
    if (result.success) {
      closeAuthModal();
      if (intendedPath) { navigate(intendedPath); clearIntendedPath(); }
    }
  };

  const handleStep1Continue = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    
    // Strict email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) newErrors.email = 'Valid email required';
    
    // Phone validation
    const phoneRegex = /^[\d\s\-\+\(\)]{10,15}$/;
    if (!formData.phone.trim() || !phoneRegex.test(formData.phone)) newErrors.phone = 'Valid 10-15 digit phone number required';

    if (!formData.password || formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    setStep(2);
  };

  const skillOptions = [
    { id: 'beginner', name: 'Beginner', desc: 'Typical for new players learnig the basics.' },
    { id: 'intermediate', name: 'Intermediate', desc: 'Can rally comfortably and use the glass.' },
    { id: 'advanced', name: 'Advanced', desc: 'Competitive player with strong technique.' },
    { id: 'professional', name: 'Professional', desc: 'Plays tournaments and master level games.' }
  ];

  return (
    <Modal 
      isOpen={authModalOpen} 
      onClose={closeAuthModal}
      className="max-w-md overflow-hidden"
    >
      <div className="flex bg-bg-elevated/50 p-1 rounded-xl mb-8">
        {['signin', 'register'].map((tab) => (
          <button
            key={tab}
            onClick={() => { setAuthModalTab(tab); setStep(1); }}
            className={`
              flex-1 py-2 text-sm font-bold rounded-lg transition-all relative
              ${authModalTab === tab ? 'text-text-primary' : 'text-text-secondary'}
            `}
          >
            {authModalTab === tab && (
              <motion.div layoutId="auth-tab" className="absolute inset-0 bg-bg-card border border-border rounded-lg shadow-sm" />
            )}
            <span className="relative z-10">{tab === 'signin' ? 'Sign In' : 'Create Account'}</span>
          </button>
        ))}
      </div>

      {authModalTab === 'signin' ? (
        <form onSubmit={handleSignIn} className="space-y-4">
          <Input 
            label="Email Address" 
            placeholder="name@email.com" 
            icon={Mail} 
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
            required
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••••" 
            icon={Lock} 
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
            required
          />
          <div className="flex justify-end">
            <button type="button" className="text-sm font-semibold text-accent-blue hover:underline">Forgot Password?</button>
          </div>
          {authError && <div className="p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm font-medium">{authError}</div>}
          <Button type="submit" loading={loading} className="w-full">Sign In</Button>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-bg-card px-2 text-text-muted">Or continue with</span></div>
          </div>
          <Button variant="secondary" className="w-full" icon={() => (
            <svg viewBox="0 0 24 24" width="18" height="18" className="mr-2">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )} onClick={() => alert("Google login will be implemented soon.")}>Google</Button>
        </form>
      ) : (
        <div className="space-y-6">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div>
                <Input 
                  label="Full Name" 
                  placeholder="Enter your full name" 
                  icon={User} 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
                {errors.name && <p className="text-danger text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <Input 
                  label="Email Address" 
                  placeholder="name@email.com" 
                  icon={Mail} 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
                {errors.email && <p className="text-danger text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                 <Input 
                   label="Phone Number" 
                   placeholder="+92 300 1234567" 
                   icon={Phone} 
                   className="flex-1"
                   value={formData.phone}
                   onChange={e => setFormData({...formData, phone: e.target.value})}
                 />
                 {errors.phone && <p className="text-danger text-xs mt-1">{errors.phone}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input label="Password" type="password" placeholder="••••••••" icon={Lock} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  {errors.password && <p className="text-danger text-xs mt-1">{errors.password}</p>}
                  {formData.password && (
                    <div className="space-y-1 mt-2">
                      <div className="flex gap-1">
                        {[1,2,3,4].map(level => {
                          const strength = [
                            formData.password.length >= 6,
                            formData.password.length >= 8,
                            /\d/.test(formData.password),
                            /[^a-zA-Z0-9]/.test(formData.password)
                          ].filter(Boolean).length;
                          const colors = ['bg-danger','bg-warning','bg-yellow-400','bg-success'];
                          return <div key={level} className={`h-1 flex-1 rounded-full transition-all ${strength >= level ? colors[strength-1] : 'bg-border'}`} />;
                        })}
                      </div>
                      <p className="text-xs text-text-muted">
                        {['','Weak','Fair','Good','Strong'][[formData.password.length>=6, formData.password.length>=8, /\d/.test(formData.password), /[^a-zA-Z0-9]/.test(formData.password)].filter(Boolean).length]}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <Input label="Confirm" type="password" placeholder="••••••••" icon={Lock} value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
                  {errors.confirmPassword && <p className="text-danger text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
              <Button onClick={handleStep1Continue} className="w-full">Continue</Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {['Player', 'Club Owner'].map(role => (
                   <button
                    key={role}
                    onClick={() => setFormData({...formData, role})}
                    className={`
                      p-4 rounded-xl border-2 transition-all text-center
                      ${formData.role === role ? 'border-accent-blue bg-accent-blue/5' : 'border-border hover:border-border-strong'}
                    `}
                   >
                     <p className={`font-bold ${formData.role === role ? 'text-accent-blue' : ''}`}>{role === 'Player' ? '🎾 Player' : '🏟 Club'}</p>
                   </button>
                ))}
              </div>
              
              <div className="space-y-3">
                <p className="text-sm font-medium">Select your skill level</p>
                <div className="grid grid-cols-2 gap-3">
                  {skillOptions.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setFormData({...formData, skillLevel: opt.id})}
                      className={`
                        p-3 rounded-lg border text-left transition-all
                        ${formData.skillLevel === opt.id ? 'border-accent-blue ring-1 ring-accent-blue' : 'border-border hover:border-border-strong'}
                      `}
                    >
                      <Badge variant={opt.id} className="mb-2">{opt.name}</Badge>
                      <p className="text-[10px] text-text-muted leading-tight">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">Back</Button>
                <Button onClick={() => setStep(3)} className="flex-1">Continue</Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center py-4">
              <div className="w-20 h-20 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h4 className="text-2xl font-bold mb-2">Verify Your Number</h4>
              <p className="text-text-secondary text-sm mb-8">We sent a 6-digit code to {formData.phone || '+92 ••• •••••••'}</p>
              
              <div className="flex gap-2 justify-center mb-4">
                {[0,1,2,3,4,5].map(i => (
                  <input 
                    key={i} 
                    value={otp[i]}
                    onChange={e => {
                      const newOtp = [...otp];
                      newOtp[i] = e.target.value.substring(e.target.value.length - 1);
                      setOtp(newOtp);
                      // auto-advance focus logic can be added here if needed
                    }}
                    className="w-10 h-12 bg-bg-elevated border border-border-strong rounded-lg text-center font-bold text-xl focus:border-accent-blue focus:ring-1" 
                  />
                ))}
              </div>
              {errors.otp && <p className="text-danger text-xs mb-4">{errors.otp}</p>}
              {authError && <p className="text-danger text-xs mb-4">{authError}</p>}

              <div className="flex flex-col gap-4">
                <Button onClick={handleRegister} loading={loading} className="w-full">Create Account</Button>
                <button className="text-sm font-semibold text-text-muted hover:text-accent-blue">Resend code in 45s</button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default AuthModal;
