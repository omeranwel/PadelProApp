import * as service from './tournaments.service.js';

export const getTournaments = async(req,res,next)=>{try{res.json(await service.getTournaments(req.query));}catch(e){next(e);}};
export const getTournamentById = async(req,res,next)=>{try{const t=await service.getTournamentById(req.params.id);if(!t)return res.status(404).json({error:'Not found'});res.json(t);}catch(e){next(e);}};
export const registerForTournament = async(req,res,next)=>{try{res.json(await service.registerForTournament(req.params.id,req.user.id));}catch(e){next(e);}};
export const createTournament = async(req,res,next)=>{try{res.status(201).json(await service.createTournament(req.user.id,req.body));}catch(e){next(e);}};
