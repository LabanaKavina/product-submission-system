import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import { validate } from '../middleware/validation';
import { reviewSchema } from '../validators/reviewValidator';
import reviewController from '../controllers/reviewController';

const router: Router = Router();

router.get('/products', authenticateToken, requireRole('Admin'), reviewController.getAllProducts);
router.get('/products/export', authenticateToken, requireRole('Admin'), reviewController.exportProducts);
router.patch('/products/:id/review', authenticateToken, requireRole('Admin'), validate(reviewSchema), reviewController.reviewProduct);

export default router;
