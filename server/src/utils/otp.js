import prisma from '../config/db.js';
import { sendOtpEmail as sendResendOtpEmail } from './email.js';

export const generateOtp = async (email) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.otpCode.create({ data: { email, code, expiresAt } });
  return code;
};

export const sendOtpEmail = async (email, code, name = '') => {
  return sendResendOtpEmail(email, code, name);
};
