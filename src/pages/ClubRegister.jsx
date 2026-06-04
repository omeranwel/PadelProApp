import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, User, Clock, MapPin, UploadCloud, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { api } from '../services/api';
import { uploadImage } from '../services/uploadService';
import toast from 'react-hot-toast';

const STEPS = ['Identity', 'Details', 'Hours & Pricing', 'Photos', 'Review'];

export default function ClubRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);

  const [formData, setFormData] = useState({
    ownerName: '', ownerPhone: '', ownerCnic: '',
    clubName: '', businessType: 'PRIVATE', city: 'Karachi', address: '', numberOfCourts: 1,
    surfaces: [], facilities: [],
    weekdayPrice: 2000, weekendPrice: 2500, minDuration: 60, maxAdvanceDays: 7, cancellationPolicy: '24hr',
    operatingHours: { Mon: { open: '08:00', close: '23:00' }, Tue: { open: '08:00', close: '23:00' } } // simplified for UI demo
  });

  const nextStep = () => setStep(s => Math.min(5, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const url = await uploadImage(file, 'clubs');
      setImages(prev => [...prev, url]);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post('/clubs/apply', {
        ...formData,
        photos: images
      });
      toast.success('Application submitted successfully!');
      navigate('/dashboard'); // or wait page
    } catch (err) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <Badge variant="blue" className="mb-4">PARTNER PROGRAM</Badge>
          <h1 className="text-4xl font-bold font-display">Register Your Club</h1>
          <p className="text-text-secondary mt-2">Join Pakistan's largest Padel network</p>
        </div>

        <div className="flex justify-between items-center mb-8 relative">
          <div className="absolute left-0 right-0 top-1/2 h-1 bg-bg-elevated -z-10" />
          <div className="absolute left-0 top-1/2 h-1 bg-accent transition-all duration-500 -z-10" style={{ width: `${((step - 1) / 4) * 100}%` }} />
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step > i ? 'bg-accent text-white' : step === i + 1 ? 'bg-bg-card border-2 border-accent text-accent' : 'bg-bg-elevated text-text-muted border-2 border-transparent'}`}>
                {step > i ? <CheckCircle size={16} /> : i + 1}
              </div>
              <span className="text-xs font-medium hidden sm:block text-text-secondary">{s}</span>
            </div>
          ))}
        </div>

        <Card className="p-8">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-2xl font-bold font-display flex items-center gap-3"><User className="text-accent" /> Owner Identity</h2>
              <div className="space-y-4">
                <Input label="Owner Full Name" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} />
                <Input label="Phone Number" placeholder="03XX-XXXXXXX" value={formData.ownerPhone} onChange={e => setFormData({...formData, ownerPhone: e.target.value})} />
                <Input label="CNIC Number" placeholder="XXXXX-XXXXXXX-X" value={formData.ownerCnic} onChange={e => setFormData({...formData, ownerCnic: e.target.value})} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-2xl font-bold font-display flex items-center gap-3"><Building2 className="text-accent-blue" /> Club Details</h2>
              <div className="space-y-4">
                <Input label="Club Name" value={formData.clubName} onChange={e => setFormData({...formData, clubName: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                  <Input label="Total Courts" type="number" min="1" value={formData.numberOfCourts} onChange={e => setFormData({...formData, numberOfCourts: e.target.value})} />
                </div>
                <Input label="Full Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-2xl font-bold font-display flex items-center gap-3"><Clock className="text-warning" /> Pricing & Policies</h2>
              <div className="grid grid-cols-2 gap-6">
                <Input label="Weekday Price (PKR/hr)" type="number" value={formData.weekdayPrice} onChange={e => setFormData({...formData, weekdayPrice: e.target.value})} />
                <Input label="Weekend Price (PKR/hr)" type="number" value={formData.weekendPrice} onChange={e => setFormData({...formData, weekendPrice: e.target.value})} />
                <Input label="Max Advance Booking (Days)" type="number" value={formData.maxAdvanceDays} onChange={e => setFormData({...formData, maxAdvanceDays: e.target.value})} />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-2xl font-bold font-display flex items-center gap-3"><UploadCloud className="text-success" /> Club Photos</h2>
              <div className="border-2 border-dashed border-border-strong rounded-xl p-8 text-center hover:bg-bg-elevated transition-colors cursor-pointer relative">
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} disabled={loading} accept="image/*" />
                <UploadCloud size={32} className="mx-auto mb-3 text-text-muted" />
                <p className="font-bold text-sm">Click or drag images to upload</p>
                <p className="text-xs text-text-muted mt-1">High quality photos of your courts (Max 5MB)</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {images.map((img, i) => (
                  <div key={i} className="aspect-video bg-bg-elevated rounded-lg overflow-hidden border border-border">
                    <img src={img} alt={`Club upload ${i}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-2xl font-bold font-display flex items-center gap-3"><CheckCircle className="text-accent" /> Review Application</h2>
              <div className="space-y-4 bg-bg-elevated p-6 rounded-xl border border-border">
                <div className="flex justify-between border-b border-border/50 pb-2"><span className="text-text-secondary">Club Name</span><span className="font-bold">{formData.clubName}</span></div>
                <div className="flex justify-between border-b border-border/50 pb-2"><span className="text-text-secondary">Location</span><span className="font-bold">{formData.city}</span></div>
                <div className="flex justify-between border-b border-border/50 pb-2"><span className="text-text-secondary">Owner</span><span className="font-bold">{formData.ownerName}</span></div>
                <div className="flex justify-between pb-2"><span className="text-text-secondary">Courts</span><span className="font-bold">{formData.numberOfCourts} Courts</span></div>
              </div>
              <label className="flex items-start gap-3 p-4 border border-accent/30 bg-accent/5 rounded-xl cursor-pointer">
                <input type="checkbox" className="mt-1" />
                <span className="text-sm">I agree to PadelPro's Club Owner Terms of Service and confirm all provided information is accurate.</span>
              </label>
            </div>
          )}

          <div className="flex justify-between pt-8 mt-8 border-t border-border">
            <Button variant="secondary" onClick={prevStep} disabled={step === 1 || loading} icon={ArrowLeft}>Back</Button>
            {step < 5 ? (
              <Button onClick={nextStep} icon={ArrowRight} iconPosition="right">Continue</Button>
            ) : (
              <Button onClick={handleSubmit} loading={loading} className="px-8 shadow-lg shadow-accent/20">Submit Application</Button>
            )}
          </div>
        </Card>
      </div>
    </PageWrapper>
  );
}
