import prisma from '../../config/db.js';
import { calculateMatchScore, getCompatibilityBreakdown, updateSkillRating } from '../../utils/matchmaking.js';
import { formatDistanceToNow } from 'date-fns';
import { io } from '../../config/socket.js';

const safePlayerSelect = {
  id: true, name: true, email: true, phone: true,
  role: true, skillLevel: true, skillRating: true,
  bio: true, avatarUrl: true, preferredArea: true, city: true,
  dominantHand: true, preferredPosition: true, playingStyle: true,
  availability: true, maxTravelKm: true, preferredMode: true,
  matchmakingEnabled: true, profileComplete: true, isVerified: true,
  totalWins: true, totalLosses: true, winRate: true,
  recentForm: true, currentStreak: true, skillRatingHistory: true,
  lastActive: true, createdAt: true, updatedAt: true,
};

export const getPlayers = async (requestingUserId, filters = {}) => {
  const { skillLevel, maxDistance } = filters;
  const where = { role: 'PLAYER', id: { not: requestingUserId }, matchmakingEnabled: true };
  if (skillLevel) where.skillLevel = { in: skillLevel.split(',') };

  const [players, requestingUser] = await Promise.all([
    prisma.user.findMany({ where, select: safePlayerSelect }),
    prisma.user.findUnique({ where: { id: requestingUserId }, select: safePlayerSelect }),
  ]);
  if (!requestingUser) return [];

  const result = players.map((p) => {
    const compatibilityScore = calculateMatchScore(requestingUser, p);
    const breakdown = getCompatibilityBreakdown(requestingUser, p);
    let distanceKm = null;
    if (requestingUser.locationLat && p.locationLat) {
      const toRad = (d) => (d * Math.PI) / 180;
      const R = 6371;
      const dLat = toRad(p.locationLat - requestingUser.locationLat);
      const dLng = toRad((p.locationLng || 0) - (requestingUser.locationLng || 0));
      const a = Math.sin(dLat/2)**2 + Math.cos(toRad(requestingUser.locationLat))*Math.cos(toRad(p.locationLat))*Math.sin(dLng/2)**2;
      distanceKm = parseFloat((R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))).toFixed(1));
    }
    return {
      id: p.id, name: p.name, skillLevel: p.skillLevel, skillRating: p.skillRating,
      avatarUrl: p.avatarUrl, bio: p.bio, city: p.city, preferredArea: p.preferredArea,
      dominantHand: p.dominantHand, preferredPosition: p.preferredPosition,
      playingStyle: p.playingStyle, availability: p.availability,
      totalWins: p.totalWins, totalLosses: p.totalLosses, winRate: p.winRate,
      recentForm: p.recentForm, currentStreak: p.currentStreak, isVerified: p.isVerified,
      lastActive: p.lastActive ? formatDistanceToNow(new Date(p.lastActive),{addSuffix:true}) : 'recently',
      distanceKm, compatibilityScore, breakdown,
      matchesPlayed: (p.totalWins||0)+(p.totalLosses||0),
    };
  })
  .filter(p => !maxDistance || p.distanceKm===null || p.distanceKm<=parseFloat(maxDistance))
  .sort((a,b) => b.compatibilityScore - a.compatibilityScore);
  return result;
};

export const getPlayerById = async (id) => {
  const p = await prisma.user.findUnique({ where:{id}, select: safePlayerSelect });
  if (!p) return null;
  return { ...p, matchesPlayed: (p.totalWins||0)+(p.totalLosses||0) };
};

export const updateProfile = async (id, data) => {
  const allowed = ['name','bio','preferredArea','skillLevel','city','dominantHand','preferredPosition','playingStyle','availability','maxTravelKm','preferredMode','profileComplete','locationLat','locationLng'];
  const updateData = {};
  for (const key of allowed) { if (data[key]!==undefined) updateData[key]=data[key]; }
  updateData.lastActive = new Date();
  return await prisma.user.update({ where:{id}, data:updateData, select:safePlayerSelect });
};

export const uploadAvatar = async (id, file) => {
  const avatarUrl = file.path || file.filename;
  return await prisma.user.update({ where:{id}, data:{avatarUrl}, select:safePlayerSelect });
};

export const getLeaderboard = async ({ limit=20, skillLevel, city }={}) => {
  const where = { role:'PLAYER' };
  if (skillLevel) where.skillLevel = skillLevel;
  if (city) where.city = city;
  const players = await prisma.user.findMany({
    where, take: parseInt(limit),
    select: { id:true,name:true,avatarUrl:true,skillLevel:true,skillRating:true,totalWins:true,totalLosses:true,winRate:true,recentForm:true,currentStreak:true,city:true,preferredArea:true,playingStyle:true },
    orderBy: [{ skillRating:'desc' }, { winRate:'desc' }],
  });
  return players.map((p,i) => ({ rank:i+1,...p, matchesPlayed:(p.totalWins||0)+(p.totalLosses||0) }));
};

export const logMatch = async (userId, data) => {
  const { opponentId, score, courtId, date, mode='singles' } = data;
  const sets = score?.sets||[];
  let p1W=0,p2W=0;
  for (const s of sets) { if ((s.player1||0)>(s.player2||0)) p1W++; else p2W++; }
  const loggerWon = p1W > p2W;

  const match = await prisma.match.create({
    data: { mode, player1Id:userId, player2Id:opponentId, courtId:courtId||null,
      date: date?new Date(date):new Date(), score:{sets, winner:loggerWon?'player1':'player2'},
      status:'completed', createdById:userId, team1:[], team2:[] },
  });

  const [p1,p2] = await Promise.all([
    prisma.user.findUnique({where:{id:userId}}),
    prisma.user.findUnique({where:{id:opponentId}}),
  ]);
  if (p1&&p2) {
    const [winner,loser] = loggerWon?[p1,p2]:[p2,p1];
    const { winnerNewRating, loserNewRating } = updateSkillRating(winner, loser, Math.abs(p1W-p2W));
    const doUpdate = async (user, won, newRating) => {
      const hist = Array.isArray(user.skillRatingHistory)?user.skillRatingHistory:[];
      const form = Array.isArray(user.recentForm)?user.recentForm:[];
      const wins = (user.totalWins||0)+(won?1:0);
      const losses = (user.totalLosses||0)+(won?0:1);
      let streak = user.currentStreak||0;
      if (won) streak = streak>=0?streak+1:1; else streak = streak<=0?streak-1:-1;
      await prisma.user.update({ where:{id:user.id}, data: {
        skillRating:newRating,
        skillRatingHistory:[...hist,{date:new Date().toISOString(),rating:newRating}].slice(-24),
        recentForm:[...form,won?'W':'L'].slice(-10),
        totalWins:wins, totalLosses:losses, winRate:parseFloat(((wins/(wins+losses))*100).toFixed(1)),
        currentStreak:streak, lastActive:new Date(),
      }});
    };
    await Promise.all([doUpdate(winner,true,winnerNewRating),doUpdate(loser,false,loserNewRating)]);

    // Broadcast leaderboard update so the Leaderboard page refreshes live
    if (io) {
      io.emit('leaderboard:update', {
        players: [
          { id: winner.id, skillRating: winnerNewRating, ratingChange: parseFloat((winnerNewRating - winner.skillRating).toFixed(2)) },
          { id: loser.id,  skillRating: loserNewRating,  ratingChange: parseFloat((loserNewRating  - loser.skillRating).toFixed(2)) },
        ],
      });
    }

    return { ...match, ratingChange: parseFloat((winnerNewRating - winner.skillRating).toFixed(2)), loggerWon };
  }
  return match;
};

export const getMyStats = async (userId) => {
  const user = await prisma.user.findUnique({ where:{id:userId}, select:safePlayerSelect });
  if (!user) return null;
  const recentMatches = await prisma.match.findMany({
    where:{OR:[{player1Id:userId},{player2Id:userId}],status:'completed'},
    orderBy:{date:'desc'}, take:10,
    include:{ player1:{select:{id:true,name:true,avatarUrl:true}}, player2:{select:{id:true,name:true,avatarUrl:true}}, court:{select:{id:true,name:true}} },
  });
  return {
    ...user, matchesPlayed:(user.totalWins||0)+(user.totalLosses||0),
    recentMatches: recentMatches.map(m=>({
      id:m.id, date:m.date, mode:m.mode,
      opponent: m.player1Id===userId?m.player2:m.player1,
      score:m.score, court:m.court,
      result: (m.score?.winner==='player1'&&m.player1Id===userId)||(m.score?.winner==='player2'&&m.player2Id===userId)?'W':'L',
    })),
  };
};
