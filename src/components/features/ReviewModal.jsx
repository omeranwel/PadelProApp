import React, { useState } from 'react';
import { Star } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const ReviewModal = ({ isOpen, onClose, booking }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Review submitted! Thank you.');
      onClose();
    }, 1000);
  };

  if (!booking) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Leave a Review" className="max-w-md">
      <div className="space-y-6 text-center">
        <div>
          <h4 className="font-bold text-lg font-display">{booking.courtName}</h4>
          <p className="text-sm text-text-secondary">{new Date(booking.date).toLocaleDateString()} • {booking.time}</p>
        </div>

        <div>
          <h5 className="font-bold mb-4">How was your experience?</h5>
          <div className="flex items-center justify-center gap-2 mb-6 cursor-pointer">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={36}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className={star <= (hoverRating || rating) ? "text-warning fill-warning" : "text-border"}
                style={{ filter: star <= (hoverRating || rating) ? 'drop-shadow(0 0 8px rgba(234, 179, 8, 0.4))' : 'none' }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4 text-left">
          {['Court Condition', 'Facilities', 'Value for Money'].map(aspect => (
            <div key={aspect} className="flex items-center justify-between text-sm">
               <span className="font-medium text-text-secondary">{aspect}</span>
               <input type="range" min={1} max={5} defaultValue={4} className="w-32 accent-warning" />
            </div>
          ))}
        </div>

        <div className="text-left mt-6">
          <label className="block text-sm font-bold mb-2">Tell other players about your experience...</label>
          <textarea 
            className="w-full bg-bg-card border border-border rounded-xl p-3 text-text-primary focus:outline-none focus:border-accent-blue min-h-[100px]"
            placeholder="How was the turf? Was the lighting good?"
            minLength={20}
          />
        </div>

        <Button 
          className="w-full" 
          onClick={handleSubmit} 
          disabled={loading || rating === 0}
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </Button>
      </div>
    </Modal>
  );
};

export default ReviewModal;
