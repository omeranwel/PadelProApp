import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Calendar, Users, Coffee, Car, Wifi, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';



const CourtCard = ({ court }) => {
  const navigate = useNavigate();

  const amenityIcons = {
    'Parking': Car,
    'Café': Coffee,
    'Wifi': Wifi,
    'Changing Rooms': ShieldCheck
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Card className="p-0 overflow-hidden group border-border hover:border-accent-blue/40 shadow-xl shadow-black/20">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img 
            src={court.images[0]} 
            alt={court.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
          
          {/* Top badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <Badge variant={court.surface === 'Indoor' ? 'blue' : 'orange'} className="backdrop-blur-md">
              {court.surface.toUpperCase()}
            </Badge>
          </div>
          
          <div className="absolute top-4 right-4">
            <div className="bg-bg-card/80 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/10">
              <span className="text-accent-orange font-bold text-lg">Rs {court.pricePerHour.toLocaleString()}</span>
              <span className="text-text-muted text-[10px] ml-1">/HR</span>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-1.5 backdrop-blur-md bg-black/20 px-2 py-1 rounded-md">
              <Star size={14} className="text-warning fill-warning" />
              <span className="font-bold text-sm">{court.rating}</span>
              <span className="text-[10px] opacity-70">({court.reviewCount})</span>
            </div>
            <div className="text-xs font-medium flex items-center gap-1">
              <MapPin size={12} /> {court.area}
            </div>
          </div>
        </div>

        <div className="p-5 flex flex-col h-full">
          <div className="mb-4">
            <h3 className="text-xl font-bold font-display group-hover:text-accent-blue transition-colors truncate">
              {court.name}
            </h3>
            <p className="text-xs text-text-secondary mt-1">{court.club}</p>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            {court.amenities.slice(0, 3).map((amenity, i) => {
              const Icon = amenityIcons[amenity] || ShieldCheck;
              return (
                <div key={i} className="flex items-center gap-1.5 text-text-secondary">
                  <Icon size={14} strokeWidth={2.5} />
                  <span className="text-[10px] uppercase font-bold tracking-wider">{amenity}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-text-muted font-bold uppercase">Next Available</span>
              {(() => {
                const todayKey = format(new Date(), 'yyyy-MM-dd');
                const currentHour = new Date().getHours();
                const todaySlots = court.slots?.[todayKey] || {};
                const nextSlot = Object.entries(todaySlots).find(
                  ([time, status]) => status === 'available' && parseInt(time.split(':')[0]) >= currentHour
                );
                const nextAvailText = nextSlot ? `Today, ${nextSlot[0]}` : 'Check availability';
                const nextAvailColor = nextSlot ? 'text-success' : 'text-text-muted';
                return <span className={`text-xs font-bold ${nextAvailColor}`}>{nextAvailText}</span>;
              })()}
            </div>
            <Button size="sm" onClick={() => navigate(`/courts/${court.id}`)}>Book Now</Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default CourtCard;
