import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  phone: z.string().regex(/^(\+92|0)[0-9]{10}$/).optional(),
  role: z.enum(['PLAYER', 'CLUB_ADMIN']).default('PLAYER'),
  skillLevel: z.enum(['beginner','intermediate','advanced','professional']).default('beginner')
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const otpSchema = z.object({
  phone: z.string(),
  otp: z.string().length(6)
});
