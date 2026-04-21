import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Clean data
  await prisma.otpCode.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.reply.deleteMany();
  await prisma.post.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.savedListing.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.matchRequest.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.courtImage.deleteMany();
  await prisma.review.deleteMany();
  await prisma.court.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 12);

  // 2. Create Users
  const user1 = await prisma.user.create({
    data: {
      name: 'Sharjeel Chandna',
      email: 'sharjeel@example.com',
      passwordHash,
      phone: '03001234567',
      role: 'PLAYER',
      skillLevel: 'advanced',
      bio: 'Padel enthusiast from Karachi.',
      preferredArea: 'DHA Phase 6',
      isVerified: true
    }
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Ahmed Khan',
      email: 'ahmed@example.com',
      passwordHash,
      phone: '03007654321',
      role: 'PLAYER',
      skillLevel: 'intermediate',
      bio: 'Looking for morning matches.',
      preferredArea: 'Gulshan',
      isVerified: true
    }
  });

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@padelpro.com',
      passwordHash,
      role: 'APP_ADMIN',
      isVerified: true
    }
  });

  const clubOwner = await prisma.user.create({
    data: {
      name: 'Malik Padel',
      email: 'owner@club.com',
      passwordHash,
      role: 'CLUB_ADMIN',
      isVerified: true
    }
  });

  // 3. Create Courts
  const court1 = await prisma.court.create({
    data: {
      name: 'Signature Court 1',
      clubName: 'Padel Pro Karachi',
      address: 'DHA Phase 8, Karachi',
      area: 'DHA Phase 8',
      lat: 24.789,
      lng: 67.067,
      surface: 'Indoor',
      amenities: ['Showers', 'Cafe', 'Pro Shop', 'Parking'],
      pricePerHour: 4000,
      description: 'The best indoor court in the city.',
      ownerId: clubOwner.id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&q=80' }
        ]
      }
    }
  });

  const court2 = await prisma.court.create({
    data: {
      name: 'Padel Zone A',
      clubName: 'Padel Zone',
      address: 'Gulshan-e-Iqbal, Karachi',
      area: 'Gulshan',
      lat: 24.918,
      lng: 67.097,
      surface: 'Outdoor',
      amenities: ['Floodlights', 'Parking'],
      pricePerHour: 3000,
      description: 'Competitive outdoor padel environment.',
      ownerId: clubOwner.id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&q=80', isPrimary: true }
        ]
      }
    }
  });

  // 4. Create Listings
  await prisma.listing.create({
    data: {
      title: 'Babolat Technical Viper 2024',
      category: 'Rackets',
      condition: 'Like New',
      price: 45000,
      description: 'Used only twice. Professional power racket.',
      location: 'Karachi',
      sellerId: user1.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      images: {
        create: [{ url: 'https://images.unsplash.com/photo-1617083277660-f47266628b05?auto=format&fit=crop&q=80', isPrimary: true }]
      }
    }
  });

  // 5. Create Posts
  await prisma.post.create({
    data: {
      authorId: user1.id,
      type: 'feed',
      content: 'Just had an amazing match at Padel Pro! The vibe was incredible. Who is up for a rematch this weekend?',
      likes: 12
    }
  });

  await prisma.post.create({
    data: {
      authorId: admin.id,
      type: 'blog',
      title: 'Mastering the Bandeja',
      content: 'The Bandeja is the most important defensive shot in Padel. Here is how to master it...',
      category: 'Tips',
      coverUrl: 'https://images.unsplash.com/photo-1592709823125-a191f07a2a5e?auto=format&fit=crop&q=80',
      likes: 45
    }
  });

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
