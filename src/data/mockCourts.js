import { format, addDays } from 'date-fns';

const today = format(new Date(), 'yyyy-MM-dd');
const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

export const mockCourts = [
  {
    id: "court-1",
    name: "Padel Arena DHA",
    club: "Padel Arena",
    address: "Phase 6, DHA",
    area: "DHA Phase 6",
    lat: 24.795,
    lng: 67.042,
    surface: "Outdoor",
    amenities: ["Parking", "Café", "Changing Rooms"],
    rating: 4.8,
    reviewCount: 124,
    pricePerHour: 4000,
    slots: {
      [today]: {
        "08:00": "available", "09:00": "available", "10:00": "booked", "11:00": "booked",
        "12:00": "available", "13:00": "available", "17:00": "booked", "18:00": "booked",
        "19:00": "available", "20:00": "available", "21:00": "booked"
      }
    },
    images: ["https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=800&auto=format&fit=crop"],
    description: "Premium outdoor padel courts located in the heart of DHA Phase 6. Features high-quality glass walls and imported turf."
  },
  {
    id: "court-2",
    name: "The Padel Club Clifton",
    club: "The Padel Club",
    address: "Block 9, Clifton",
    area: "Clifton Block 9",
    lat: 24.814,
    lng: 67.025,
    surface: "Indoor",
    amenities: ["Parking", "Pro Shop", "AC"],
    rating: 4.9,
    reviewCount: 312,
    pricePerHour: 6000,
    slots: {
      [today]: {
        "08:00": "booked", "09:00": "booked", "10:00": "available", "18:00": "booked", "19:00": "available"
      }
    },
    images: ["https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=800&auto=format&fit=crop"],
    description: "Fully air-conditioned indoor courts perfect for summer play."
  },
  {
    id: "court-3",
    name: "Karachi Padel Hub",
    club: "Karachi Padel Hub",
    address: "Gulshan-e-Iqbal Block 4",
    area: "Gulshan-e-Iqbal",
    lat: 24.912,
    lng: 67.098,
    surface: "Outdoor",
    amenities: ["Parking", "Floodlights", "Refreshments"],
    rating: 4.5,
    reviewCount: 89,
    pricePerHour: 3000,
    slots: {
      [today]: {
        "18:00": "available", "19:00": "available", "20:00": "available", "21:00": "booked"
      }
    },
    images: ["https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=800&auto=format&fit=crop"],
    description: "Spacious outdoor padel courts with excellent floodlights for night matches."
  },
  {
    id: "court-4",
    name: "Elite Padel PECHS",
    club: "Elite Padel",
    address: "Block 2, PECHS",
    area: "PECHS",
    lat: 24.873,
    lng: 67.062,
    surface: "Indoor",
    amenities: ["Locker Rooms", "Café"],
    rating: 4.7,
    reviewCount: 201,
    pricePerHour: 4500,
    slots: {
      [today]: {
        "16:00": "booked", "17:00": "available", "18:00": "available", "19:00": "booked"
      }
    },
    images: ["https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=800&auto=format&fit=crop"],
    description: "A centralized indoor padel facility covering the PECHS and Tariq Road community."
  },
  {
    id: "court-5",
    name: "Bahria Padel Masters",
    club: "Masters Club",
    address: "Precinct 10, Bahria Town",
    area: "Bahria Town",
    lat: 25.045,
    lng: 67.311,
    surface: "Outdoor",
    amenities: ["Parking", "Restaurant", "Changing Rooms"],
    rating: 4.6,
    reviewCount: 45,
    pricePerHour: 3500,
    slots: {},
    images: ["https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=800&auto=format&fit=crop"],
    description: "Luxury outdoor facility inside Bahria Town."
  },
  {
    id: "court-6",
    name: "Nazimabad Sports Complex",
    club: "NSC Padel",
    address: "North Nazimabad",
    area: "Nazimabad",
    lat: 24.935,
    lng: 67.034,
    surface: "Outdoor",
    amenities: ["Parking", "Floodlights"],
    rating: 4.3,
    reviewCount: 112,
    pricePerHour: 2800,
    slots: {},
    images: ["https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=800&auto=format&fit=crop"],
    description: "Affordable and accessible community padel courts."
  },
  {
    id: "court-7",
    name: "Korangi Creek Padel",
    club: "Creek Club",
    address: "Korangi Creek",
    area: "Korangi",
    lat: 24.789,
    lng: 67.112,
    surface: "Outdoor",
    amenities: ["Wifi", "Café", "Changing Rooms"],
    rating: 4.9,
    reviewCount: 304,
    pricePerHour: 5000,
    slots: {},
    images: ["https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=800&auto=format&fit=crop"],
    description: "Scenic views alongside premium athletic courts."
  },
  {
    id: "court-8",
    name: "Defence Authority Club",
    club: "DAC Padel",
    address: "Phase 2, DHA",
    area: "Defence",
    lat: 24.819,
    lng: 67.067,
    surface: "Outdoor",
    amenities: ["Members Lounge", "Parking"],
    rating: 4.7,
    reviewCount: 505,
    pricePerHour: 4500,
    slots: {},
    images: ["https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=800&auto=format&fit=crop"],
    description: "Premium members and guest padel facility."
  }
];
