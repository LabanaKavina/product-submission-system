import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/reviewService';

class ReviewController {
  private reviewService: ReviewService;

  constructor() {
    this.reviewService = new ReviewService();
  }

  getAllProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, status, search, sortBy, order } = req.query as Record<string, string>;
      const result = await this.reviewService.getAllProducts({
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
        status,
        search,
        sortBy,
        order
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  reviewProduct = async (req: Request<{ id: string }, {}, { status: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const productId = parseInt(req.params.id, 10);
      const { status } = req.body;
      const product = await this.reviewService.reviewProduct(productId, status);
      res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  };
}

export default new ReviewController();
