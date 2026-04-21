import prisma from '../../config/db.js';
import { format, addDays } from 'date-fns';

export const getCourts = async (filters = {}) => {
  const { area, surface, minPrice, maxPrice, sort } = filters;

  const where = {
    isActive: true,
    ...(area && { area: { contains: area, mode: 'insensitive' } }),
    ...(surface && surface !== 'All' && { surface }),
    ...(minPrice || maxPrice) && {
      pricePerHour: {
        ...(minPrice && { gte: parseInt(minPrice) }),
        ...(maxPrice && { lte: parseInt(maxPrice) }),
      }
    }
  };

  const orderBy = {};
  if (sort === 'price-low') orderBy.pricePerHour = 'asc';
  else if (sort === 'price-high') orderBy.pricePerHour = 'desc';
  // else fallback to rating or created

  const courts = await prisma.court.findMany({
    where,
    orderBy: sort === 'rating' ? undefined : (Object.keys(orderBy).length ? orderBy : { createdAt: 'desc' }),
    include: {
      images: { orderBy: { isPrimary: 'desc' } },
      reviews: true
    }
  });

  // Today + 6 days logic
  const dates = Array.from({ length: 7 }).map((_, i) => format(addDays(new Date(), i), 'yyyy-MM-dd'));

  const courtsWithDetails = await Promise.all(courts.map(async (court) => {
    // Calculate rating
    const reviewCount = court.reviews.length;
    const rating = reviewCount > 0 
      ? parseFloat((court.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1))
      : 4.5; // Mock default if no reviews

    // Fetch availability for all 7 dates
    const availability = await prisma.availability.findMany({
      where: {
        courtId: court.id,
        date: { in: dates }
      }
    });

    // Structure slots: { "yyyy-MM-dd": { "08:00": "available", ... } }
    const slots = {};
    dates.forEach(date => {
      slots[date] = {};
      // 08:00 to 21:00
      for (let h = 8; h <= 21; h++) {
        const time = `${h.toString().padStart(2, '0')}:00`;
        const found = availability.find(a => a.date === date && a.startTime === time);
        slots[date][time] = found?.isBooked ? 'booked' : 'available';
      }
    });

    return {
      id: court.id,
      name: court.name,
      club: court.clubName,
      address: court.address,
      area: court.area,
      lat: court.lat,
      lng: court.lng,
      surface: court.surface,
      amenities: court.amenities,
      rating,
      reviewCount,
      pricePerHour: court.pricePerHour,
      description: court.description,
      images: court.images.map(img => img.url),
      slots
    };
  }));

  if (sort === 'rating') {
    return courtsWithDetails.sort((a, b) => b.rating - a.rating);
  }

  return courtsWithDetails;
};

export const getCourtById = async (id) => {
  const court = await prisma.court.findUnique({
    where: { id },
    include: {
      images: { orderBy: { isPrimary: 'desc' } },
      reviews: {
        include: { author: { select: { name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!court) return null;

  const reviewCount = court.reviews.length;
  const rating = reviewCount > 0 
    ? parseFloat((court.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1))
    : 4.5;

  return {
    ...court,
    club: court.clubName,
    rating,
    reviewCount,
    images: court.images.map(img => img.url)
  };
};

export const getAvailability = async (courtId, date) => {
  const availability = await prisma.availability.findMany({
    where: { courtId, date }
  });

  const slots = {};
  for (let h = 8; h <= 21; h++) {
    const time = `${h.toString().padStart(2, '0')}:00`;
    const found = availability.find(a => a.startTime === time);
    slots[time] = found?.isBooked ? 'booked' : 'available';
  }

  return slots;
};

export const createCourt = async (ownerId, data, files) => {
  const { name, clubName, address, area, lat, lng, surface, amenities, pricePerHour, description } = data;

  const court = await prisma.court.create({
    data: {
      name,
      clubName,
      address,
      area,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      surface,
      amenities: typeof amenities === 'string' ? JSON.parse(amenities) : amenities,
      pricePerHour: parseInt(pricePerHour),
      description,
      ownerId
    }
  });

  if (files && files.length > 0) {
    const imageOps = files.map((file, i) => prisma.courtImage.create({
      data: {
        courtId: court.id,
        url: file.path || `/mock-images/court-${i}.jpg`, // fallback for dev
        isPrimary: i === 0
      }
    }));
    await Promise.all(imageOps);
  }

  return court;
};

export const updateCourt = async (id, data) => {
  return await prisma.court.update({
    where: { id },
    data
  });
};

export const deleteCourt = async (id) => {
  return await prisma.court.update({
    where: { id },
    data: { isActive: false }
  });
};

export const addReview = async (authorId, courtId, { rating, comment }) => {
  return await prisma.review.create({
    data: {
      authorId,
      courtId,
      rating: parseInt(rating),
      comment
    }
  });
};
