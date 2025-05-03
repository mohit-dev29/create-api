import { getPosts } from '../controllers/post.two.controller';
import { requireAuth } from '../middlewares/auth';

router.get('/', requireAuth, getPosts);
