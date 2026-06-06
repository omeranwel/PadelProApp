import express from 'express';
import { verifyToken } from '../../middleware/auth.js';
import { getDbUser } from '../../utils/getDbUser.js';
import { balanceTeams } from '../../services/teamBalancer.js';
import prisma from '../../config/db.js';

const router = express.Router();

// ─────────────────────────────────────────────
// POST /api/lobbies — Create a new match lobby
// ─────────────────────────────────────────────
router.post('/', verifyToken, async (req, res) => {
  try {
    const organizer = await getDbUser(req.user.uid);
    const {
      mode = 'PRIVATE',
      preferredDate,
      preferredTimeSlot,
      city,
      skillLevelMin = 1.0,
      skillLevelMax = 7.0,
      courtPreference,
      message,
      inviteUserIds = [],
    } = req.body;

    if (!city) return res.status(400).json({ message: 'City is required' });
    if (mode === 'PRIVATE' && inviteUserIds.length !== 3) {
      return res.status(400).json({ message: 'Private match requires exactly 3 invitees' });
    }
    if (mode === 'PRIVATE' && inviteUserIds.includes(organizer.id)) {
      return res.status(400).json({ message: 'Cannot invite yourself' });
    }

    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const skillMin = isNaN(parseFloat(skillLevelMin)) ? 1.0 : Math.min(7.0, Math.max(1.0, parseFloat(skillLevelMin)));
    const skillMax = isNaN(parseFloat(skillLevelMax)) ? 7.0 : Math.min(7.0, Math.max(skillMin, parseFloat(skillLevelMax)));

    const lobby = await prisma.matchLobby.create({
      data: {
        organizerId: organizer.id,
        mode,
        city,
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        preferredTimeSlot,
        skillLevelMin: skillMin,
        skillLevelMax: skillMax,
        courtPreference,
        message,
        expiresAt,
        confirmedPlayers: { create: { userId: organizer.id, slot: 1 } },
        ...(mode === 'PRIVATE' && {
          invites: {
            create: inviteUserIds.map(receiverId => ({
              senderId: organizer.id,
              receiverId,
              expiresAt,
            })),
          },
        }),
      },
      include: {
        confirmedPlayers: { include: { user: { select: { id: true, name: true, avatarUrl: true, skillRating: true } } } },
        invites: { include: { receiver: { select: { id: true, name: true, avatarUrl: true } } } },
        organizer: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    if (mode === 'PRIVATE' && inviteUserIds.length > 0) {
      await Promise.allSettled(inviteUserIds.map(uid =>
        prisma.notification.create({
          data: {
            userId: uid,
            type: 'match_invite',
            title: '🎾 Match Invite!',
            body: `${organizer.name} invited you to a padel match${preferredDate ? ` on ${new Date(preferredDate).toLocaleDateString()}` : ''}`,
            data: { lobbyId: lobby.id },
          },
        })
      ));
    }

    res.json({ success: true, lobby });
  } catch (err) {
    console.error('[Create Lobby]', err);
    const msg = err.message || err.meta?.cause || JSON.stringify(err) || 'Internal server error creating lobby';
    res.status(500).json({ message: msg });
  }
});

// ───────────────────────────────────────
// GET /api/lobbies/open — Browse open lobbies
// ───────────────────────────────────────
router.get('/open', verifyToken, async (req, res) => {
  try {
    const currentUser = await getDbUser(req.user.uid);
    const { city = '' } = req.query;

    const lobbies = await prisma.matchLobby.findMany({
      where: {
        mode: 'OPEN',
        status: 'WAITING',
        expiresAt: { gt: new Date() },
        organizerId: { not: currentUser.id },
        ...(city && { city }),
        skillLevelMin: { lte: currentUser.skillRating },
        skillLevelMax: { gte: currentUser.skillRating },
        confirmedPlayers: { none: { userId: currentUser.id } },
        joinRequests: { none: { userId: currentUser.id } },
      },
      include: {
        organizer: { select: { id: true, name: true, avatarUrl: true, skillLevel: true, skillRating: true } },
        confirmedPlayers: {
          include: { user: { select: { id: true, name: true, avatarUrl: true, skillLevel: true, skillRating: true } } },
        },
      },
      orderBy: { preferredDate: 'asc' },
    });

    const enriched = lobbies.map(l => ({
      ...l,
      openSlots: 4 - l.confirmedPlayers.length,
      confirmedCount: l.confirmedPlayers.length,
    }));

    res.json({ lobbies: enriched });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ───────────────────────────────────────────
// GET /api/lobbies/my — Current user's lobbies
// ───────────────────────────────────────────
router.get('/my', verifyToken, async (req, res) => {
  try {
    const currentUser = await getDbUser(req.user.uid);

    const [organized, joinedRaw, pendingInvites] = await Promise.all([
      prisma.matchLobby.findMany({
        where: { organizerId: currentUser.id },
        include: {
          confirmedPlayers: { include: { user: { select: { id: true, name: true, avatarUrl: true, skillRating: true } } } },
          invites: { include: { receiver: { select: { id: true, name: true, avatarUrl: true } } } },
          joinRequests: {
            where: { status: 'PENDING' },
            include: { user: { select: { id: true, name: true, avatarUrl: true, skillLevel: true, skillRating: true } } },
          },
          match: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),

      prisma.matchLobbyPlayer.findMany({
        where: { userId: currentUser.id, lobby: { organizerId: { not: currentUser.id } } },
        include: {
          lobby: {
            include: {
              organizer: { select: { id: true, name: true, avatarUrl: true } },
              confirmedPlayers: { include: { user: { select: { id: true, name: true, avatarUrl: true, skillRating: true } } } },
              match: true,
            },
          },
        },
      }),

      prisma.matchInvite.findMany({
        where: { receiverId: currentUser.id, status: 'PENDING', expiresAt: { gt: new Date() } },
        include: {
          lobby: {
            include: {
              organizer: { select: { id: true, name: true, avatarUrl: true, skillLevel: true, skillRating: true } },
              confirmedPlayers: { include: { user: { select: { id: true, name: true, avatarUrl: true, skillRating: true } } } },
            },
          },
        },
      }),
    ]);

    res.json({
      organized,
      joined: joinedRaw.map(j => j.lobby),
      pendingInvites,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ──────────────────────────────────────────────────────────────
// PATCH /api/lobbies/invites/:inviteId — Accept or decline invite
// ──────────────────────────────────────────────────────────────
router.patch('/invites/:inviteId', verifyToken, async (req, res) => {
  try {
    const currentUser = await getDbUser(req.user.uid);
    const { action, declineReason } = req.body;

    const invite = await prisma.matchInvite.findUnique({
      where: { id: req.params.inviteId },
      include: { lobby: { include: { confirmedPlayers: true, organizer: true } } },
    });

    if (!invite) return res.status(404).json({ message: 'Invite not found' });
    if (invite.receiverId !== currentUser.id) return res.status(403).json({ message: 'Not your invite' });
    if (invite.status !== 'PENDING') return res.status(400).json({ message: 'Invite already responded to' });
    if (new Date() > invite.expiresAt) return res.status(400).json({ message: 'Invite has expired' });

    const lobby = invite.lobby;
    if (lobby.status === 'CANCELLED') return res.status(400).json({ message: 'Lobby has been cancelled' });
    if (lobby.confirmedPlayers.length >= 4) return res.status(400).json({ message: 'Lobby is already full' });

    if (action === 'decline') {
      await prisma.matchInvite.update({ where: { id: invite.id }, data: { status: 'DECLINED', declineReason } });
      await prisma.notification.create({
        data: {
          userId: lobby.organizerId, type: 'invite_declined',
          title: 'Invite Declined',
          body: `${currentUser.name} declined your match invite.`,
          data: { lobbyId: lobby.id },
        },
      });
      return res.json({ success: true, action: 'declined' });
    }

    const nextSlot = lobby.confirmedPlayers.length + 1;
    await prisma.$transaction([
      prisma.matchInvite.update({ where: { id: invite.id }, data: { status: 'ACCEPTED' } }),
      prisma.matchLobbyPlayer.create({ data: { lobbyId: lobby.id, userId: currentUser.id, slot: nextSlot } }),
    ]);

    const newCount = lobby.confirmedPlayers.length + 1;
    if (newCount >= 4) {
      await handleLobbyFull(lobby.id);
    } else {
      await prisma.notification.create({
        data: {
          userId: lobby.organizerId, type: 'invite_accepted',
          title: `${currentUser.name} joined! (${newCount}/4)`,
          body: `${currentUser.name} accepted your match invite.`,
          data: { lobbyId: lobby.id },
        },
      });
    }

    res.json({ success: true, action: 'accepted', playersCount: newCount });
  } catch (err) {
    console.error('[Invite Response]', err);
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────
// POST /api/lobbies/:lobbyId/join — Request to join an open lobby
// ─────────────────────────────────────────────────────────────────────
router.post('/:lobbyId/join', verifyToken, async (req, res) => {
  try {
    const currentUser = await getDbUser(req.user.uid);
    const { message } = req.body;
    const lobby = await prisma.matchLobby.findUnique({
      where: { id: req.params.lobbyId },
      include: { confirmedPlayers: true, joinRequests: true },
    });

    if (!lobby) return res.status(404).json({ message: 'Lobby not found' });
    if (lobby.mode !== 'OPEN') return res.status(400).json({ message: 'This is a private lobby' });
    if (lobby.status !== 'WAITING') return res.status(400).json({ message: 'Lobby is not accepting players' });
    if (lobby.organizerId === currentUser.id) return res.status(400).json({ message: 'You are the organizer' });
    if (lobby.confirmedPlayers.some(p => p.userId === currentUser.id)) return res.status(409).json({ message: 'Already in this lobby' });
    if (lobby.joinRequests.some(r => r.userId === currentUser.id && r.status === 'PENDING')) return res.status(409).json({ message: 'Already requested to join' });

    const request = await prisma.matchJoinRequest.create({ data: { lobbyId: lobby.id, userId: currentUser.id, message } });

    await prisma.notification.create({
      data: {
        userId: lobby.organizerId, type: 'join_request',
        title: 'Player Wants to Join',
        body: `${currentUser.name} (${currentUser.skillLevel}) wants to join your match`,
        data: { lobbyId: lobby.id, requestId: request.id },
      },
    });

    res.json({ success: true, requestId: request.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────
// PATCH /api/lobbies/:lobbyId/join/:requestId — Organizer approves/rejects
// ──────────────────────────────────────────────────────────────────────
router.patch('/:lobbyId/join/:requestId', verifyToken, async (req, res) => {
  try {
    const organizer = await getDbUser(req.user.uid);
    const { action } = req.body;

    const lobby = await prisma.matchLobby.findUnique({
      where: { id: req.params.lobbyId },
      include: { confirmedPlayers: true },
    });

    if (!lobby || lobby.organizerId !== organizer.id) return res.status(403).json({ message: 'Not authorized' });
    if (lobby.confirmedPlayers.length >= 4) return res.status(400).json({ message: 'Lobby is already full' });

    const request = await prisma.matchJoinRequest.findUnique({
      where: { id: req.params.requestId },
      include: { user: true },
    });

    if (!request || request.lobbyId !== lobby.id) return res.status(404).json({ message: 'Request not found' });

    if (action === 'reject') {
      await prisma.matchJoinRequest.update({ where: { id: request.id }, data: { status: 'REJECTED' } });
      await prisma.notification.create({
        data: {
          userId: request.userId, type: 'join_rejected',
          title: 'Join Request Declined',
          body: `Your request to join ${organizer.name}'s match was declined.`,
          data: { lobbyId: lobby.id },
        },
      });
      return res.json({ success: true, action: 'rejected' });
    }

    const nextSlot = lobby.confirmedPlayers.length + 1;
    await prisma.$transaction([
      prisma.matchJoinRequest.update({ where: { id: request.id }, data: { status: 'APPROVED' } }),
      prisma.matchLobbyPlayer.create({ data: { lobbyId: lobby.id, userId: request.userId, slot: nextSlot } }),
    ]);

    await prisma.notification.create({
      data: {
        userId: request.userId, type: 'join_approved',
        title: 'Join Request Approved!',
        body: `${organizer.name} approved your request. You're in the match!`,
        data: { lobbyId: lobby.id },
      },
    });

    const newCount = lobby.confirmedPlayers.length + 1;
    if (newCount >= 4) await handleLobbyFull(lobby.id);

    res.json({ success: true, action: 'approved', playersCount: newCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────
// POST /api/lobbies/:lobbyId/book — Organizer selects court and books
// ─────────────────────────────────────────────────────────────────────
router.post('/:lobbyId/book', verifyToken, async (req, res) => {
  try {
    const organizer = await getDbUser(req.user.uid);
    const { courtId, date, startTime, endTime } = req.body;

    const lobby = await prisma.matchLobby.findUnique({
      where: { id: req.params.lobbyId },
      include: { confirmedPlayers: { include: { user: true } }, match: true },
    });

    if (!lobby) return res.status(404).json({ message: 'Lobby not found' });
    if (lobby.organizerId !== organizer.id) return res.status(403).json({ message: 'Only organizer can book' });
    if (lobby.status !== 'FULL') return res.status(400).json({ message: 'Lobby must be full before booking' });
    if (lobby.confirmedPlayers.length !== 4) return res.status(400).json({ message: 'Need 4 players to book' });

    const court = await prisma.court.findUnique({ where: { id: courtId }, include: { club: true } });
    if (!court) return res.status(404).json({ message: 'Court not found' });

    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const durationMinutes = (eh * 60 + em) - (sh * 60 + sm);
    const totalPrice = Math.round((durationMinutes / 60) * court.pricePerHour);

    const booking = await prisma.booking.create({
      data: {
        playerId: organizer.id,
        courtId,
        date,
        startTime,
        endTime,
        duration: durationMinutes,
        durationMinutes,
        totalAmount: totalPrice,
        totalPrice,
        status: 'CONFIRMED',
        notes: `Match lobby: ${lobby.id}`,
      },
    });

    await Promise.all([
      prisma.matchLobby.update({ where: { id: lobby.id }, data: { status: 'CONFIRMED' } }),
      prisma.match.update({ where: { lobbyId: lobby.id }, data: { bookingId: booking.id, status: 'SCHEDULED' } }),
    ]);

    // Notify all 4 players
    await Promise.allSettled(lobby.confirmedPlayers.map(p =>
      prisma.notification.create({
        data: {
          userId: p.userId, type: 'match_confirmed',
          title: '🎾 Match Confirmed!',
          body: `Your padel match at ${court.name} is confirmed for ${date} at ${startTime}`,
          data: { lobbyId: lobby.id, bookingId: booking.id },
        },
      })
    ));

    res.json({ success: true, booking });
  } catch (err) {
    console.error('[Book Match]', err);
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────
// POST /api/lobbies/:lobbyId/cancel — Cancel a lobby
// ─────────────────────────────────────────────────────────────────────
router.post('/:lobbyId/cancel', verifyToken, async (req, res) => {
  try {
    const currentUser = await getDbUser(req.user.uid);
    const { reason } = req.body;

    const lobby = await prisma.matchLobby.findUnique({
      where: { id: req.params.lobbyId },
      include: { confirmedPlayers: true },
    });

    if (!lobby || lobby.organizerId !== currentUser.id) return res.status(403).json({ message: 'Only organizer can cancel' });
    if (['CANCELLED', 'COMPLETED'].includes(lobby.status)) return res.status(400).json({ message: 'Cannot cancel this lobby' });

    await prisma.matchLobby.update({ where: { id: lobby.id }, data: { status: 'CANCELLED' } });

    const otherPlayers = lobby.confirmedPlayers.filter(p => p.userId !== currentUser.id);
    await Promise.allSettled(otherPlayers.map(p =>
      prisma.notification.create({
        data: {
          userId: p.userId, type: 'match_cancelled',
          title: 'Match Cancelled',
          body: `${currentUser.name} cancelled the match. ${reason ? `Reason: ${reason}` : ''}`,
          data: { lobbyId: lobby.id },
        },
      })
    ));

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────
// POST /api/lobbies/matches/:matchId/result — Log match result
// ─────────────────────────────────────────────────────────────────────
router.post('/matches/:matchId/result', verifyToken, async (req, res) => {
  try {
    const currentUser = await getDbUser(req.user.uid);
    const { setScores, winnerTeam } = req.body;

    const match = await prisma.match.findUnique({ where: { id: req.params.matchId }, include: { lobby: true } });
    if (!match) return res.status(404).json({ message: 'Match not found' });

    const participantIds = [match.team1Player1Id, match.team1Player2Id, match.team2Player1Id, match.team2Player2Id];
    if (!participantIds.includes(currentUser.id)) return res.status(403).json({ message: 'Only match participants can log results' });

    if (!setScores || setScores.length === 0 || setScores.length > 3) {
      return res.status(400).json({ message: 'Padel matches have 2-3 sets' });
    }

    const team1Sets = setScores.filter(s => s.team1 > s.team2).length;
    const team2Sets = setScores.filter(s => s.team2 > s.team1).length;
    const computedWinner = team1Sets > team2Sets ? 'team1' : 'team2';
    if (computedWinner !== winnerTeam) return res.status(400).json({ message: 'Winner does not match set scores' });

    await Promise.all([
      prisma.match.update({
        where: { id: match.id },
        data: { setScores, team1Sets, team2Sets, winnerId: winnerTeam, status: 'COMPLETED', completedAt: new Date() },
      }),
      prisma.matchLobby.update({ where: { id: match.lobbyId }, data: { status: 'COMPLETED' } }),
    ]);

    await updateRatingsAfterMatch(match, winnerTeam, setScores);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ───────────────────────────────────────────────────────
// INTERNAL: Called when lobby reaches 4 confirmed players
// ───────────────────────────────────────────────────────
async function handleLobbyFull(lobbyId) {
  try {
    const lobby = await prisma.matchLobby.findUnique({
      where: { id: lobbyId },
      include: {
        confirmedPlayers: {
          include: { user: { select: { id: true, name: true, skillRating: true, playingStyle: true, preferredPosition: true, winRate: true } } },
        },
      },
    });

    const players = lobby.confirmedPlayers.sort((a, b) => a.slot - b.slot).map(p => p.user);
    const { team1, team2, breakdown } = balanceTeams(players);

    const match = await prisma.match.create({
      data: {
        lobbyId: lobby.id,
        team1Player1Id: team1[0].id,
        team1Player2Id: team1[1].id,
        team2Player1Id: team2[0].id,
        team2Player2Id: team2[1].id,
        status: 'SCHEDULED',
      },
    });

    await prisma.matchLobby.update({ where: { id: lobbyId }, data: { status: 'FULL' } });

    const notifyBody = `Teams balanced! ${team1.map(p => p.name).join(' & ')} vs ${team2.map(p => p.name).join(' & ')}. Organizer is selecting a court.`;
    await Promise.allSettled(lobby.confirmedPlayers.map(p =>
      prisma.notification.create({
        data: {
          userId: p.userId, type: 'lobby_full',
          title: '🎾 All 4 Players Confirmed!',
          body: notifyBody,
          data: { lobbyId: lobby.id, matchId: match.id, breakdown },
        },
      })
    ));
  } catch (err) {
    console.error('[handleLobbyFull]', err);
  }
}

// ────────────────────────────────────────────────────────────────
// INTERNAL: Update skill ratings for all 4 players after a match
// ────────────────────────────────────────────────────────────────
async function updateRatingsAfterMatch(match, winnerTeam, setScores) {
  const winnerIds = winnerTeam === 'team1'
    ? [match.team1Player1Id, match.team1Player2Id]
    : [match.team2Player1Id, match.team2Player2Id];
  const loserIds = winnerTeam === 'team1'
    ? [match.team2Player1Id, match.team2Player2Id]
    : [match.team1Player1Id, match.team1Player2Id];

  const [winners, losers] = await Promise.all([
    prisma.user.findMany({ where: { id: { in: winnerIds } }, select: { id: true, skillRating: true } }),
    prisma.user.findMany({ where: { id: { in: loserIds } }, select: { id: true, skillRating: true } }),
  ]);

  const avgWinnerRating = winners.reduce((s, p) => s + p.skillRating, 0) / 2;
  const avgLoserRating = losers.reduce((s, p) => s + p.skillRating, 0) / 2;

  const totalSetsWon = winnerTeam === 'team1'
    ? setScores.filter(s => s.team1 > s.team2).length
    : setScores.filter(s => s.team2 > s.team1).length;
  const scoreDominance = totalSetsWon / setScores.length;

  const K = 0.25;
  const expectedWin = 1 / (1 + Math.pow(10, (avgLoserRating - avgWinnerRating) / 2));
  const ratingChange = K * (scoreDominance - expectedWin);

  await Promise.all([
    ...winners.map(w => prisma.user.update({
      where: { id: w.id },
      data: { skillRating: Math.min(7.0, Math.max(1.0, w.skillRating + ratingChange)) },
    })),
    ...losers.map(l => prisma.user.update({
      where: { id: l.id },
      data: { skillRating: Math.min(7.0, Math.max(1.0, l.skillRating - ratingChange)) },
    })),
  ]);
}

export default router;
