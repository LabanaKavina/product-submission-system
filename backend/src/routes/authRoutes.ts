import { Router } from 'express';
import authController from '../controllers/authController';
import { validate } from '../middleware/validation';
import { loginSchema } from '../validators/authValidator';

const router: Router = Router();

/**
 * @route  POST /api/auth/login
 * @desc   Authenticate a user and return a JWT
 * @access Public
 */
router.post('/login', validate(loginSchema), authController.login);

export default router;
