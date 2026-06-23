import { Op, OrderItem } from 'sequelize';
import { Product, ProductStatus } from '../models/Product';
import { Variant } from '../models/Variant';
import { User } from '../models/User';
import { AppError } from '../utils/errors';

interface ProductFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  order?: string;
}

/** Lightweight shape returned by the admin product list. */
export interface AdminProductListItem {
  id: number;
  name: string;
  status: string;
  createdAt: Date;
  userEmail: string | null;
  variantCount: number;
}

interface PaginatedProducts {
  products: AdminProductListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class ReviewService {
  async getAllProducts(filters: ProductFilters = {}): Promise<PaginatedProducts> {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;
    const offset = (page - 1) * limit;

    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      where.name = { [Op.like]: `%${filters.search}%` };
    }

    const allowedSortFields: Record<string, string> = {
      name: 'name',
      status: 'status',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    };

    const sortField = filters.sortBy && allowedSortFields[filters.sortBy]
      ? allowedSortFields[filters.sortBy]
      : 'createdAt';

    const sortOrder = filters.order && filters.order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const orderClause: OrderItem[] = [[sortField, sortOrder]];

    const { count, rows } = await Product.findAndCountAll({
      where,
      attributes: ['id', 'name', 'status', 'createdAt'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['email']
        },
        {
          model: Variant,
          as: 'variants',
          attributes: ['id']
        }
      ],
      order: orderClause,
      limit,
      offset,
      distinct: true
    });

    const products = rows.map(product => {
      const json = product.toJSON() as any;
      return {
        id:           json.id,
        name:         json.name,
        status:       json.status,
        createdAt:    json.createdAt,
        userEmail:    json.user?.email ?? null,
        variantCount: json.variants ? json.variants.length : 0,
      };
    });

    return {
      products,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  async reviewProduct(productId: number, status: string): Promise<any> {
    const product = await Product.findByPk(productId);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (product.status !== ProductStatus.SUBMITTED) {
      throw new AppError('Only products with status "Submitted" can be reviewed', 400);
    }

    await product.update({ status });

    return product.toJSON();
  }
}
