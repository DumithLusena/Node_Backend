import { Router } from 'express';
import { register, login, updateProfile, getProfile, getUsers } from '../controllers/usersController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.put('/me', authenticate, updateProfile);
router.get('/profile', authenticate, getProfile);
router.get('/', getUsers);

export default router;
