import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Share2, Heart, ShieldCheck, MapPin, 
  MessageCircle, ExternalLink, Info, Star, ChevronLeft, ChevronRight,
  TrendingUp, Shield, HelpCircle
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { mockProducts } from '../data/mockProducts';
import { useMarketStore } from '../store/marketStore';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = mockProducts.find(p => p.id === id) || mockProducts[0];
  const { savedItems, toggleSave: toggleSaveStore } = useMarketStore();
  
  const [activeImage, setActiveImage] = useState(0);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerPrice, setOfferPrice] = useState(Math.round((product.price || 0) * 0.85));
  
  const isSaved = savedItems.includes(product.id);

  const toggleSave = () => {
    toggleSaveStore(product.id);
    toast.success(!isSaved ? 'Saved to your list' : 'Removed from saved');
  };

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-6 pb-20">
        {/* Breadcrumbs & Actions */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/market')}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors font-semibold"
          >
            <ArrowLeft size={20} /> Marketplace
          </button>
          <div className="flex gap-2">
            <button className="p-2.5 bg-bg-card border border-border rounded-xl hover:bg-bg-subtle transition-colors">
              <Share2 size={20} className="text-text-secondary" />
            </button>
            <button 
              onClick={toggleSave}
              className={`p-2.5 bg-bg-card border border-border rounded-xl transition-all ${isSaved ? 'border-danger/30 text-danger' : 'text-text-secondary hover:bg-bg-subtle'}`}
            >
              <Heart size={20} fill={isSaved ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Images Section */}
          <div className="lg:col-span-7 space-y-6">
             <div className="aspect-square rounded-[2.5rem] overflow-hidden bg-bg-card border border-border group relative">
                <img 
                  src={product.images[activeImage]} 
                  alt={product.title} 
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
                />
                
                {/* Image Navigation */}
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                  <button className="p-3 bg-black/30 backdrop-blur-md rounded-full text-white pointer-events-auto hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100"><ChevronLeft size={24} /></button>
                  <button className="p-3 bg-black/30 backdrop-blur-md rounded-full text-white pointer-events-auto hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100"><ChevronRight size={24} /></button>
                </div>
                
                <div className="absolute top-6 left-6 flex gap-2">
                   <Badge variant="orange" className="!bg-accent-orange px-4 py-2 text-[12px]">{product.condition.toUpperCase()}</Badge>
                   {product.openToTrade && <Badge variant="blue" className="!bg-accent-blue px-4 py-2 text-[12px]">TRADABLE</Badge>}
                </div>
             </div>
             
             <div className="grid grid-cols-4 gap-4">
                {product.images.concat(product.images, product.images).slice(0, 4).map((img, i) => (
                   <button 
                    key={i}
                    onClick={() => setActiveImage(i % product.images.length)}
                    className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${activeImage === (i % product.images.length) ? 'border-accent-orange' : 'border-transparent opacity-60 hover:opacity-100'}`}
                   >
                     <img src={img} className="w-full h-full object-cover" />
                   </button>
                ))}
             </div>
          </div>

          {/* Pricing & Checkout Section */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
               <div className="flex items-center gap-2 mb-2">
                  <Badge variant="blue" className="bg-bg-subtle text-accent-blue py-1">{product.category}</Badge>
                  <span className="text-xs text-text-muted font-bold">POSTED {product.createdAt.toUpperCase()}</span>
               </div>
               <h1 className="text-4xl font-bold font-display leading-[1.1]">{product.title}</h1>
               <div className="flex items-center gap-4">
                  <span className="text-4xl font-bold text-accent-orange">
                    {product.price ? `Rs ${product.price.toLocaleString()}` : 'Price on Request'}
                  </span>
                  {product.openToTrade && (
                    <div className="flex items-center gap-1.5 text-text-secondary text-sm font-semibold bg-bg-card px-3 py-1.5 rounded-lg border border-border">
                       <TrendingUp size={16} className="text-accent-blue" />
                       Open to Trade
                    </div>
                  )}
               </div>
            </div>

            <div className="flex items-center gap-2 text-text-secondary font-medium">
              <MapPin size={18} className="text-text-muted" />
              {product.location}
            </div>

            <div className="pt-8 border-t border-border space-y-6">
               <h4 className="text-xl font-bold font-display">Description</h4>
               <p className="text-text-secondary leading-relaxed text-lg">
                 {product.description}
                 <br /><br />
                 Authenticity guaranteed by the PadelPro community standards. Sellers must verify gear before high-value trades.
               </p>
            </div>

            {/* Seller Info */}
            <Card className="p-6 bg-bg-elevated/50 border-accent-blue/10">
               <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                     <Avatar name={product.sellerName} size="lg" />
                     <div>
                        <h5 className="font-bold text-lg">{product.sellerName}</h5>
                        <div className="flex items-center gap-1 text-xs text-text-secondary">
                          <Star size={12} className="text-warning fill-warning" />
                          <span className="font-bold text-text-primary">{product.sellerRating}</span>
                          <span>(24 Reviews)</span>
                        </div>
                     </div>
                  </div>
                  <Badge variant="success">TOP SELLER</Badge>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <Button className="flex-1 !bg-accent-blue" icon={MessageCircle}>Message Seller</Button>
                 {product.price ? (
                   <Button variant="outline" className="flex-1" onClick={() => setIsOfferModalOpen(true)}>Make Offer</Button>
                 ) : (
                   <Button variant="outline" className="flex-1" icon={Shield}>Trade Safety</Button>
                 )}
               </div>
            </Card>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 py-4">
               <div className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-bg-card">
                  <div className="p-2 bg-success/10 text-success rounded-lg"><ShieldCheck size={20} /></div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">Community<br/>Verified</div>
               </div>
               <div className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-bg-card">
                  <div className="p-2 bg-accent-blue/10 text-accent-blue rounded-lg"><HelpCircle size={20} /></div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">Safe Trade<br/>Guide</div>
               </div>
            </div>
          </div>
        </div>

        {/* Similar Items Preview */}
        <section className="mt-24 pt-24 border-t border-border">
           <h3 className="text-3xl font-bold font-display mb-12">More from {product.category}</h3>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {mockProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4).map(p => (
                <div key={p.id} className="cursor-pointer group" onClick={() => navigate(`/market/${p.id}`)}>
                   <div className="aspect-square rounded-2xl overflow-hidden mb-4 border border-border group-hover:border-accent-orange/50 transition-all">
                      <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   </div>
                   <h5 className="font-bold truncate">{p.title}</h5>
                   <p className="text-accent-orange font-bold text-sm">Rs {p.price?.toLocaleString() || 'Trade'}</p>
                </div>
              ))}
           </div>
        </section>
      </div>

      <Modal 
        isOpen={isOfferModalOpen} 
        onClose={() => setIsOfferModalOpen(false)}
        title="Make an Offer"
        className="max-w-md"
      >
        <div className="space-y-6">
          <p className="text-sm text-text-secondary">Send {product.sellerName} a price offer for {product.title}</p>
          <div>
            <label className="block text-sm font-bold mb-2">Your offer price (Rs)</label>
            <Input 
              type="number" 
              value={offerPrice} 
              onChange={(e) => setOfferPrice(Number(e.target.value))} 
              className="w-full"
            />
            {product.price && (
              <p className="text-xs text-text-muted mt-2">
                Listed price: Rs {product.price.toLocaleString()} — you're offering {Math.round((1 - offerPrice / product.price) * 100)}% below asking
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Message (Optional)</label>
            <textarea 
              className="w-full bg-bg-card border border-border rounded-xl p-3 text-text-primary focus:outline-none focus:border-accent-blue min-h-[100px]"
              placeholder="Add a note to the seller..."
            />
          </div>
          <Button 
            className="w-full" 
            onClick={() => {
              toast.success(`Offer sent! ${product.sellerName} will be notified.`);
              setIsOfferModalOpen(false);
            }}
          >
            Send Offer
          </Button>
        </div>
      </Modal>
    </PageWrapper>
  );
};

export default ProductDetail;
