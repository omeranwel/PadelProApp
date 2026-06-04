import prisma from '../config/db.js';

export async function getDbUser(firebaseUid) {
  const user = await prisma.user.findUnique({ where: { firebaseUid } });
  if (!user) throw new Error('User not found in database');
  return user;
}
