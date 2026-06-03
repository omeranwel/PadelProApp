import prisma from '../../config/db.js';

const REVIEW_TAGS = ['Fair Player','Great Teammate','Good Sport','Punctual','Skilful','Fun to Play With','Competitive','Encouraging','Reliable','Good Communicator'];

export const submitReview = async (reviewerId, { subjectId, matchId, sportsmanship, punctuality, skillDisplay, communication, teamwork, tags = [], comment }) => {
  if (reviewerId === subjectId) { const err = new Error('Cannot review yourself'); err.status = 400; throw err; }
  const overallRating = ((sportsmanship + punctuality + skillDisplay + communication + teamwork) / 5);
  const validTags = tags.filter(t => REVIEW_TAGS.includes(t)).slice(0, 5);

  const review = await prisma.playerReview.create({
    data: { reviewerId, subjectId, matchId: matchId || null, sportsmanship, punctuality, skillDisplay, communication, teamwork, overallRating, tags: validTags, comment: comment?.trim() || null },
    include: { reviewer: { select: { name: true, avatarUrl: true, skillLevel: true } }, subject: { select: { name: true } } }
  });

  // Update subject's skill rating (weighted: 80% existing, 20% new review)
  const subject = await prisma.user.findUnique({ where: { id: subjectId } });
  const newRating = subject.skillRating * 0.8 + overallRating * 0.2;
  await prisma.user.update({ where: { id: subjectId }, data: { skillRating: Math.round(newRating * 100) / 100 } });

  return review;
};

export const getPlayerReviews = async (playerId, { page = 1, limit = 10 } = {}) => {
  const [total, reviews] = await Promise.all([
    prisma.playerReview.count({ where: { subjectId: playerId } }),
    prisma.playerReview.findMany({
      where: { subjectId: playerId }, skip: (page-1)*limit, take: limit, orderBy: { createdAt: 'desc' },
      include: { reviewer: { select: { name: true, avatarUrl: true, skillLevel: true, city: true } } }
    })
  ]);
  const agg = await prisma.playerReview.aggregate({
    where: { subjectId: playerId },
    _avg: { sportsmanship: true, punctuality: true, skillDisplay: true, communication: true, teamwork: true, overallRating: true }
  });
  const allTags = await prisma.playerReview.findMany({ where: { subjectId: playerId }, select: { tags: true } });
  const tagCount = {};
  allTags.forEach(r => r.tags.forEach(t => { tagCount[t] = (tagCount[t] || 0) + 1; }));
  const topTags = Object.entries(tagCount).sort((a,b) => b[1]-a[1]).slice(0,6).map(([tag,count]) => ({ tag, count }));
  return { reviews, total, page, pages: Math.ceil(total/limit), averages: agg._avg, topTags };
};

export const checkCanReview = async (reviewerId, subjectId, matchId) => {
  const existing = await prisma.playerReview.findFirst({ where: { reviewerId, subjectId, matchId: matchId || null } });
  return { canReview: !existing, alreadyReviewed: !!existing };
};

export const getAvailableTags = () => ({ tags: REVIEW_TAGS });

export const getMyPendingReviews = async (userId) => {
  const recentMatches = await prisma.match.findMany({
    where: { OR: [{ player1Id: userId }, { player2Id: userId }], status: 'completed', date: { gte: new Date(Date.now() - 7*24*60*60*1000) } },
    include: { player1: { select: { id: true, name: true, avatarUrl: true, skillLevel: true } }, player2: { select: { id: true, name: true, avatarUrl: true, skillLevel: true } } },
    orderBy: { date: 'desc' }, take: 10
  });
  const pending = [];
  for (const match of recentMatches) {
    const opponent = match.player1Id === userId ? match.player2 : match.player1;
    if (!opponent) continue;
    const { canReview } = await checkCanReview(userId, opponent.id, match.id);
    if (canReview) pending.push({ match, opponent });
  }
  return pending;
};
