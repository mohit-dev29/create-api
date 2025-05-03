import prisma from '../config/prisma';
import redis from '../config/redis';
import { AuthRequest } from '../middlewares/auth';

// Get posts with cache
export const getPosts = async (req: AuthRequest, res: Response) => {
  const cacheKey = 'posts:all';

  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.json({ posts: JSON.parse(cached), cached: true });
  }

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { id: true, email: true } } },
  });

  await redis.set(cacheKey, JSON.stringify(posts), 'EX', 60); // 60s cache

  res.json({ posts, cached: false });
};
