import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { addDays, format, isToday, isTomorrow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, MapPin, Calendar, Clock, ArrowLeft, Share2, Heart,
  Coffee, Car, ShieldCheck, Wifi, Info, ChevronRight, Check
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { mockCourts } from '../data/mockCourts';
import toast from 'react-hot-toast';

const CourtDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const court = mockCourts.find(c => c.id === id) || mockCourts[0];
  
  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(today, i);
    return {
      label: isToday(d) ? 'Today' : isTomorrow(d) ? 'Tomorrow' : format(d, 'EEE'),
      date: format(d, 'yyyy-MM-dd'),
      day: format(d, 'd'),
    };
  });

  const [selectedDate, setSelectedDate] = useState(format(today, 'yyyy-MM-dd'));
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [duration, setDuration] = useState(1);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const times = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", 
    "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"
  ];

  const handleBooking = () => {
    if (!selectedSlot) {
      toast.error('Please select a time slot first');
      return;
    }
    setIsBookingModalOpen(true);
  };

  const amenities = [
    { name: 'Parking', icon: Car },
    { name: 'Café', icon: Coffee },
    { name: 'Changing Rooms', icon: ShieldCheck },
    { name: 'Wifi', icon: Wifi },
  ];

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-6 pb-20">
        {/* Navigation / Actions */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/courts')}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors font-semibold"
          >
            <ArrowLeft size={20} /> Back to Search
          </button>
          <div className="flex gap-2">
            <button className="p-2.5 bg-bg-card border border-border rounded-xl hover:bg-bg-subtle transition-colors">
              <Share2 size={20} className="text-text-secondary" />
            </button>
            <button className="p-2.5 bg-bg-card border border-border rounded-xl hover:bg-bg-subtle transition-colors">
              <Heart size={20} className="text-text-secondary" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Details & Images */}
          <div className="lg:col-span-2 space-y-12">
            {/* Gallery */}
            <div className="space-y-4">
              <motion.div 
                className="aspect-[16/9] rounded-3xl overflow-hidden bg-bg-card border border-border"
                layoutId={`court-img-${court.id}`}
              >
                <img src={court.images[activeImage]} alt={court.name} className="w-full h-full object-cover" />
              </motion.div>
              <div className="grid grid-cols-4 gap-4">
                {court.images.concat(court.images).slice(0, 4).map((img, i) => (
                   <button 
                    key={i} 
                    onClick={() => setActiveImage(i % court.images.length)}
                    className={`aspect-video rounded-xl overflow-hidden border-2 transition-all ${activeImage === (i % court.images.length) ? 'border-accent-blue scale-95' : 'border-transparent opacity-60 hover:opacity-100'}`}
                   >
                     <img src={img} className="w-full h-full object-cover" />
                   </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold font-display mb-2">{court.name}</h1>
                  <p className="flex items-center gap-1.5 text-text-secondary font-medium">
                    <MapPin size={18} className="text-accent-blue" />
                    {court.address}, {court.area}
                  </p>
                </div>
                <div className="flex items-center gap-4 bg-bg-card p-3 rounded-2xl border border-border self-start">
                   <div className="flex items-center gap-1">
                      <Star size={20} className="text-warning fill-warning" />
                      <span className="text-xl font-bold">{court.rating}</span>
                   </div>
                   <div className="h-8 w-px bg-border" />
                   <div className="text-text-muted">
                      <span className="font-bold text-text-primary block leading-none">{court.reviewCount}</span>
                      <span className="text-[10px] uppercase font-bold">Reviews</span>
                   </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant={court.surface === 'Indoor' ? 'blue' : 'orange'}>{court.surface}</Badge>
                <Badge variant="blue">PROFESSIONAL TURF</Badge>
                <Badge variant="blue">PANORAMIC GLASS</Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                {amenities.map(a => (
                   <div key={a.name} className="flex flex-col items-center justify-center p-4 bg-bg-card border border-border rounded-2xl gap-2">
                      <a.icon size={24} className="text-text-muted" />
                      <span className="text-xs font-bold text-text-secondary uppercase">{a.name}</span>
                   </div>
                ))}
              </div>

              <p className="text-text-secondary leading-relaxed text-lg">
                {court.description}
              </p>
            </div>

            {/* Booking Grid */}
            <div className="pt-12 border-t border-border">
              <h3 className="text-2xl font-bold font-display mb-8">Select Your Slot</h3>
              
              {/* Date Selector */}
              <div className="flex gap-4 overflow-x-auto pb-4 mb-8 no-scrollbar">
                {dates.map((d) => (
                   <button
                    key={d.date}
                    onClick={() => setSelectedDate(d.date)}
                    className={`
                      flex flex-col items-center justify-center min-w-[80px] py-4 rounded-2xl border transition-all
                      ${selectedDate === d.date ? 'bg-accent-blue border-accent-blue shadow-lg shadow-accent-blue/20' : 'bg-bg-card border-border hover:border-border-strong text-text-secondary'}
                    `}
                   >
                     <span className={`text-[10px] uppercase font-bold ${selectedDate === d.date ? 'text-white/80' : ''}`}>{d.label}</span>
                     <span className={`text-xl font-bold ${selectedDate === d.date ? 'text-white' : 'text-text-primary'}`}>{d.day}</span>
                   </button>
                ))}
              </div>

              {/* Time Grid */}
              {(!court.slots || !court.slots[selectedDate] || Object.keys(court.slots[selectedDate] || {}).length === 0) ? (
                <div className="py-12 text-center bg-bg-card border border-border rounded-2xl flex items-center justify-center">
                  <p className="text-text-secondary font-medium">No slots available for this date — try another day.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                   {times.map(t => {
                     const isBooked = court.slots?.[selectedDate]?.[t] === 'booked';
                     const isSelected = selectedSlot === t;
                     return (
                       <button
                          key={t}
                          disabled={isBooked}
                          onClick={() => setSelectedSlot(t)}
                          className={`
                            relative py-4 rounded-xl border font-bold transition-all flex items-center justify-center
                            ${isBooked ? 'bg-bg-subtle border-border opacity-30 cursor-not-allowed line-through' : 
                              isSelected ? 'bg-accent-blue border-accent-blue text-white ring-4 ring-accent-blue/20' : 
                              'bg-bg-card border-border hover:border-accent-blue text-text-primary/80'}
                          `}
                       >
                         {isSelected && <Check size={16} className="absolute left-3" />}
                         {t}
                         {!isBooked && !isSelected && <div className="absolute right-2 top-2 w-1.5 h-1.5 rounded-full bg-success" />}
                       </button>
                     );
                   })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Checkout Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              <Card className="p-8 space-y-8 shadow-2xl shadow-black/40 border-accent-blue/20 bg-gradient-to-br from-bg-card to-bg-elevated">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold font-display">Booking Summary</h3>
                  <Badge variant="blue">RS {court.pricePerHour}/HR</Badge>
                </div>

                <div className="space-y-4">
                   <div className="flex items-start gap-3">
                      <div className="p-2 bg-accent-blue/10 text-accent-blue rounded-lg"><Calendar size={20} /></div>
                      <div>
                        <p className="text-xs text-text-muted font-bold uppercase">Date</p>
                        <p className="font-bold">{new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-3">
                      <div className="p-2 bg-accent-blue/10 text-accent-blue rounded-lg"><Clock size={20} /></div>
                      <div>
                        <p className="text-xs text-text-muted font-bold uppercase">Time Slot</p>
                        <p className={`font-bold ${!selectedSlot ? 'text-text-muted italic text-sm' : ''}`}>
                          {selectedSlot ? `${selectedSlot} - ${parseInt(selectedSlot.split(':')[0]) + 1}:00` : 'Select a slot on the left'}
                        </p>
                      </div>
                   </div>
                </div>

                <div className="pt-6 border-t border-border space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Court Fee (1 hr)</span>
                    <span className="font-bold">Rs {court.pricePerHour.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Service Fee</span>
                    <span className="font-bold">Rs 200</span>
                  </div>
                  <div className="flex justify-between items-end pt-4 border-t border-border">
                    <span className="text-text-primary font-bold">Total Price</span>
                    <span className="text-3xl font-bold font-display text-accent-orange">Rs {(court.pricePerHour + 200).toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-bg-subtle p-4 rounded-xl text-center space-y-3">
                   <div className="flex items-center justify-center gap-2 text-text-muted">
                      <Info size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Free Cancellation up to 24h</span>
                   </div>
                   <Button 
                    className="w-full h-14 text-lg font-bold shadow-xl shadow-accent-orange/20" 
                    onClick={handleBooking}
                    disabled={!selectedSlot}
                  >
                    Book Now
                  </Button>
                </div>
              </Card>

              {/* Help Card */}
              <div className="bg-accent-blue/5 border border-accent-blue/20 p-6 rounded-2xl flex items-center gap-4">
                 <div className="w-12 h-12 bg-accent-blue text-white rounded-full flex items-center justify-center shrink-0">✨</div>
                 <div>
                   <h5 className="font-bold text-sm">Need a Partner?</h5>
                   <p className="text-xs text-text-secondary">Book this slot and we'll help you find a match partner.</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)}
        title="Confirm Booking"
        className="max-w-md"
      >
        <div className="space-y-8">
           <div className="bg-bg-elevated p-8 rounded-3xl border border-dashed border-border-strong text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 bg-accent-orange text-white text-[10px] font-bold uppercase rotate-45 translate-x-3 -translate-y-1 w-20">TICKET</div>
              <h4 className="text-2xl font-bold font-display mb-1">{court.name}</h4>
              <p className="text-text-secondary text-sm mb-6">{court.area}, Karachi</p>
              
              <div className="grid grid-cols-2 gap-4 text-left border-t border-border pt-6">
                <div>
                  <p className="text-[10px] text-text-muted font-bold uppercase">Date</p>
                  <p className="text-sm font-bold">{new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-[10px] text-text-muted font-bold uppercase">Time</p>
                  <p className="text-sm font-bold">{selectedSlot}</p>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-border flex items-center justify-between">
                 <div className="flex flex-col items-start">
                   <p className="text-[10px] text-text-muted font-bold uppercase">Booking ID</p>
                   <p className="font-mono text-xs font-bold">#PK-PDL-9281</p>
                 </div>
                 <div className="h-10 w-10 bg-text-primary rounded-md flex items-center justify-center overflow-hidden">
                    {/* Fake QR code */}
                    <div className="grid grid-cols-3 gap-0.5">
                       {[...Array(9)].map((_, i) => <div key={i} className={`w-2 h-2 ${Math.random() > 0.5 ? 'bg-bg-base' : 'bg-transparent'}`} />)}
                    </div>
                 </div>
              </div>
           </div>

           <div className="space-y-4">
             <div className="flex flex-col gap-2">
               <p className="text-sm font-bold">Select Payment Method</p>
               <div className="grid grid-cols-2 gap-3">
                 <button className="flex items-center justify-center p-3 rounded-xl border-2 border-accent-blue bg-accent-blue/5 text-sm font-bold text-accent-blue">💳 Card</button>
                 <button className="flex items-center justify-center p-3 rounded-xl border border-border text-sm font-bold text-text-secondary">💵 Cash</button>
               </div>
             </div>
             
             <Button className="w-full mt-4" onClick={() => {
                toast.success('Booking Successful! Check your dashboard.');
                setIsBookingModalOpen(false);
                navigate('/dashboard');
             }}>Pay & Confirm Booking</Button>
           </div>
        </div>
      </Modal>
    </PageWrapper>
  );
};

export default CourtDetail;
