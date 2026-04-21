import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, ArrowLeft, Tag, Info, Trash2, 
  ChevronRight, Sparkles, CheckCircle2, TrendingUp
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import toast from 'react-hot-toast';

const SellItem = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Rackets',
    condition: 'New',
    price: '',
    description: '',
    openToTrade: false,
    images: []
  });

  const categories = ['Rackets', 'Balls', 'Shoes', 'Bags', 'Accessories'];
  const conditions = ['New', 'Like New', 'Used', 'Worn'];

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(3);
      toast.success('Listing Published!');
    }, 2000);
  };

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
           <div>
             <button onClick={() => navigate('/market')} className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-2">
               <ArrowLeft size={16} /> Marketplace
             </button>
             <h1 className="text-4xl font-bold font-display">Sell Equipment</h1>
           </div>
           <div className="flex gap-1">
             {[1, 2, 3].map(i => (
               <div key={i} className={`w-8 h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'bg-accent-orange' : 'bg-border'}`} />
             ))}
           </div>
        </div>

        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
             <Card className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <Input 
                    label="Item Title" 
                    placeholder="e.g. Babolat Technical Viper 2024" 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                   <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-text-primary">Category</label>
                      <select 
                        className="bg-bg-elevated border border-border-strong rounded-lg py-2.5 px-4 text-text-primary"
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                      >
                         {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-sm font-medium">Condition</label>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {conditions.map(c => (
                        <button
                          key={c}
                          onClick={() => setFormData({...formData, condition: c})}
                          className={`py-3 rounded-xl border-2 transition-all font-bold text-sm ${formData.condition === c ? 'border-accent-orange bg-accent-orange/5 text-accent-orange' : 'border-border text-text-muted hover:border-border-strong'}`}
                        >
                          {c}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-sm font-medium">Photos</label>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <label className="aspect-square rounded-2xl border-2 border-dashed border-border-strong hover:border-accent-blue bg-bg-elevated flex flex-col items-center justify-center cursor-pointer transition-colors group relative overflow-hidden">
                        <input 
                           type="file" 
                           accept="image/png, image/jpeg"
                           multiple
                           className="absolute inset-0 opacity-0 cursor-pointer"
                           onChange={(e) => {
                             const files = Array.from(e.target.files);
                             const newImages = files.map(file => URL.createObjectURL(file));
                             setFormData(prev => ({...prev, images: [...prev.images, ...newImages].slice(0, 4)}));
                           }}
                        />
                        <Camera size={32} className="text-text-muted group-hover:text-accent-blue transition-colors mb-2" />
                        <span className="text-[10px] font-bold text-text-muted uppercase">Add Photo</span>
                      </label>
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="aspect-square rounded-2xl bg-bg-subtle border border-border overflow-hidden relative group">
                           {formData.images[i] ? (
                             <>
                               <img src={formData.images[i]} alt={`Upload ${i}`} className="w-full h-full object-cover" />
                               <button 
                                 className="absolute top-2 right-2 p-1.5 bg-danger/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                 onClick={() => setFormData(prev => ({...prev, images: prev.images.filter((_, idx) => idx !== i)}))}
                               >
                                 <Trash2 size={14} />
                               </button>
                             </>
                           ) : (
                             <div className="w-full h-full flex flex-col items-center justify-center text-border-strong"><span className="text-xs font-bold">{i+1}</span></div>
                           )}
                        </div>
                      ))}
                   </div>
                   <p className="text-[10px] text-text-muted italic mt-2">Maximum 4 photos • PNG, JPG accepted</p>
                </div>
             </Card>
             <div className="flex justify-end">
                <Button size="lg" className="px-12" onClick={() => setStep(2)}>Next Step <ChevronRight size={18} /></Button>
             </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
             <Card className="p-8 space-y-8">
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                     <label className="text-sm font-medium">Price Settings</label>
                     <div className="flex items-center gap-3">
                        <span className="text-sm text-text-secondary">Open to Trading?</span>
                        <button 
                          onClick={() => setFormData({...formData, openToTrade: !formData.openToTrade})}
                          className={`w-12 h-6 rounded-full transition-all relative ${formData.openToTrade ? 'bg-accent-blue' : 'bg-border'}`}
                        >
                           <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.openToTrade ? 'left-7' : 'left-1'}`} />
                        </button>
                     </div>
                   </div>
                   <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-text-muted">RS</div>
                      <input 
                        type="number"
                        placeholder="0.00"
                        className="w-full bg-bg-elevated border border-border-strong rounded-xl py-4 pl-12 pr-4 text-2xl font-bold font-display"
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: e.target.value})}
                      />
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-sm font-medium">Detailed Description</label>
                   <textarea 
                    rows={6}
                    placeholder="Describe usage, specs, any damages, and why you are selling..."
                    className="w-full bg-bg-elevated border border-border-strong rounded-xl p-4 text-text-primary focus:border-accent-blue outline-none transition-all"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                {/* AI Helper Box */}
                <div className="bg-ai-purple/5 border border-ai-purple/20 p-6 rounded-2xl flex items-start gap-4">
                   <Sparkles className="text-ai-purple shrink-0" size={24} />
                   <div>
                      <h5 className="font-bold text-sm text-ai-purple">AI Price Insight</h5>
                      <p className="text-xs text-text-secondary mt-1">
                        Similar products in Karachi for <span className="text-text-primary font-bold">{formData.category} ({formData.condition})</span> are selling between <span className="text-text-primary font-bold">Rs 15k - 22k</span>.
                      </p>
                   </div>
                </div>
             </Card>

             <div className="flex gap-4">
                <Button variant="secondary" size="lg" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                <Button size="lg" className="flex-[2] !bg-success" onClick={handleSubmit} loading={loading}>Publish Listing</Button>
             </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-12 text-center">
             <div className="w-24 h-24 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-success/20">
                <CheckCircle2 size={48} />
             </div>
             <h2 className="text-4xl font-bold font-display mb-4">Listing Live!</h2>
             <p className="text-text-secondary text-lg max-w-md mx-auto mb-12">
               Your <span className="text-text-primary font-bold">{formData.title}</span> is now visible to the Karachi community.
             </p>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                <Card className="p-4 flex flex-col items-center gap-2 hover:border-accent-blue transition-colors cursor-pointer">
                   <TrendingUp size={24} className="text-accent-blue" />
                   <span className="text-xs font-bold uppercase">Promote Listing</span>
                </Card>
                <Card className="p-4 flex flex-col items-center gap-2 hover:border-accent-orange transition-colors cursor-pointer" onClick={() => navigate('/market')}>
                   <ChevronRight size={24} className="text-accent-orange" />
                   <span className="text-xs font-bold uppercase">Back to Market</span>
                </Card>
             </div>
          </motion.div>
        )}
      </div>
    </PageWrapper>
  );
};

export default SellItem;
