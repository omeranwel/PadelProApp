import prisma from '../config/db.js';

/**
 * generateOtp - creates a 6-digit code, stores it in the DB with 10min expiry
 * @param {string} phone
 * @returns {Promise<string>}
 */
export const generateOtp = async (phone) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Optional check: if phone exists as a user or we just create it for registration
  await prisma.otpCode.create({
    data: {
      phone,
      code,
      expiresAt
    }
  });

  return code;
};

/**
 * sendOtpSms - logs to console in dev, would send real SMS in production
 * @param {string} phone
 * @param {string} code
 */
export const sendOtpSms = async (phone, code) => {
  console.log(`[OTP] Sending code ${code} to ${phone}`);
  // In a real app, this would call Twilio or another SMS gateway
  return true;
};
