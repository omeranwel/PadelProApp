import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, Clock, Filter, SlidersHorizontal, Grid, Map as MapIcon, X } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import CourtCard from '../components/features/CourtCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { useCourtsStore } from '../store/courtsStore';

const Courts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('grid');
  const [filters, setFilters] = useState({
    surface: 'All',
    price4to6k: false,
    rating45Plus: false
  });
  
  const { courts, loading: storeLoading, fetchCourts } = useCourtsStore();
  const [isLoading, setIsLoading] = useState(true);
  React.useEffect(() => {
    fetchCourts().finally(() => setIsLoading(false));
  }, []);

  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const sortRef = React.useRef();

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) setSortOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sortOptions = [
    { label: 'Rating', value: 'rating' },
    { label: 'Price: Low to High', value: 'priceLow' },
    { label: 'Price: High to Low', value: 'priceHigh' },
    { label: 'Distance', value: 'distance' },
    { label: 'Newest', value: 'newest' },
  ];

  const filteredCourts = useMemo(() => {
    let list = [...courts].filter(court => {
      const matchesSearch = court.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           court.area.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSurface = filters.surface === 'All' || court.surface === filters.surface;
      const matchesPrice = filters.price4to6k ? (court.pricePerHour >= 4000 && court.pricePerHour <= 6000) : true;
      const matchesRating = filters.rating45Plus ? (court.rating >= 4.5) : true;
      
      return matchesSearch && matchesSurface && matchesPrice && matchesRating;
    });
    return list.sort((a, b) => {
      if (sortBy === 'priceLow') return a.pricePerHour - b.pricePerHour;
      if (sortBy === 'priceHigh') return b.pricePerHour - a.pricePerHour;
      return (b.rating || 0) - (a.rating || 0);
    });
  }, [courts, searchQuery, filters, sortBy]);

  return (
    <PageWrapper>
      {/* Search Hero */}
      <section className="bg-bg-card border-b border-border py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold font-display mb-2">Find a Court</h1>
            <p className="text-text-secondary">Explore and book the best padel facilities across Karachi.</p>
          </div>
          
          <div className="bg-bg-elevated p-2 rounded-2xl border border-border flex flex-col md:flex-row gap-2 shadow-2xl shadow-black/40">
            <div className="flex-1 group">
              <Input 
                placeholder="Search by court name or area (DHA, Clifton...)" 
                className="!mb-0"
                icon={Search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="hidden md:flex items-center px-4 bg-bg-card border border-border rounded-lg gap-2 cursor-pointer hover:bg-bg-subtle transition-colors" onClick={() => alert('Date filtering across all courts will be enabled in v2!')}>
              <Calendar size={18} className="text-accent-blue" />
              <span className="text-sm font-medium">Tomorrow</span>
            </div>
            <div className="hidden md:flex items-center px-4 bg-bg-card border border-border rounded-lg gap-2 cursor-pointer hover:bg-bg-subtle transition-colors" onClick={() => alert('Time-slot filtering across all courts will be enabled in v2!')}>
              <Clock size={18} className="text-accent-blue" />
              <span className="text-sm font-medium">18:00 - 19:00</span>
            </div>
            <Button className="md:px-8" onClick={() => document.getElementById("courts-grid")?.scrollIntoView({ behavior: 'smooth' })}>Search</Button>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="sticky top-[80px] z-[90] bg-bg-base/80 backdrop-blur-md border-b border-border py-4 px-6 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
            <div className="flex bg-bg-elevated p-1 rounded-lg border border-border shrink-0">
               {['All', 'Indoor', 'Outdoor'].map((s) => (
                 <button 
                  key={s}
                  onClick={() => setFilters({...filters, surface: s})}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${filters.surface === s ? 'bg-bg-card text-accent-blue shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                 >
                   {s}
                 </button>
               ))}
            </div>
            <div className="h-6 w-px bg-border hidden md:block" />
            <div className="flex gap-2 shrink-0">
              <Badge onClick={() => setFilters(prev => ({...prev, price4to6k: !prev.price4to6k}))} variant={filters.price4to6k ? 'ai' : 'blue'} className="py-1.5 cursor-pointer hover:bg-accent-blue/20">Rs 4k - 6k</Badge>
              <Badge onClick={() => setFilters(prev => ({...prev, rating45Plus: !prev.rating45Plus}))} variant={filters.rating45Plus ? 'ai' : 'blue'} className="py-1.5 cursor-pointer hover:bg-accent-blue/20">4.5★ Plus</Badge>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end">
            <div className="flex bg-bg-elevated p-1 rounded-lg border border-border">
               <button onClick={() => setView('grid')} className={`p-1.5 rounded-md ${view === 'grid' ? 'bg-bg-card text-accent-blue' : 'text-text-muted'}`}><Grid size={18} /></button>
               <button onClick={() => setView('map')} className={`p-1.5 rounded-md ${view === 'map' ? 'bg-bg-card text-accent-blue' : 'text-text-muted'}`}><MapIcon size={18} /></button>
            </div>
            <div className="relative" ref={sortRef}>
              <Button variant="secondary" size="sm" icon={SlidersHorizontal} onClick={() => setSortOpen(!sortOpen)}>
                Sort: {sortOptions.find(o => o.value === sortBy)?.label}
              </Button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-bg-elevated border border-border rounded-xl shadow-2xl overflow-hidden py-1 z-[100]"
                  >
                    {sortOptions.map(opt => (
                      <button 
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-bg-subtle transition-colors ${sortBy === opt.value ? 'text-accent-blue font-bold bg-accent-blue/5' : 'text-text-primary'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section id="courts-grid" className="px-6 max-w-7xl mx-auto pb-20 pt-4">
        <div className="flex items-center justify-between mb-8">
           <h3 className="font-bold text-text-secondary">Showing <span className="text-text-primary">{filteredCourts.length} courts</span> near Karachi</h3>
           {searchQuery && (
             <button onClick={() => setSearchQuery('')} className="flex items-center gap-1 text-sm text-accent-blue font-bold">
               <X size={14} /> Clear Search
             </button>
           )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({length:6}).map((_,i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredCourts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourts.map((court, i) => (
              <CourtCard key={court.id} court={court} />
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-bg-elevated rounded-full flex items-center justify-center text-text-muted mb-6">
              <Search size={32} />
            </div>
            <h4 className="text-xl font-bold mb-2">No courts found</h4>
            <p className="text-text-secondary max-w-xs mx-auto mb-8">Try adjusting your filters or search query to find available courts.</p>
            <Button variant="outline" onClick={() => { setSearchQuery(''); setFilters({surface: 'All', priceRange: [0, 10000], rating: 'Any'}); }}>Reset All Filters</Button>
          </div>
        )}
      </section>
    </PageWrapper>
  );
};

export default Courts;
