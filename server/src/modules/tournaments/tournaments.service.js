import prisma from '../../config/db.js';

export const getTournaments = async ({ status, city, limit=20 }={}) => {
  const where = {};
  if (status) where.status = status;
  if (city) where.city = city;
  return await prisma.tournament.findMany({
    where, take:parseInt(limit),
    orderBy: { startDate:'asc' },
    include: {
      organizer: { select:{id:true,name:true,avatarUrl:true} },
      court: { select:{id:true,name:true,address:true,area:true} },
    }
  });
};

export const getTournamentById = async (id) => {
  const t = await prisma.tournament.findUnique({
    where:{id},
    include:{
      organizer:{select:{id:true,name:true,avatarUrl:true}},
      court:{select:{id:true,name:true,address:true,area:true,images:{where:{isPrimary:true}}}},
    }
  });
  if (!t) return null;
  // Fetch participant details
  const participants = t.participants?.length
    ? await prisma.user.findMany({
        where:{id:{in:t.participants}},
        select:{id:true,name:true,avatarUrl:true,skillLevel:true,skillRating:true}
      })
    : [];
  return { ...t, participantDetails: participants };
};

export const registerForTournament = async (tournamentId, userId) => {
  const t = await prisma.tournament.findUnique({where:{id:tournamentId}});
  if (!t) throw Object.assign(new Error('Tournament not found'),{status:404});
  if (t.status==='completed') throw Object.assign(new Error('Tournament is over'),{status:400});
  if (new Date()>new Date(t.registrationDeadline)) throw Object.assign(new Error('Registration closed'),{status:400});
  if (t.participants.includes(userId)) throw Object.assign(new Error('Already registered'),{status:409});
  if (t.participants.length>=t.maxParticipants) throw Object.assign(new Error('Tournament is full'),{status:400});

  return await prisma.tournament.update({
    where:{id:tournamentId},
    data:{participants:{push:userId}},
  });
};

export const createTournament = async (organizerId, data) => {
  const { name,description,city,courtId,startDate,endDate,registrationDeadline,format,skillLevel,maxParticipants,entryFee,prizePool } = data;
  return await prisma.tournament.create({
    data:{
      name,description,city:city||'Karachi',courtId:courtId||null,
      startDate:new Date(startDate),endDate:new Date(endDate),
      registrationDeadline:new Date(registrationDeadline),
      format:format||'knockout',skillLevel:skillLevel||'open',
      maxParticipants:parseInt(maxParticipants)||16,
      entryFee:parseInt(entryFee)||0,prizePool:parseInt(prizePool)||0,
      status:'upcoming',organizerId,participants:[],
    }
  });
};
