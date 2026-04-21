/**
 * calculateCompatibility - Exact algorithm the frontend displays.
 * @param {Object} user1 
 * @param {Object} user2 
 * @returns {number} 0-100 score
 */
export const calculateCompatibility = (user1, user2) => {
  // Skill similarity (50% weight)
  // skillRank: beginner=0, intermediate=1, advanced=2, professional=3
  const skillDiff = Math.abs((user1.skillRank || 0) - (user2.skillRank || 0));
  const skillScore = Math.max(0, (1 - skillDiff / 3)) * 50;

  // Availability overlap (30% weight)
  const u1Days = new Set((user1.availability || []).map(a => a.day));
  const u2Days = new Set((user2.availability || []).map(a => a.day));
  const overlapDays = [...u1Days].filter(d => u2Days.has(d)).length;
  const availScore = (overlapDays / 7) * 30; // Normalized to 7 days

  // Distance (20% weight) — max 20km
  const distance = user2.distance || 5; // fallback
  const distScore = Math.max(0, (1 - (distance / 20))) * 20;

  return Math.round(skillScore + availScore + distScore);
};

export const getOverlapDays = (user1Availability, user2Availability) => {
  const u1Days = new Set(user1Availability.map(a => a.day));
  return user2Availability.filter(a => u1Days.has(a.day));
};
