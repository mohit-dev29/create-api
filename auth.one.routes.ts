import { createPost } from '../controllers/post.controller';
import { requireAuth } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createPostSchema } from '../validations/post.validation';

router.post('/', requireAuth, validate(createPostSchema), createPost);
