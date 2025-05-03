import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { verifyToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: { id: string };
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const payload = verifyToken<{ userId: string; sessionToken: string }>(token);

    // Check session token
    const session = await prisma.session.findUnique({
      where: { token: payload.sessionToken },
    });
    if (!session || session.userId !== payload.userId) {
      return res.status(401).json({ message: 'Session invalid or expired' });
    }

    req.user = { id: payload.userId };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
