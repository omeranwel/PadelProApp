import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

// Auto-generate secrets in development if not provided
const getSecret = (envKey) => {
  if (process.env[envKey]) return process.env[envKey];
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`${envKey} environment variable is required in production`);
  }
  const generated = randomBytes(64).toString('hex');
  process.env[envKey] = generated;
  console.warn(`[JWT] ${envKey} not set — auto-generated for development. Set via Replit Secrets for production.`);
  return generated;
};

const jwtSecret = () => getSecret('JWT_SECRET');
const jwtRefreshSecret = () => getSecret('JWT_REFRESH_SECRET');

export const signAccessToken = (payload) =>
  jwt.sign(payload, jwtSecret(), { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' });

export const signRefreshToken = (payload) =>
  jwt.sign(payload, jwtRefreshSecret(), { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' });

export const verifyAccessToken = (token) =>
  jwt.verify(token, jwtSecret());

export const verifyRefreshToken = (token) =>
  jwt.verify(token, jwtRefreshSecret());
