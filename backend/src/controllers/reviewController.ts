import { Request, Response, NextFunction } from 'express';
import { ReviewService, CsvRow } from '../services/reviewService';

function toCsv(rows: CsvRow[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]) as (keyof CsvRow)[];
  const escape = (val: string | number) => {
    const str = String(val);
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };
  const lines = [
    headers.join(','),
    ...rows.map(row => headers.map(h => escape(row[h])).join(',')),
  ];
  return lines.join('\r\n');
}

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

  exportProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, search, sortBy, order } = req.query as Record<string, string>;
      const rows = await this.reviewService.exportProducts({ status, search, sortBy, order });
      const csv = toCsv(rows);
      const filename = `products-export-${new Date().toISOString().slice(0, 10)}.csv`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(200).send(csv);
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
