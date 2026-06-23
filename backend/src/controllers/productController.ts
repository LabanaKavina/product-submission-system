import { Request, Response, NextFunction } from 'express';
import { ProductService, CreateProductRequest } from '../services/productService';
import { AppError } from '../utils/errors';

class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[];
      const product = await this.productService.createProduct(
        req.user!.userId,
        req.body as CreateProductRequest,
        files
      );
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  };

  getMyProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { search, status, page, limit } = req.query;
      const result = await this.productService.getProductsByUser(req.user!.userId, {
        search: search as string,
        status: status as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 9
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getProductById = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const productId = parseInt(req.params.id, 10);
      if (isNaN(productId)) {
        return next(new AppError('Product not found', 404));
      }
      const product = await this.productService.getProductById(
        productId,
        req.user!.userId,
        req.user!.role
      );
      res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  };

  updateProduct = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const productId = parseInt(req.params.id, 10);
      if (isNaN(productId)) return next(new AppError('Product not found', 404));
      const files = req.files as Express.Multer.File[];
      const product = await this.productService.updateProduct(
        productId,
        req.user!.userId,
        req.body as CreateProductRequest,
        files
      );
      res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  };

  softDeleteProduct = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const productId = parseInt(req.params.id, 10);
      if (isNaN(productId)) return next(new AppError('Product not found', 404));
      await this.productService.softDeleteProduct(
        productId,
        req.user!.userId
      );
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

export default new ProductController();
