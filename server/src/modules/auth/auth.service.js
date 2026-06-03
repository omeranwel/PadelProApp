import bcrypt from 'bcrypt';
import crypto from 'crypto';
import prisma from '../../config/db.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';
import { generateOtp, sendOtpEmail } from '../../utils/otp.js';
import { sendWelcomeEmail } from '../../utils/email.js';
import { safeUserSelect } from '../../utils/userSelect.js';

const SALT_ROUNDS = 12;

export const register = async ({ name, email, password, phone, role, skillLevel }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('Email already registered'); err.status = 409; throw err;
  }
  if (phone) {
    const phoneExists = await prisma.user.findUnique({ where: { phone } });
    if (phoneExists) { const err = new Error('Phone already registered'); err.status = 409; throw err; }
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, phone, role: role || 'PLAYER', skillLevel: skillLevel || 'beginner' },
    select: safeUserSelect
  });

  // Send email OTP for verification
  try {
    const otp = await generateOtp(email);
    await sendOtpEmail(email, otp, name);
  } catch (otpErr) {
    console.error('Failed to send OTP:', otpErr.message);
  }

  return { user, requiresVerification: true, message: 'Registration successful. Please check your email for the verification code.' };
};

export const login = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) { const err = new Error('Invalid credentials'); err.status = 401; throw err; }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) { const err = new Error('Invalid credentials'); err.status = 401; throw err; }

  if (!user.isVerified) {
    // Resend OTP
    try { const otp = await generateOtp(email); await sendOtpEmail(email, otp, user.name); } catch {}
    const err = new Error('Email not verified. A new code has been sent to your email.'); err.status = 403; err.requiresVerification = true; throw err;
  }

  const safeUser = await prisma.user.findUnique({ where: { id: user.id }, select: safeUserSelect });
  const accessToken = signAccessToken({ id: user.id, role: user.role });
  const refreshToken = signRefreshToken({ id: user.id });
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  await prisma.refreshToken.create({ data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 7*24*60*60*1000) } });
  
  await prisma.user.update({ where: { id: user.id }, data: { lastActive: new Date() } });
  return { user: safeUser, accessToken, refreshToken };
};

export const logout = async (userId, refreshToken) => {
  if (refreshToken) {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await prisma.refreshToken.deleteMany({ where: { tokenHash } });
  }
  return true;
};

export const refreshAccessToken = async (token) => {
  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!stored || stored.expiresAt < new Date()) { const err = new Error('Invalid or expired refresh token'); err.status = 401; throw err; }
    const decoded = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) { const err = new Error('User not found'); err.status = 401; throw err; }
    await prisma.refreshToken.delete({ where: { tokenHash } });
    const newRefreshToken = signRefreshToken({ id: user.id });
    const newHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    await prisma.refreshToken.create({ data: { userId: user.id, tokenHash: newHash, expiresAt: new Date(Date.now() + 7*24*60*60*1000) } });
    const accessToken = signAccessToken({ id: user.id, role: user.role });
    return { accessToken, refreshToken: newRefreshToken };
  } catch (err) {
    const e = new Error(err.message || 'Invalid refresh token'); e.status = 401; throw e;
  }
};

export const verifyOtp = async (email, otp) => {
  const record = await prisma.otpCode.findFirst({
    where: { email, code: otp, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' }
  });
  if (!record) { const err = new Error('Invalid or expired OTP'); err.status = 400; throw err; }

  return await prisma.$transaction(async (tx) => {
    await tx.otpCode.update({ where: { id: record.id }, data: { used: true } });
    const updatedUser = await tx.user.update({ where: { email }, data: { isVerified: true }, select: safeUserSelect });
    const accessToken = signAccessToken({ id: updatedUser.id, role: updatedUser.role });
    const refreshToken = signRefreshToken({ id: updatedUser.id });
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await tx.refreshToken.create({ data: { userId: updatedUser.id, tokenHash, expiresAt: new Date(Date.now() + 7*24*60*60*1000) } });
    // Send welcome email (fire-and-forget)
    sendWelcomeEmail(updatedUser).catch(() => {});
    return { verified: true, user: updatedUser, accessToken, refreshToken };
  });
};

export const resendOtp = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { sent: true }; // silent
  if (user.isVerified) { const err = new Error('Account already verified'); err.status = 400; throw err; }
  const otp = await generateOtp(email);
  await sendOtpEmail(email, otp, user.name);
  return { sent: true, message: 'Verification code sent.' };
};

export const sendPasswordReset = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;
  const otp = await generateOtp(email);
  await sendOtpEmail(email, otp, user.name);
  return true;
};
