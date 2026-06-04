import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    city: 'Karachi',
    skillLevel: 'beginner',
    preferredPosition: 'both',
    playingStyle: 'balanced',
    dominantHand: 'right'
  });

  const handleSubmit = async () => {
    try {
      await api.put('/players/me', { ...formData, profileComplete: true });
      toast.success('Profile completed!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-xl mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold font-display mb-2">Complete Your Profile</h1>
          <p className="text-text-secondary">Tell us a bit about your play style</p>
        </div>
        
        <Card className="p-8 space-y-6">
          <Input label="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
          
          <div>
            <label className="block text-sm font-bold uppercase tracking-widest text-text-muted mb-2">Skill Level</label>
            <select className="w-full bg-bg-base border border-border-strong rounded-xl p-4 outline-none" value={formData.skillLevel} onChange={e => setFormData({...formData, skillLevel: e.target.value})}>
              <option value="beginner">Beginner (Just started)</option>
              <option value="intermediate">Intermediate (Play regularly)</option>
              <option value="advanced">Advanced (Competitive)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-widest text-text-muted mb-2">Dominant Hand</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="hand" checked={formData.dominantHand === 'right'} onChange={() => setFormData({...formData, dominantHand: 'right'})}/> Right</label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="hand" checked={formData.dominantHand === 'left'} onChange={() => setFormData({...formData, dominantHand: 'left'})}/> Left</label>
            </div>
          </div>

          <Button className="w-full" onClick={handleSubmit}>Finish Setup</Button>
        </Card>
      </div>
    </PageWrapper>
  );
}
