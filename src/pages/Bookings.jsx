import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, MapPin, Receipt, 
  ChevronRight, ArrowLeft, Download, XCircle, 
  Filter, CheckCircle2, AlertCircle, History
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ReviewModal from '../components/features/ReviewModal';
import { mockBookings } from '../data/mockBookings';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Bookings = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('upcoming');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);

  const filteredBookings = mockBookings.filter(b => b.status === filter);

  const handleReview = (booking) => {
    setReviewBooking(booking);
    setReviewModalOpen(true);
  };

  const handleCancelRequest = (id) => {
    toast.error('Cancellation request sent to club.');
  };

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto px-6 pb-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
           <div>
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-2 text-sm font-semibold"
              >
                <ArrowLeft size={16} /> My Dashboard
              </button>
              <h1 className="text-4xl font-bold font-display">My Bookings</h1>
           </div>
           
           <div className="flex bg-bg-elevated p-1 rounded-2xl border border-border shadow-md">
              {[
                { id: 'upcoming', label: 'Upcoming', icon: Calendar },
                { id: 'past', label: 'History', icon: History },
                { id: 'cancelled', label: 'Cancelled', icon: XCircle },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setFilter(t.id)}
                  className={`
                    px-6 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2
                    ${filter === t.id ? 'bg-bg-card text-text-primary shadow-sm border border-border' : 'text-text-muted hover:text-text-secondary'}
                  `}
                >
                  <t.icon size={14} />
                  {t.label}
                </button>
              ))}
           </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
           {filteredBookings.length > 0 ? (
             filteredBookings.map((booking, i) => (
               <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
               >
                 <Card className="hover:border-border-strong transition-all">
                    <div className="flex flex-col lg:flex-row gap-8">
                       {/* Ticket Header */}
                       <div className="flex-1 space-y-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                             <div>
                                <h3 className="text-2xl font-bold font-display">{booking.courtName}</h3>
                                <p className="text-text-secondary flex items-center gap-1.5 text-sm font-medium mt-1">
                                   <MapPin size={14} className="text-text-muted" /> Karachi, Pakistan
                                </p>
                             </div>
                             <div className="flex items-center gap-2">
                                {booking.status === 'upcoming' && <Badge variant="blue" className="bg-accent-blue/10 text-accent-blue py-1.5">CONFIRMED</Badge>}
                                {booking.status === 'past' && <Badge variant="success" className="bg-success/10 text-success py-1.5">COMPLETED</Badge>}
                                {booking.status === 'cancelled' && <Badge variant="danger" className="bg-danger/10 text-danger py-1.5">CANCELLED</Badge>}
                                {booking.isMatch && <Badge variant="orange" className="bg-accent-orange/10 text-accent-orange py-1.5 px-3">COMPETITIVE MATCH</Badge>}
                             </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-dashed border-border">
                             <div className="space-y-1">
                                <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest block">Date</span>
                                <span className="text-sm font-bold text-text-primary">{new Date(booking.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', weekday: 'short' })}</span>
                             </div>
                             <div className="space-y-1">
                                <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest block">Time</span>
                                <span className="text-sm font-bold text-text-primary">{booking.time} ({booking.duration}h)</span>
                             </div>
                             <div className="space-y-1">
                                <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest block">Booking ID</span>
                                <span className="text-sm font-mono font-bold text-text-primary">#PK-{booking.id.split('-')[1]}</span>
                             </div>
                             <div className="space-y-1">
                                <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest block">Total Paid</span>
                                <span className="text-sm font-bold text-accent-orange">Rs {booking.price.toLocaleString()}</span>
                             </div>
                          </div>
                       </div>

                       {/* Ticket Actions */}
                       <div className="flex flex-row lg:flex-col justify-end lg:justify-between gap-3 min-w-[160px] pt-6 lg:pt-0 lg:pl-8 lg:border-l border-border">
                          {booking.status === 'upcoming' ? (
                            <>
                               <Button className="w-full flex-1 lg:flex-none" icon={Calendar}>Reschedule</Button>
                               <Button variant="secondary" size="sm" className="w-full flex-1 lg:flex-none" onClick={() => handleCancelRequest(booking.id)}>Request Cancel</Button>
                            </>
                          ) : (
                            <>
                               <Button variant="ghost" className="w-full justify-center lg:justify-start" icon={Download}>Receipt</Button>
                               <Button variant="outline" className="w-full justify-center lg:justify-start" icon={Receipt} onClick={() => navigate(`/courts/${booking.courtId}`)}>Book Again</Button>
                            </>
                          )}
                       </div>
                    </div>
                 </Card>
               </motion.div>
             ))
           ) : (
             <div className="py-32 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-bg-elevated rounded-full flex items-center justify-center text-text-muted mb-8 border-2 border-dashed border-border">
                   {filter === 'upcoming' ? <Calendar size={40} /> : <History size={40} />}
                </div>
                <h3 className="text-2xl font-bold mb-3 font-display">No {filter} bookings</h3>
                <p className="text-text-secondary max-w-xs mb-10 italic">Looks like your court calendar is clear for now.</p>
                <Button variant="outline" size="lg" onClick={() => navigate('/courts')}>Find a Court to Play</Button>
             </div>
           )}
        </div>

        {/* Cancellation Policy Note */}
        <div className="mt-20 p-8 rounded-3xl bg-bg-card border border-border flex flex-col md:flex-row items-center gap-8">
           <div className="w-12 h-12 bg-warning/10 text-warning rounded-xl flex items-center justify-center shrink-0">
              <AlertCircle size={24} />
           </div>
           <div className="flex-1 space-y-1">
              <h4 className="font-bold">Cancellation Policy</h4>
              <p className="text-sm text-text-secondary">Free cancellation is available up to 24 hours before your booking time. For changes within 24 hours, please contact the club directly via the PadelPro support hub.</p>
           </div>
           <Button variant="ghost" className="text-accent-blue font-bold whitespace-nowrap">View Full Policy</Button>
        </div>
      </div>
      <ReviewModal 
        isOpen={reviewModalOpen} 
        onClose={() => setReviewModalOpen(false)} 
        booking={reviewBooking} 
      />
    </PageWrapper>
  );
};

export default Bookings;
