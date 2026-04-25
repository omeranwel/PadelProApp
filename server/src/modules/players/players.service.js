import prisma from '../../config/db.js';
import { calculateCompatibility } from '../../utils/compatibility.js';
import { formatDistanceToNow } from 'date-fns';
import { safeUserSelect } from '../../utils/userSelect.js';

const skillRankMap = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
  professional: 3
};

export const getPlayers = async (requestingUserId, filters = {}) => {
  const { skillLevel, maxDistance } = filters;

  const where = {
    role: 'PLAYER',
    id: { not: requestingUserId },
    isActive: true
  };

  if (skillLevel) {
    const levels = skillLevel.split(',');
    where.skillLevel = { in: levels };
  }

  const players = await prisma.user.findMany({
    where,
    select: {
      ...safeUserSelect,
      bookings: { where: { status: 'COMPLETED' } }
    }
  });

  const requestingUser = await prisma.user.findUnique({ where: { id: requestingUserId }, select: safeUserSelect });
  const reqSkillRank = skillRankMap[requestingUser.skillLevel] || 0;

  const result = players.map(p => {
    // Mocking some data that isn't fully in schema yet but expected by frontend
    const skillRank = skillRankMap[p.skillLevel] || 0;
    
    // Distance Mock (Seeded by IDs to be consistent)
    const distance = parseFloat((Math.abs(p.id.charCodeAt(0) - requestingUserId.charCodeAt(0)) % 15 + 1).toFixed(1));
    
    // Last Active
    const lastActive = formatDistanceToNow(new Date(p.updatedAt), { addSuffix: true });

    // Availability Mock (frontend expects array of {day, slots:[]})
    const availability = [
      { day: 'Monday', slots: ['evening'] },
      { day: 'Wednesday', slots: ['morning', 'evening'] }
    ];

    const compatibilityScore = calculateCompatibility(
      { skillRank: reqSkillRank, availability: [] /* mock or from profile */ },
      { skillRank, distance, availability }
    );

    return {
      id: p.id,
      name: p.name,
      skillLevel: p.skillLevel,
      skillRank,
      avatarUrl: p.avatarUrl,
      availability,
      distance,
      matchesPlayed: p.bookings.length + 5, // mock offset
      winRate: 65, // mock
      preferredPosition: 'Both',
      bio: p.bio,
      lastActive,
      compatibilityScore
    };
  });

  // Filter by distance if requested
  let filtered = result;
  if (maxDistance) {
    filtered = result.filter(p => p.distance <= parseFloat(maxDistance));
  }

  return filtered.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
};

export const getPlayerById = async (id) => {
  const p = await prisma.user.findUnique({
    where: { id },
    select: {
      ...safeUserSelect,
      bookings: true
    }
  });
  if (!p) return null;

  return {
    ...p,
    skillRank: skillRankMap[p.skillLevel] || 0,
    matchesPlayed: p.bookings.length,
    winRate: 65
  };
};

export const updateProfile = async (id, data) => {
  const { name, bio, preferredArea, skillLevel } = data;
  return await prisma.user.update({
    where: { id },
    data: { name, bio, preferredArea, skillLevel },
    select: safeUserSelect
  });
};

export const uploadAvatar = async (id, file) => {
  const avatarUrl = file.path || '/mock-avatars/player-1.jpg';
  return await prisma.user.update({
    where: { id },
    data: { avatarUrl },
    select: safeUserSelect
  });
};
