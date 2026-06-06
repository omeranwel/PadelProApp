/**
 * teamBalancer.js
 * AI Team Balancing for 4-Player Padel Matches
 * 
 * Tries all 3 possible pairings of 4 players into 2 teams of 2,
 * scores each by rating balance, style compatibility, and position,
 * then returns the most balanced assignment.
 */

export function balanceTeams(players) {
  if (players.length !== 4) throw new Error('balanceTeams requires exactly 4 players');

  const pairings = [
    { team1: [players[0], players[1]], team2: [players[2], players[3]] },
    { team1: [players[0], players[2]], team2: [players[1], players[3]] },
    { team1: [players[0], players[3]], team2: [players[1], players[2]] },
  ];

  const scored = pairings.map(pairing => ({
    ...pairing,
    score: calculateBalanceScore(pairing.team1, pairing.team2),
  }));

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];

  return {
    team1: best.team1,
    team2: best.team2,
    balanceScore: best.score,
    breakdown: {
      ratingDiff: Math.abs(avgRating(best.team1) - avgRating(best.team2)).toFixed(2),
      team1AvgRating: avgRating(best.team1).toFixed(2),
      team2AvgRating: avgRating(best.team2).toFixed(2),
      team1Styles: best.team1.map(p => p.playingStyle),
      team2Styles: best.team2.map(p => p.playingStyle),
    },
  };
}

function calculateBalanceScore(team1, team2) {
  let score = 100;

  // 1. RATING BALANCE (40 pts)
  const ratingDiff = Math.abs(avgRating(team1) - avgRating(team2));
  score -= ratingDiff * 15;

  // 2. WITHIN-TEAM STYLE COMPATIBILITY (30 pts)
  score += teamStyleScore(team1) * 15;
  score += teamStyleScore(team2) * 15;

  // 3. POSITION COMPLEMENTARITY (20 pts)
  score += positionScore(team1) * 10;
  score += positionScore(team2) * 10;

  // 4. WIN RATE BALANCE (10 pts)
  const winRateDiff = Math.abs(avgWinRate(team1) - avgWinRate(team2));
  score -= winRateDiff * 0.1;

  return Math.max(0, score);
}

function avgRating(team) {
  return team.reduce((sum, p) => sum + (p.skillRating || 3.0), 0) / team.length;
}

function avgWinRate(team) {
  return team.reduce((sum, p) => sum + (p.winRate || 50), 0) / team.length;
}

function teamStyleScore(team) {
  const styleMatrix = {
    aggressive:   { defensive: 1.0, allRound: 0.7, netDominant: 0.5, aggressive: 0.3 },
    defensive:    { aggressive: 1.0, allRound: 0.8, netDominant: 0.7, defensive: 0.3 },
    allRound:     { allRound: 0.8,  aggressive: 0.7, defensive: 0.8, netDominant: 0.7 },
    netDominant:  { defensive: 0.8, allRound: 0.7, aggressive: 0.5, netDominant: 0.4 },
    'all-round':  { 'all-round': 0.8, aggressive: 0.7, defensive: 0.8, netDominant: 0.7 },
  };
  const [p1, p2] = team;
  const s1 = (p1.playingStyle || 'allRound').replace('-', '');
  const s2 = (p2.playingStyle || 'allRound').replace('-', '');
  return styleMatrix[s1]?.[s2] ?? styleMatrix[s1]?.['allRound'] ?? 0.5;
}

function positionScore(team) {
  const [p1, p2] = team;
  const pos1 = p1.preferredPosition;
  const pos2 = p2.preferredPosition;
  if (pos1 === 'left'  && pos2 === 'right') return 1.0;
  if (pos1 === 'right' && pos2 === 'left')  return 1.0;
  if (pos1 === 'both'  || pos2 === 'both')  return 0.7;
  return 0.3;
}
