import prisma from '../../config/db.js';
import { getDbUser } from '../../utils/getDbUser.js';
import { createAndSendOtp, verifyOtp as verifyOtpService } from '../../services/otpService.js';

export const syncUser = async (req, res, next) => {
  try {
    const { uid, email, name, picture } = req.user; // From Firebase token

    // Find user by email first to prevent unique constraint violations
    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      user = await prisma.user.update({
        where: { email },
        data: { 
          firebaseUid: uid,
          lastActive: new Date(),
          ...(name && { name }),
          ...(picture && { avatarUrl: picture }),
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          firebaseUid: uid,
          email,
          name: name || (email ? email.split('@')[0] : 'User'),
          avatarUrl: picture || null,
          role: 'PLAYER',
          skillLevel: 'beginner',
          skillRating: 3.0,
          profileComplete: false,
          isVerified: false,
          city: 'Karachi', // default
        },
      });
    }

    res.json({ 
      user,
      isNewUser: !user.profileComplete,
      redirect: user.profileComplete ? '/dashboard' : '/onboarding',
    });
  } catch (err) {
    console.error('Auth sync error:', err);
    res.status(500).json({ message: 'Failed to sync user', error: err.message });
  }
};

export const sendOtp = async (req, res, next) => {
  try {
    const dbUser = await getDbUser(req.user.uid);
    if (dbUser.isVerified) {
      return res.json({ success: true, message: 'Email already verified' });
    }
    await createAndSendOtp(dbUser.id, dbUser.email, dbUser.name);
    res.json({ success: true, expiresIn: 600 });
  } catch (err) {
    res.status(err.message.includes('wait') ? 429 : 500)
       .json({ message: err.message });
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { otp } = req.body;
    if (!otp || otp.length !== 6) {
      return res.status(400).json({ message: 'Invalid OTP format' });
    }
    const dbUser = await getDbUser(req.user.uid);
    await verifyOtpService(dbUser.id, otp);
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
