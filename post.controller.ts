import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/auth';

let ioInstance: any;

export const setSocketIoInstance = (io: any) => {
  ioInstance = io;
};

export const createPost = async (req: AuthRequest, res: Response) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content required' });
  }

  const post = await prisma.post.create({
    data: {
      title,
      content,
      authorId: req.user!.id,
    },
  });

  // Emit to all connected users
  ioInstance.emit('post:created', {
    id: post.id,
    title: post.title,
    content: post.content,
    createdAt: post.createdAt,
    authorId: post.authorId,
  });

  res.status(201).json({ post });
};
