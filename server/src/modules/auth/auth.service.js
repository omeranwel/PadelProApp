import bcrypt from 'bcrypt';
import crypto from 'crypto';
import prisma from '../../config/db.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';
import { generateOtp, sendOtpSms } from '../../utils/otp.js';
import { safeUserSelect } from '../../utils/userSelect.js';

const SALT_ROUNDS = 12;

export const register = async ({ name, email, password, phone, role, skillLevel }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  
  const user = await prisma.user.create({
    data: { 
      name, 
      email, 
      passwordHash, 
      phone, 
      role: role || 'PLAYER', 
      skillLevel: skillLevel || 'beginner' 
    },
    select: safeUserSelect
  });

  // If phone provided, trigger OTP
  if (phone) {
    try {
      const otp = await generateOtp(phone);
      await sendOtpSms(phone, otp);
    } catch (otpErr) {
      console.error('Failed to send OTP:', otpErr.message);
      // We don't throw here to avoid failing registration if OTP fails
    }
  }

  const accessToken = signAccessToken({ id: user.id, role: user.role });
  const refreshToken = signRefreshToken({ id: user.id });

  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  await prisma.refreshToken.create({
    data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 7*24*60*60*1000) }
  });

  return { user, accessToken, refreshToken };
};

export const login = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const safeUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: safeUserSelect
  });
  
  const accessToken = signAccessToken({ id: user.id, role: user.role });
  const refreshToken = signRefreshToken({ id: user.id });

  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  await prisma.refreshToken.create({
    data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 7*24*60*60*1000) }
  });

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
    if (!stored || stored.expiresAt < new Date()) {
      const err = new Error('Invalid or expired refresh token'); err.status = 401; throw err;
    }

    const decoded = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    
    if (!user) {
      const err = new Error('User not found');
      err.status = 401;
      throw err;
    }

    await prisma.refreshToken.delete({ where: { tokenHash } });
    
    const newRefreshToken = signRefreshToken({ id: user.id });
    const newHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    await prisma.refreshToken.create({
      data: { userId: user.id, tokenHash: newHash, expiresAt: new Date(Date.now() + 7*24*60*60*1000) }
    });

    const accessToken = signAccessToken({ id: user.id, role: user.role });
    return { accessToken, refreshToken: newRefreshToken };
  } catch (err) {
    const refreshErr = new Error(err.message || 'Invalid refresh token');
    refreshErr.status = 401;
    throw refreshErr;
  }
};

export const verifyOtp = async (phone, otp) => {
  const record = await prisma.otpCode.findFirst({
    where: { 
      phone, 
      code: otp, 
      used: false, 
      expiresAt: { gt: new Date() } 
    },
    orderBy: { createdAt: 'desc' }
  });

  if (!record) {
    const err = new Error('Invalid or expired OTP');
    err.status = 400;
    throw err;
  }

  // Use a transaction to update both records
  return await prisma.$transaction(async (tx) => {
    await tx.otpCode.update({ 
      where: { id: record.id }, 
      data: { used: true } 
    });

    await tx.user.updateMany({ 
      where: { phone }, 
      data: { isVerified: true } 
    });

    return { verified: true };
  });
};

export const sendPasswordReset = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return; // Silent return for security

  console.log(`[Auth] Password reset requested for ${email}`);
  // Mock email sent
  return true;
};
