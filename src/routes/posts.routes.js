import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { createPost, getPosts, getPostById, updatePost, deletePost } from '../controllers/postsController.js';

const router = Router();

router.get('/', getPosts);
router.get('/:id', getPostById);
router.post('/', authenticate, createPost);
router.put('/:id', authenticate, updatePost);
router.delete('/:id', authenticate, deletePost);

export default router;
