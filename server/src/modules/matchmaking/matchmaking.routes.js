import { Router } from 'express';
import * as ctrl from './matchmaking.controller.js';
import { verifyToken } from '../../middleware/auth.js';
import { getDbUser } from '../../utils/getDbUser.js';
import prisma from '../../config/db.js';

const router = Router();

// ─── Legacy matchmaking challenge routes ───────────────────────────
router.get('/players', verifyToken, ctrl.getPlayers);
router.post('/', verifyToken, ctrl.sendRequest);
router.get('/', verifyToken, ctrl.getRequests);
router.patch('/:id', verifyToken, ctrl.updateRequest);
router.delete('/:id', verifyToken, ctrl.cancelRequest);

// ─────────────────────────────────────────────────────────────────
// GET /api/matchmaking/suggest
// AI-powered player suggestions for filling a private lobby
// ─────────────────────────────────────────────────────────────────
router.get('/suggest', verifyToken, async (req, res) => {
  try {
    const currentUser = await getDbUser(req.user.uid);
    const { count = 9, excludeIds = '', skillMin, skillMax, city, playingStyle, position } = req.query;

    const excluded = excludeIds.split(',').filter(Boolean);
    const minRating = isNaN(parseFloat(skillMin)) ? Math.max(1.0, (currentUser.skillRating || 3) - 1.5) : parseFloat(skillMin);
    const maxRating = isNaN(parseFloat(skillMax)) ? Math.min(7.0, (currentUser.skillRating || 3) + 1.5) : parseFloat(skillMax);

    let candidates = await prisma.user.findMany({
      where: {
        id: { notIn: [currentUser.id, ...excluded] },
        role: 'PLAYER',
        matchmakingEnabled: true,
        profileComplete: true,
        skillRating: { gte: minRating, lte: maxRating },
        ...(city ? { city: { contains: city, mode: 'insensitive' } }
          : currentUser.city ? { city: currentUser.city } : {}),
      },
      select: {
        id: true, name: true, avatarUrl: true, city: true,
        skillLevel: true, skillRating: true, preferredPosition: true,
        playingStyle: true, dominantHand: true, availability: true,
        lastActive: true, recentForm: true, winRate: true,
      },
      orderBy: { lastActive: 'desc' },
      take: 50,
    });

    // Fallback: relax city filter if no candidates
    if (candidates.length < 3) {
      const fallback = await prisma.user.findMany({
        where: {
          id: { notIn: [currentUser.id, ...excluded, ...candidates.map(c => c.id)] },
          role: 'PLAYER',
          matchmakingEnabled: true,
          skillRating: { gte: Math.max(1.0, minRating - 0.5), lte: Math.min(7.0, maxRating + 0.5) },
        },
        select: {
          id: true, name: true, avatarUrl: true, city: true,
          skillLevel: true, skillRating: true, preferredPosition: true,
          playingStyle: true, dominantHand: true, availability: true,
          lastActive: true, recentForm: true, winRate: true,
        },
        take: 30,
      });
      candidates = [...candidates, ...fallback];
    }

    const scored = candidates.map(candidate => {
      const score = calculateMatchScore(currentUser, candidate, { playingStyle, position });
      return { player: candidate, matchScore: score };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      suggestions: scored.slice(0, parseInt(count)),
      criteria: { skillMin: minRating, skillMax: maxRating, city: city || currentUser.city },
      totalCandidates: candidates.length,
    });
  } catch (err) {
    console.error('[AI Suggest]', err);
    const msg = err.message || JSON.stringify(err) || 'AI suggest failed';
    res.status(500).json({ message: msg });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/matchmaking/search?q=&excludeIds=
// Live player search with AI match scores
// ─────────────────────────────────────────────────────────────────
router.get('/search', verifyToken, async (req, res) => {
  try {
    const currentUser = await getDbUser(req.user.uid);
    const { q = '', excludeIds = '', limit = 8 } = req.query;

    if (q.trim().length === 0) return res.json({ players: [] });

    const excluded = excludeIds.split(',').filter(Boolean);

    const players = await prisma.user.findMany({
      where: {
        id: { notIn: [currentUser.id, ...excluded] },
        role: 'PLAYER',
        name: { contains: q.trim(), mode: 'insensitive' },
      },
      select: {
        id: true, name: true, avatarUrl: true, city: true,
        skillLevel: true, skillRating: true, playingStyle: true,
        preferredPosition: true, dominantHand: true, availability: true,
        lastActive: true, recentForm: true, winRate: true,
      },
      orderBy: { name: 'asc' },
      take: parseInt(limit),
    });

    const scored = players.map(p => ({
      ...p,
      matchScore: calculateMatchScore(currentUser, p),
    }));

    res.json({ players: scored });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// 9-FACTOR AI SCORING ALGORITHM
// ─────────────────────────────────────────────────────────────────
export function calculateMatchScore(userA, userB, criteria = {}) {
  let score = 0;

  // 1. Skill rating compatibility (35 pts)
  const ratingDiff = Math.abs((userA.skillRating || 3) - (userB.skillRating || 3));
  if      (ratingDiff <= 0.3) score += 35;
  else if (ratingDiff <= 0.7) score += 28;
  else if (ratingDiff <= 1.0) score += 20;
  else if (ratingDiff <= 1.5) score += 12;
  else if (ratingDiff <= 2.0) score += 5;

  // 2. Win rate similarity (15 pts)
  const wrDiff = Math.abs((userA.winRate || 50) - (userB.winRate || 50));
  score += Math.max(0, 15 - wrDiff / 5);

  // 3. Playing style compatibility (12 pts)
  const styleMatrix = {
    aggressive:   { defensive: 1.0, allRound: 0.7, netDominant: 0.8, aggressive: 0.4 },
    defensive:    { aggressive: 1.0, allRound: 0.8, netDominant: 0.6, defensive: 0.4 },
    allRound:     { allRound: 0.9,  aggressive: 0.7, defensive: 0.8, netDominant: 0.8 },
    netDominant:  { defensive: 0.8, allRound: 0.8,  aggressive: 0.7, netDominant: 0.5 },
  };
  const reqStyle = criteria.playingStyle;
  const myStyle  = (reqStyle || userA.playingStyle || 'allRound').replace('-', '');
  const theirStyle = (userB.playingStyle || 'allRound').replace('-', '');
  score += 12 * (styleMatrix[myStyle]?.[theirStyle] ?? 0.5);

  // 4. Availability overlap (10 pts)
  const avA = userA.availability || [];
  const avB = userB.availability || [];
  if (avA.length > 0 && avB.length > 0) {
    const overlap = avA.filter(s => avB.includes(s)).length;
    score += 10 * (overlap / Math.max(avA.length, avB.length));
  } else { score += 5; }

  // 5. Same city (10 pts)
  if (userA.city && userB.city && userA.city.toLowerCase() === userB.city.toLowerCase()) score += 10;

  // 6. Recent form balance (8 pts)
  const formA = Array.isArray(userA.recentForm) ? userA.recentForm.slice(-5) : [];
  const formB = Array.isArray(userB.recentForm) ? userB.recentForm.slice(-5) : [];
  if (formA.length > 0 && formB.length > 0) {
    const wA = formA.filter(r => r === 'W').length;
    const wB = formB.filter(r => r === 'W').length;
    score += 8 * Math.max(0, 1 - Math.abs(wA - wB) / 5);
  } else { score += 4; }

  // 7. Position complementarity (5 pts)
  const posA = criteria.position || userA.preferredPosition;
  const posB = userB.preferredPosition;
  if (posA && posB) {
    if ((posA === 'left' && posB === 'right') || (posA === 'right' && posB === 'left')) score += 5;
    else if (posA === 'both' || posB === 'both') score += 3;
    else score += 1;
  } else { score += 3; }

  // 8. Dominant hand variety (3 pts)
  if (userA.dominantHand && userB.dominantHand) {
    score += userA.dominantHand !== userB.dominantHand ? 3 : 1;
  }

  // 9. Recent activity (2 pts)
  const daysSince = userB.lastActive
    ? (Date.now() - new Date(userB.lastActive).getTime()) / 86400000
    : 999;
  if      (daysSince <= 3)  score += 2;
  else if (daysSince <= 7)  score += 1.5;
  else if (daysSince <= 30) score += 1;

  return Math.min(100, Math.round(score));
}

export default router;
