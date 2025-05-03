import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { generateToken, verifyToken } from '../utils/jwt';
import { hashPassword, comparePassword } from '../utils/hash';
import { loginSchema, registerSchema } from '../validators/auth';
import { v4 as uuidv4 } from 'uuid';

const COOKIE_NAME = 'token';

export const register = async (req: Request, res: Response) => {
  const body = registerSchema.parse(req.body);
  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) return res.status(400).json({ message: 'Email already in use' });

  const hashed = await hashPassword(body.password);
  const user = await prisma.user.create({
    data: {
      email: body.email,
      password: hashed,
    },
  });

  res.status(201).json({ message: 'Registered successfully', user: { id: user.id, email: user.email } });
};

export const login = async (req: Request, res: Response) => {
  const body = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: body.email }, include: { sessions: true } });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const isValid = await comparePassword(body.password, user.password);
  if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

  // Invalidate old sessions
  await prisma.session.deleteMany({ where: { userId: user.id } });

  // Create new session
  const sessionToken = uuidv4();
  await prisma.session.create({ data: { userId: user.id, token: sessionToken } });

  const jwt = generateToken({ userId: user.id, sessionToken });

  res.cookie(COOKIE_NAME, jwt, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({ message: 'Logged in', user: { id: user.id, email: user.email } });
};

export const logout = async (req: Request, res: Response) => {
  const token = req.cookies[COOKIE_NAME];
  res.clearCookie(COOKIE_NAME);
  if (token) {
    try {
      const payload = verifyToken<{ userId: string }>(token);
      await prisma.session.deleteMany({ where: { userId: payload.userId } });
    } catch {}
  }
  res.json({ message: 'Logged out' });
};
