import prisma from '../../config/db.js';
import { safeUserSelect } from '../../utils/userSelect.js';

export const searchAll = async (query) => {
  const [players, courts, posts] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: 'PLAYER',
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { bio: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: safeUserSelect,
      take: 5
    }),
    prisma.court.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { address: { contains: query, mode: 'insensitive' } },
          { area: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 5
    }),
    prisma.post.findMany({
      where: {
        isActive: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 5
    })
  ]);

  return { players, courts, posts };
};
