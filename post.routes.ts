import { Router } from 'express';
import { createPost } from '../controllers/post.controller';
import { requireAuth } from '../middlewares/auth';

const router = Router();

router.post('/', requireAuth, createPost);

export default router;
