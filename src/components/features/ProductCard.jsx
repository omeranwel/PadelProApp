import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Tag, RefreshCw, Star, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMarketStore } from '../../store/marketStore';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { savedItems, toggleSave } = useMarketStore();
  const isSaved = savedItems.includes(product.id);

  const handleSave = (e) => {
    e.stopPropagation();
    toggleSave(product.id);
    toast.success(!isSaved ? 'Saved to your list' : 'Removed from saved');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Card className="p-0 overflow-hidden group border-border hover:border-accent-orange/40 shadow-xl shadow-black/20 flex flex-col h-full">
        <div className="relative aspect-square overflow-hidden bg-bg-elevated">
          <img 
            src={product.images[0]} 
            alt={product.title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge variant="blue" className="backdrop-blur-md">{product.category.toUpperCase()}</Badge>
            {product.openToTrade && <Badge variant="orange" className="backdrop-blur-md">OPEN TO TRADE</Badge>}
          </div>
          
          <button 
            onClick={handleSave}
            className="absolute top-4 right-4 p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:text-danger hover:bg-black/40 transition-all z-10"
          >
            <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} className={isSaved ? 'text-danger' : ''} />
          </button>

          <div className="absolute bottom-4 left-4">
             <div className="bg-bg-card/80 backdrop-blur-md rounded-lg px-2 py-1 border border-white/10 flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
               <span className="text-[10px] font-bold text-white uppercase tracking-wider">{product.condition}</span>
             </div>
          </div>
        </div>

        <div className="p-5 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-2">
             <h3 className="text-lg font-bold font-display group-hover:text-accent-orange transition-colors line-clamp-2">
                {product.title}
             </h3>
          </div>

          <div className="flex flex-col gap-2 mb-6">
            <div className="flex items-center justify-between">
               {product.price ? (
                 <span className="text-2xl font-bold text-accent-orange">Rs {product.price.toLocaleString()}</span>
               ) : (
                 <span className="text-lg font-bold text-accent-blue">Trading Only</span>
               )}
               <div className="text-[10px] text-text-muted font-bold uppercase">{product.createdAt}</div>
            </div>
            <div className="flex items-center gap-1 text-xs text-text-secondary">
               <MapPin size={12} className="text-text-muted" /> {product.location}
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
               <div className="w-6 h-6 rounded-full bg-bg-elevated flex items-center justify-center text-[10px] font-bold border border-border">
                  {product.sellerName[0]}
               </div>
               <span className="text-xs font-semibold text-text-secondary truncate max-w-[80px]">{product.sellerName}</span>
            </div>
            <button 
              onClick={() => navigate(`/market/${product.id}`)}
              className="text-sm font-bold text-accent-orange hover:gap-2 flex items-center gap-1 transition-all"
            >
               View Details
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
