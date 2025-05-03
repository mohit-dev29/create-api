import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import prisma from '../config/prisma';

export const getMe = async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user?.id },
    select: { id: true, email: true, createdAt: true },
  });

  res.json({ user });
};
