/**
 * PadelPro Matchmaking Algorithm
 * Server-side only — never expose to client
 */

const toRad = (deg) => (deg * Math.PI) / 180;

function haversineDistance({ lat: lat1, lng: lng1 }, { lat: lat2, lng: lng2 }) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function daysSince(date) {
  if (!date) return 999;
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
}

function calculateFormCompatibility(formA, formB) {
  const recentA = (formA || []).slice(-5).filter((r) => r === 'W').length;
  const recentB = (formB || []).slice(-5).filter((r) => r === 'W').length;
  const diff = Math.abs(recentA - recentB);
  return Math.max(0, 1 - diff / 5);
}

const STYLE_MATRIX = {
  aggressive:    { defensive: 1.0, 'all-round': 0.7, 'net-dominant': 0.6, aggressive: 0.5 },
  defensive:     { aggressive: 1.0, 'all-round': 0.8, 'net-dominant': 0.7, defensive: 0.5 },
  'all-round':   { 'all-round': 0.9, aggressive: 0.7, defensive: 0.8, 'net-dominant': 0.8 },
  'net-dominant':{ defensive: 0.8, 'all-round': 0.8, aggressive: 0.6, 'net-dominant': 0.5 },
};

export function calculateMatchScore(playerA, playerB) {
  let score = 0;
  const weights = {
    skillRating: 35,
    winRate:     15,
    playingStyle:12,
    availability:10,
    location:    10,
    recentForm:   8,
    position:     5,
    dominantHand: 3,
    lastActive:   2,
  };

  // 1. Skill Rating Compatibility (35 pts)
  const ratingDiff = Math.abs((playerA.skillRating || 3) - (playerB.skillRating || 3));
  if (ratingDiff <= 0.5)      score += weights.skillRating * 1.0;
  else if (ratingDiff <= 1.0) score += weights.skillRating * 0.7;
  else if (ratingDiff <= 1.5) score += weights.skillRating * 0.4;
  else if (ratingDiff <= 2.0) score += weights.skillRating * 0.2;

  // 2. Win Rate Balance (15 pts)
  const winRateDiff = Math.abs((playerA.winRate || 50) - (playerB.winRate || 50));
  score += weights.winRate * Math.max(0, 1 - winRateDiff / 50);

  // 3. Playing Style (12 pts)
  const styleA = playerA.playingStyle || 'all-round';
  const styleB = playerB.playingStyle || 'all-round';
  const styleScore = STYLE_MATRIX[styleA]?.[styleB] ?? 0.5;
  score += weights.playingStyle * styleScore;

  // 4. Availability Overlap (10 pts)
  const availA = playerA.availability || [];
  const availB = playerB.availability || [];
  const sharedSlots = availA.filter((slot) => availB.includes(slot)).length;
  const maxSlots = Math.max(availA.length, availB.length, 1);
  score += weights.availability * (sharedSlots / maxSlots);

  // 5. Proximity (10 pts)
  if (playerA.locationLat && playerB.locationLat) {
    const distKm = haversineDistance(
      { lat: playerA.locationLat, lng: playerA.locationLng },
      { lat: playerB.locationLat, lng: playerB.locationLng }
    );
    const maxDist = Math.min(playerA.maxTravelKm || 20, playerB.maxTravelKm || 20);
    if (distKm <= maxDist) {
      score += weights.location * Math.max(0, 1 - distKm / maxDist);
    }
  } else {
    // City fallback
    score += playerA.city === playerB.city ? weights.location * 0.7 : 0;
  }

  // 6. Recent Form (8 pts)
  const formScore = calculateFormCompatibility(playerA.recentForm, playerB.recentForm);
  score += weights.recentForm * formScore;

  // 7. Court Position (5 pts)
  if (playerA.preferredPosition === 'left' && playerB.preferredPosition === 'right') {
    score += weights.position;
  } else if (playerA.preferredPosition === playerB.preferredPosition) {
    score += weights.position * 0.4;
  } else {
    score += weights.position * 0.7;
  }

  // 8. Dominant Hand Variety (3 pts)
  if ((playerA.dominantHand || 'right') !== (playerB.dominantHand || 'right')) {
    score += weights.dominantHand;
  }

  // 9. Recent Activity Bonus (2 pts)
  const daysA = daysSince(playerA.lastActive);
  const daysB = daysSince(playerB.lastActive);
  if (daysA <= 7 && daysB <= 7) score += weights.lastActive;
  else if (daysA <= 30 && daysB <= 30) score += weights.lastActive * 0.5;

  return Math.round(Math.min(score, 100));
}

export function getCompatibilityBreakdown(playerA, playerB) {
  const ratingDiff = Math.abs((playerA.skillRating || 3) - (playerB.skillRating || 3));
  let skillPct = 0;
  if (ratingDiff <= 0.5) skillPct = 100;
  else if (ratingDiff <= 1.0) skillPct = 70;
  else if (ratingDiff <= 1.5) skillPct = 40;
  else if (ratingDiff <= 2.0) skillPct = 20;

  const winRateDiff = Math.abs((playerA.winRate || 50) - (playerB.winRate || 50));
  const winRatePct = Math.round(Math.max(0, 1 - winRateDiff / 50) * 100);

  const styleA = playerA.playingStyle || 'all-round';
  const styleB = playerB.playingStyle || 'all-round';
  const stylePct = Math.round((STYLE_MATRIX[styleA]?.[styleB] ?? 0.5) * 100);

  const availA = playerA.availability || [];
  const availB = playerB.availability || [];
  const sharedSlots = availA.filter((slot) => availB.includes(slot)).length;
  const maxSlots = Math.max(availA.length, availB.length, 1);
  const availPct = Math.round((sharedSlots / maxSlots) * 100);

  let locationPct = playerA.city === playerB.city ? 70 : 0;
  if (playerA.locationLat && playerB.locationLat) {
    const distKm = haversineDistance(
      { lat: playerA.locationLat, lng: playerA.locationLng },
      { lat: playerB.locationLat, lng: playerB.locationLng }
    );
    const maxDist = Math.min(playerA.maxTravelKm || 20, playerB.maxTravelKm || 20);
    locationPct = distKm <= maxDist ? Math.round(Math.max(0, 1 - distKm / maxDist) * 100) : 0;
  }

  return { skillRating: skillPct, winRate: winRatePct, playingStyle: stylePct, availability: availPct, location: locationPct };
}

/**
 * ELO-inspired skill rating update
 */
export function updateSkillRating(winner, loser, scoreDiff = 0) {
  const K_BASE = 0.3;
  const K = (winner.totalWins + winner.totalLosses) < 10 ? K_BASE * 2 : K_BASE;

  const expectedWinProb = 1 / (1 + Math.pow(10, (loser.skillRating - winner.skillRating) / 2));
  const actualScore = 0.5 + scoreDiff * 0.25; // 0.5 to 1.0

  const ratingChange = K * (actualScore - expectedWinProb);

  return {
    winnerNewRating: parseFloat(Math.min(7.0, Math.max(1.0, winner.skillRating + ratingChange)).toFixed(2)),
    loserNewRating:  parseFloat(Math.min(7.0, Math.max(1.0, loser.skillRating - ratingChange)).toFixed(2)),
    ratingChange:    parseFloat(ratingChange.toFixed(2)),
  };
}
