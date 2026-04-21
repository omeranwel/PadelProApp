import prisma from '../../config/db.js';
import { io } from '../../config/socket.js';
import { formatDistanceToNow } from 'date-fns';

export const getListings = async (requestingUserId, filters = {}) => {
  const { category, condition, minPrice, maxPrice, sort, tab } = filters;

  const where = {
    isActive: true,
    ...(category && category !== 'All' && { category }),
    ...(condition && { condition: { in: condition.split(',') } }),
    ...(tab === 'trade' && { openToTrade: true }),
    ...(tab === 'sale' && { price: { not: null } }),
    ...(minPrice || maxPrice) && {
      price: {
        ...(minPrice && { gte: parseInt(minPrice) }),
        ...(maxPrice && { lte: parseInt(maxPrice) }),
      }
    }
  };

  const orderBy = {};
  if (sort === 'price-low') orderBy.price = 'asc';
  else if (sort === 'price-high') orderBy.price = 'desc';
  else if (sort === 'views') orderBy.views = 'desc';
  else orderBy.createdAt = 'desc';

  const listings = await prisma.listing.findMany({
    where,
    orderBy,
    include: {
      images: { orderBy: { isPrimary: 'desc' } },
      seller: { select: { name: true } },
      savedBy: requestingUserId ? { where: { userId: requestingUserId } } : false
    }
  });

  return listings.map(l => ({
    id: l.id,
    title: l.title,
    category: l.category,
    condition: l.condition,
    price: l.price,
    openToTrade: l.openToTrade,
    description: l.description,
    sellerId: l.sellerId,
    sellerName: l.seller.name,
    sellerRating: 4.8, // Mock
    location: l.location,
    images: l.images.map(img => img.url),
    createdAt: formatDistanceToNow(new Date(l.createdAt), { addSuffix: true }),
    views: l.views,
    saved: requestingUserId ? l.savedBy.length > 0 : false,
    expiresAt: l.expiresAt
  }));
};

export const getListingById = async (id, requestingUserId) => {
  const l = await prisma.listing.findUnique({
    where: { id },
    include: {
      images: { orderBy: { isPrimary: 'desc' } },
      seller: { select: { name: true } },
      savedBy: requestingUserId ? { where: { userId: requestingUserId } } : false
    }
  });

  if (!l) return null;

  return {
    id: l.id,
    title: l.title,
    category: l.category,
    condition: l.condition,
    price: l.price,
    openToTrade: l.openToTrade,
    description: l.description,
    sellerId: l.sellerId,
    sellerName: l.seller.name,
    sellerRating: 4.8,
    location: l.location,
    images: l.images.map(img => img.url),
    createdAt: formatDistanceToNow(new Date(l.createdAt), { addSuffix: true }),
    views: l.views,
    saved: requestingUserId ? l.savedBy.length > 0 : false,
    expiresAt: l.expiresAt
  };
};

export const createListing = async (sellerId, data, files) => {
  const { title, category, condition, price, openToTrade, description, location } = data;

  const listing = await prisma.listing.create({
    data: {
      title,
      category,
      condition,
      price: price ? parseInt(price) : null,
      openToTrade: openToTrade === 'true' || openToTrade === true,
      description,
      location,
      sellerId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
  });

  if (files && files.length > 0) {
    const imageOps = files.map((file, i) => prisma.listingImage.create({
      data: {
        listingId: listing.id,
        url: file.path || `/mock-images/product-${i}.jpg`,
        isPrimary: i === 0
      }
    }));
    await Promise.all(imageOps);
  }

  return listing;
};

export const toggleSave = async (userId, listingId) => {
  const existing = await prisma.savedListing.findUnique({
    where: { userId_listingId: { userId, listingId } }
  });

  if (existing) {
    await prisma.savedListing.delete({
      where: { userId_listingId: { userId, listingId } }
    });
    return { saved: false };
  } else {
    await prisma.savedListing.create({
      data: { userId, listingId }
    });
    return { saved: true };
  }
};

export const sendOffer = async (buyerId, listingId, price, message) => {
  const offer = await prisma.offer.create({
    data: {
      buyerId,
      listingId,
      price: parseInt(price),
      message
    },
    include: {
      listing: { select: { title: true, sellerId: true } }
    }
  });

  const notification = await prisma.notification.create({
    data: {
      userId: offer.listing.sellerId,
      type: 'marketplace',
      message: `New offer of Rs ${price} for your ${offer.listing.title}`,
      link: `/market/${listingId}`
    }
  });

  if (io) {
    io.to(`user:${offer.listing.sellerId}`).emit('notification:new', {
      id: notification.id,
      type: 'marketplace',
      message: notification.message,
      link: notification.link
    });
  }

  return offer;
};

export const incrementView = async (id) => {
  return await prisma.listing.update({
    where: { id },
    data: { views: { increment: 1 } }
  });
};

export const getSavedListings = async (userId) => {
  const saved = await prisma.savedListing.findMany({
    where: { userId },
    include: {
      listing: {
        include: {
          images: { orderBy: { isPrimary: 'desc' } },
          seller: { select: { name: true } }
        }
      }
    }
  });

  return saved.map(s => {
    const l = s.listing;
    return {
      id: l.id,
      title: l.title,
      category: l.category,
      price: l.price,
      sellerName: l.seller.name,
      images: l.images.map(img => img.url),
      saved: true
    };
  });
};
