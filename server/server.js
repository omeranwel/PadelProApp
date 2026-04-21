import http from 'http';
import app from './src/app.js';
import prisma from './src/config/db.js';
import { initSocket } from './src/config/socket.js';

const PORT = process.env.PORT || 3000;

const httpServer = http.createServer(app);

// Initialize Socket.io
initSocket(httpServer);

async function start() {
  try {
    await prisma.$connect().catch(err => console.warn('⚠️ Database connection failed. Working in degraded mode.', err.message));
    
    httpServer.listen(PORT, () => {
      console.log(`🚀 PadelPro API running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();
