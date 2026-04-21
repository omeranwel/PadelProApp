import * as service from './chatbot.service.js';

export const chat = async (req, res, next) => {
  try {
    const { message, history } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });
    
    const response = await service.getAiResponse(message, history || []);
    res.json({ response });
  } catch (err) {
    next(err);
  }
};
