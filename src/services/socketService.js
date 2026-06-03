import { io } from 'socket.io-client';

let socket;

export const initSocket = (token) => {
  // Connect to same origin — Vite proxy forwards /socket.io to the API server
  socket = io('', {
    auth: { token },
    path: '/socket.io',
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected');
  });

  return socket;
};

export const getSocket = () => socket;
export const disconnectSocket = () => { if (socket) socket.disconnect(); };
