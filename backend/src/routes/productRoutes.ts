import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { validate } from '../middleware/validation';
import { createProductSchema, updateProductSchema } from '../validators/productValidator';
import productController from '../controllers/productController';

const router: Router = Router();

router.post('/', authenticateToken, upload.array('images'), validate(createProductSchema), productController.createProduct);
router.get('/my', authenticateToken, productController.getMyProducts);
router.get('/:id', authenticateToken, productController.getProductById);
router.put('/:id', authenticateToken, upload.array('images'), validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', authenticateToken, productController.softDeleteProduct);

export default router;
