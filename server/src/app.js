import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import courtRoutes from './modules/courts/courts.routes.js';
import bookingRoutes from './modules/bookings/bookings.routes.js';
import playerRoutes from './modules/players/players.routes.js';
import matchRoutes from './modules/matchmaking/matchmaking.routes.js';
import marketRoutes from './modules/marketplace/marketplace.routes.js';
import communityRoutes from './modules/community/community.routes.js';
import chatRoutes from './modules/chat/chat.routes.js';
import notificationRoutes from './modules/notifications/notifications.routes.js';
import chatbotRoutes from './modules/chatbot/chatbot.routes.js';
import searchRoutes from './modules/search/search.routes.js';
// ... other imports will be added as we build modules

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: 'Too many requests' }));

// Health Check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Mount Auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/courts', courtRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/match-requests', matchRoutes);
app.use('/api/listings', marketRoutes);
app.use('/api/posts', communityRoutes);
app.use('/api/conversations', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/search', searchRoutes);

// Error Handling
app.use(errorHandler);

export default app;
