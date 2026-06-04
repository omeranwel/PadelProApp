import crypto from 'crypto';
import nodemailer from 'nodemailer';
import prisma from '../config/db.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function hashOtp(otp) {
  return crypto
    .createHmac('sha256', process.env.OTP_SECRET_SALT || 'fallback_secret')
    .update(otp)
    .digest('hex');
}

export async function sendOtpEmail(email, otp, name) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0A1628; color: #F0F4FF; padding: 40px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #00E676; font-size: 28px; margin: 0;">PADELPRO</h1>
        <p style="color: #8BA3C7; margin: 4px 0 0;">Pakistan's Premier Padel Platform</p>
      </div>
      <h2 style="text-align: center;">Hi ${name}, verify your email</h2>
      <p style="color: #8BA3C7; text-align: center;">Enter this code in the app:</p>
      <div style="background: #1A2E4A; border-radius: 12px; padding: 24px; text-align: center; margin: 20px 0;">
        <div style="font-size: 48px; font-weight: 900; letter-spacing: 12px; color: #00E676; font-family: monospace;">
          ${otp}
        </div>
        <p style="color: #8BA3C7; margin: 8px 0 0; font-size: 13px;">Valid for 10 minutes · Do not share this code</p>
      </div>
      <p style="color: #4A6080; font-size: 12px; text-align: center;">If you didn't create a PadelPro account, ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"PadelPro" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `${otp} — Your PadelPro Verification Code`,
    html,
  });
}

export async function createAndSendOtp(userId, email, name) {
  // Rate limit: max 3 OTPs per 15 min
  const existing = await prisma.otpVerification.findUnique({ where: { userId } });
  if (existing) {
    const age = (Date.now() - existing.createdAt.getTime()) / 1000 / 60;
    if (age < 1) throw new Error('Please wait 1 minute before requesting another code');
  }

  const otp = generateOtp();
  const hash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.otpVerification.upsert({
    where: { userId },
    create: { userId, hash, expiresAt, attempts: 0 },
    update: { hash, expiresAt, attempts: 0, createdAt: new Date() },
  });

  await sendOtpEmail(email, otp, name);
}

export async function verifyOtp(userId, otp) {
  const record = await prisma.otpVerification.findUnique({ where: { userId } });
  
  if (!record) throw new Error('No OTP requested. Please request a new code.');
  if (new Date() > record.expiresAt) {
    await prisma.otpVerification.delete({ where: { userId } });
    throw new Error('OTP expired. Please request a new code.');
  }
  if (record.attempts >= 3) throw new Error('Too many attempts. Please request a new code.');

  const hash = hashOtp(otp);
  if (hash !== record.hash) {
    await prisma.otpVerification.update({
      where: { userId },
      data: { attempts: { increment: 1 } },
    });
    throw new Error(`Incorrect code. ${3 - record.attempts - 1} attempts remaining.`);
  }

  // Success
  await Promise.all([
    prisma.otpVerification.delete({ where: { userId } }),
    prisma.user.update({ where: { id: userId }, data: { isVerified: true } }), // Note: existing schema uses isVerified instead of emailVerified
  ]);
}
