import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import { logger } from "./lib/logger.js";

const requiredEnvVars = [
  "FIREBASE_SERVICE_ACCOUNT",
  "DATABASE_URL",
  "DIRECT_URL",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "RESEND_API_KEY",
];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);
if (missingEnvVars.length > 0) {
  logger.warn({ missingEnvVars }, "Missing required server environment variables. API routes may fail.");
} else {
  logger.info("All required server environment variables are present.");
}

// Route imports
import authRoutes from "./modules/auth/auth.routes.js";
import courtRoutes from "./modules/courts/courts.routes.js";
import bookingRoutes from "./modules/bookings/bookings.routes.js";
import playerRoutes from "./modules/players/players.routes.js";
import matchRoutes from "./modules/matchmaking/matchmaking.routes.js";
import marketRoutes from "./modules/marketplace/marketplace.routes.js";
import communityRoutes from "./modules/community/community.routes.js";
import chatRoutes from "./modules/chat/chat.routes.js";
import notificationRoutes from "./modules/notifications/notifications.routes.js";
import chatbotRoutes from "./modules/chatbot/chatbot.routes.js";
import searchRoutes from "./modules/search/search.routes.js";
import tournamentRoutes from "./modules/tournaments/tournaments.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import clubRoutes from "./modules/clubs/clubs.routes.js";
import reviewRoutes from "./modules/reviews/reviews.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
console.log('🚀 Express app initialized');

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log('[API] incoming request', req.method, req.originalUrl);
  logger.info({ method: req.method, url: req.originalUrl }, 'Incoming API request');
  next();
});

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: "Too many requests" });
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many login attempts. Try again in 15 minutes." },
});

// app.use(limiter);
// add proper error handling later for rate limit exceeded

app.get("/api/healthz", (req, res) => res.json({ status: "ok", timestamp: new Date() }));
app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date() }));

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth", authRoutes);
logger.info("Mounted auth router at /api/auth");
app.use("/api/courts", courtRoutes);
app.use("/api/bookings", bookingRoutes);
logger.info("Mounted bookings router at /api/bookings");
app.get('/api/bookings/test', (req, res) => res.json({ status: 'ok', message: 'bookings route reachable' }));
app.use("/api/players", playerRoutes);
app.use("/api/matchmaking", matchRoutes);
app.use("/api/listings", marketRoutes);
app.use("/api/posts", communityRoutes);
app.use("/api/conversations", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/reviews", reviewRoutes);

app.get('/api/debug/routes', (req, res) => {
  const routes = app._router.stack
    .filter((layer) => layer.route)
    .map((layer) => ({
      path: layer.route.path,
      methods: Object.keys(layer.route.methods).map((m) => m.toUpperCase()),
    }));
  console.log('[API DEBUG] route list', routes);
  res.json({ status: 'ok', routes });
});

app.get('/api/debug/health', (req, res) => {
  console.log('[API DEBUG] health check');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    logger.warn({ method: req.method, url: req.originalUrl }, 'API route not found');
    return res.status(404).json({ error: 'API route not found', path: req.originalUrl });
  }
  next();
});

app.use(errorHandler);

export default app;
