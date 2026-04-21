import bcrypt from 'bcrypt';
import prisma from '../../config/db.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';
import { generateOtp, sendOtpSms } from '../../utils/otp.js';

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
    select: { 
      id: true, 
      name: true, 
      email: true, 
      role: true, 
      skillLevel: true, 
      phone: true,
      avatarUrl: true,
      bio: true,
      isVerified: true,
      createdAt: true 
    }
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

  const { passwordHash, ...safeUser } = user;
  
  const accessToken = signAccessToken({ id: user.id, role: user.role });
  const refreshToken = signRefreshToken({ id: user.id });

  return { user: safeUser, accessToken, refreshToken };
};

export const logout = async (userId) => {
  // Mock success. In a real app, we would denylist the refresh token.
  return true;
};

export const refreshAccessToken = async (token) => {
  try {
    const decoded = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    
    if (!user) {
      const err = new Error('User not found');
      err.status = 401;
      throw err;
    }

    const accessToken = signAccessToken({ id: user.id, role: user.role });
    return { accessToken };
  } catch (err) {
    const refreshErr = new Error('Invalid refresh token');
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
