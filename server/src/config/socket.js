import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.js';

export let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }
  });

  // Authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(); // Allow unauthenticated for some events, or enforce later
    
    try {
      socket.user = verifyAccessToken(token);
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id, socket.user?.id || 'anonymous');
    
    if (socket.user) {
      socket.join(`user:${socket.user.id}`);
    }

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected:', socket.id);
    });
  });

  return io;
};
