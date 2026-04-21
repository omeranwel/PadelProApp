import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, ShoppingBag, Plus, X, Tag, Heart } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import ProductCard from '../components/features/ProductCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { useMarketStore } from '../store/marketStore';

const Market = () => {
  const navigate = useNavigate();
  const { savedItems, listings, fetchListings, loading } = useMarketStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({ priceMin: 0, priceMax: 50000, conditions: [], sortBy: 'newest' });
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  
  React.useEffect(() => {
    fetchListings();
  }, [fetchListings]);
  
  const categories = ['All', 'Rackets', 'Balls', 'Shoes', 'Bags', 'Accessories'];

  const filteredProducts = useMemo(() => {
    return listings.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchesSaved = showSavedOnly ? savedItems.includes(item.id) : true;
      const matchesCondition = filters.conditions.length === 0 || filters.conditions.includes(item.condition);
      const matchesPrice = item.price ? (item.price >= filters.priceMin && item.price <= filters.priceMax) : true;
      return matchesSearch && matchesCategory && matchesSaved && matchesCondition && matchesPrice;
    }).sort((a, b) => {
      if (filters.sortBy === 'priceLow') return (a.price || 0) - (b.price || 0);
      if (filters.sortBy === 'priceHigh') return (b.price || 0) - (a.price || 0);
      return 0; // newest default
    });
  }, [searchQuery, activeCategory, showSavedOnly, savedItems, filters]);

  const toggleCondition = (cond) => {
    setFilters(prev => ({
      ...prev,
      conditions: prev.conditions.includes(cond) 
        ? prev.conditions.filter(c => c !== cond) 
        : [...prev.conditions, cond]
    }));
  };

  return (
    <PageWrapper>
      {/* Market Header */}
      <section className="bg-[radial-gradient(circle_at_50%_100%,_#1E1B10_0%,_#09090F_100%)] border-b border-border py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="max-w-xl">
             <Badge variant="orange" className="mb-4">COMMUNITY MARKETPLACE</Badge>
             <h1 className="text-5xl font-bold font-display mb-6">Buy, Sell & Trade <span className="text-accent-orange">Padel Gear</span></h1>
             <p className="text-text-secondary text-lg">Karachi's dedicated hub for authentic padel equipment. Find new arrivals and local trades.</p>
          </div>
          <div className="flex gap-4 group">
             <Button 
               variant={showSavedOnly ? "primary" : "secondary"} 
               className={showSavedOnly ? "!bg-accent-blue" : ""}
               icon={Heart} 
               onClick={() => setShowSavedOnly(!showSavedOnly)}
             >
               Saved Items {savedItems.length > 0 && <span className="ml-1 bg-black/20 px-1.5 rounded-full text-[10px]">{savedItems.length}</span>}
             </Button>
             <Button className="!bg-accent-blue" icon={Plus} onClick={() => navigate('/market/sell')}>Sell Item</Button>
          </div>
        </div>
      </section>

      {/* Main Filter Section */}
      <section className="sticky top-[80px] z-[90] bg-bg-base/80 backdrop-blur-md border-b border-border py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6">
           <div className="flex-1 w-full">
              <Input 
                placeholder="Search for rackets, gear, or sellers..." 
                className="!mb-0"
                icon={Search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
             <div className="flex bg-bg-elevated p-1 rounded-lg border border-border shrink-0">
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${activeCategory === cat ? 'bg-bg-card text-accent-orange shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                  >
                    {cat}
                  </button>
                ))}
             </div>
             <Button 
                variant={filtersOpen ? "primary" : "secondary"} 
                className={filtersOpen ? "!bg-accent-blue" : ""}
                icon={SlidersHorizontal} 
                onClick={() => setFiltersOpen(true)}
             >
                Filters {filters.conditions.length > 0 && <span className="ml-1 bg-white text-accent-blue text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{filters.conditions.length}</span>}
             </Button>
           </div>
        </div>
      </section>

      {/* Grid */}
      <section className="px-6 max-w-7xl mx-auto pt-12 pb-24">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-4">
             <h3 className="font-bold text-text-secondary">Explore <span className="text-text-primary">{filteredProducts.length} Results</span></h3>
             {activeCategory !== 'All' && <Badge variant="blue" className="h-6">{activeCategory}</Badge>}
           </div>
           <div className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
             Sort by: <span className="text-text-primary cursor-pointer hover:text-accent-orange transition-colors">Newest Arrivals</span>
           </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({length:8}).map((_,i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center text-center">
             <div className="w-24 h-24 bg-bg-elevated rounded-3xl flex items-center justify-center text-text-muted mb-8 rotate-12">
                <ShoppingBag size={40} />
             </div>
             <h2 className="text-2xl font-bold mb-3 font-display">No gear found</h2>
             <p className="text-text-secondary max-w-xs mb-8 italic">"The search for the perfect racket continues..."</p>
             <Button variant="outline" onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}>Clear Search</Button>
          </div>
        )}
      </section>

      {/* Sell CTA Mini */}
      <section className="px-6 max-w-7xl mx-auto pb-24">
         <div className="bg-gradient-to-r from-accent-orange/10 to-accent-blue/10 border border-border rounded-[2.5rem] p-12 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-orange/5 blur-3xl -z-10" />
            <div className="max-w-lg">
               <h3 className="text-3xl font-bold font-display mb-4">Unused gear in your bag?</h3>
               <p className="text-text-secondary">List your rackets, shoes, or accessories in under a minute and reach the entire Karachi padel community.</p>
            </div>
            <Button size="lg" className="px-12 flex-shrink-0" onClick={() => navigate('/market/sell')}>Start Selling</Button>
         </div>
      </section>

      {/* Filter Drawer */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-80 bg-bg-card border-l border-border shadow-2xl z-[150] p-6 overflow-y-auto"
          >
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-xl font-bold font-display">Filter Results</h3>
               <button onClick={() => setFiltersOpen(false)} className="p-2 bg-bg-subtle rounded-full hover:text-accent-orange"><X size={20} /></button>
             </div>
             
             <div className="space-y-8">
               <div>
                  <h4 className="font-bold text-sm mb-4">Price Range</h4>
                  <div className="flex items-center gap-4">
                    <Input type="number" placeholder="Min" value={filters.priceMin} onChange={(e) => setFilters(prev => ({...prev, priceMin: Number(e.target.value)}))} className="!mb-0" />
                    <span>-</span>
                    <Input type="number" placeholder="Max" value={filters.priceMax} onChange={(e) => setFilters(prev => ({...prev, priceMax: Number(e.target.value)}))} className="!mb-0" />
                  </div>
               </div>

               <div>
                 <h4 className="font-bold text-sm mb-4">Condition</h4>
                 <div className="space-y-2">
                   {['New', 'Like New', 'Good', 'Used', 'Worn'].map(cond => (
                     <label key={cond} className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={filters.conditions.includes(cond)} onChange={() => toggleCondition(cond)} className="w-4 h-4 rounded border-border bg-bg-base text-accent-blue focus:ring-accent-blue focus:ring-offset-bg-card" />
                        <span className="text-sm">{cond}</span>
                     </label>
                   ))}
                 </div>
               </div>

               <div>
                 <h4 className="font-bold text-sm mb-4">Sort By</h4>
                 <div className="space-y-2">
                    {[
                      { label: 'Newest First', value: 'newest' },
                      { label: 'Price: Low to High', value: 'priceLow' },
                      { label: 'Price: High to Low', value: 'priceHigh' },
                      { label: 'Most Viewed', value: 'mostViewed' }
                    ].map(opt => (
                      <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                         <input type="radio" name="sortBy" checked={filters.sortBy === opt.value} onChange={() => setFilters(prev => ({...prev, sortBy: opt.value}))} className="w-4 h-4 border-border bg-bg-base text-accent-orange focus:ring-accent-orange focus:ring-offset-bg-card" />
                         <span className="text-sm">{opt.label}</span>
                      </label>
                    ))}
                 </div>
               </div>
             </div>

             <div className="mt-12 space-y-3">
               <Button className="w-full !bg-accent-orange" onClick={() => setFiltersOpen(false)}>Apply Filters</Button>
               <Button variant="ghost" className="w-full text-text-secondary" onClick={() => setFilters({ priceMin: 0, priceMax: 50000, conditions: [], sortBy: 'newest' })}>Clear All</Button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
};

export default Market;
