import { Transaction, Op } from 'sequelize';
import sequelize from '../config/database';
import { Product, ProductStatus } from '../models/Product';
import { Variant } from '../models/Variant';
import { User } from '../models/User';
import { AppError } from '../utils/errors';

export interface VariantData {
  name: string;
  price: number;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  variants: VariantData[];
}

export interface VariantJSON {
  id: number;
  productId: number;
  name: string;
  price: number;
  imagePath: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductWithVariants {
  id: number;
  userId: number;
  name: string;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  variants: VariantJSON[];
}

/** Lightweight shape returned by getProductsByUser (list view). */
export interface ProductListItem {
  id: number;
  name: string;
  status: string;
  createdAt: Date;
  variantCount: number;
  coverImagePath: string | null;
}

export class ProductService {

  // ── uniqueness helper ────────────────────────────────────────────────────

  /**
   * Throws 409 if `userId` already has a non-deleted product with this name,
   * optionally excluding `excludeProductId` (used on update).
   */
  private async assertUniqueNameForUser(
    userId: number,
    name: string,
    excludeProductId?: number
  ): Promise<void> {
    const where: any = {
      userId,
      name: name.trim()
    };
    if (excludeProductId) {
      where.id = { [Op.ne]: excludeProductId };
    }
    const existing = await Product.findOne({ where });
    if (existing) {
      throw new AppError(
        `You already have a product named "${name.trim()}". Please use a different name.`,
        409
      );
    }
  }

  // ── create ───────────────────────────────────────────────────────────────

  async createProduct(
    userId: number,
    productData: CreateProductRequest,
    variantFiles: Express.Multer.File[]
  ): Promise<ProductWithVariants> {
    await this.assertUniqueNameForUser(userId, productData.name);

    const transaction: Transaction = await sequelize.transaction();

    try {
      const product = await Product.create(
        {
          userId,
          name: productData.name,
          description: productData.description,
          status: ProductStatus.SUBMITTED
        },
        { transaction }
      );

      const variants = await Promise.all(
        productData.variants.map((variant, index) =>
          Variant.create(
            {
              productId: product.id,
              name: variant.name,
              price: variant.price,
              imagePath: variantFiles[index].path
            },
            { transaction }
          )
        )
      );

      await transaction.commit();

      return {
        ...(product.toJSON() as Omit<ProductWithVariants, 'variants'>),
        variants: variants.map(v => v.toJSON() as VariantJSON)
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // ── list (lightweight) ───────────────────────────────────────────────────

  async getProductsByUser(
    userId: number,
    filters: { search?: string; status?: string; page?: number; limit?: number } = {}
  ): Promise<{
    products: ProductListItem[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const page   = filters.page  && filters.page  > 0 ? filters.page  : 1;
    const limit  = filters.limit && filters.limit > 0 ? filters.limit : 10;
    const offset = (page - 1) * limit;

    const where: any = { userId };
    if (filters.status) where.status = filters.status;
    if (filters.search) where.name = { [Op.like]: `%${filters.search}%` };

    // COUNT total without variant join so it's accurate
    const total = await Product.count({ where });

    // Fetch only the columns we need for the card UI
    const rows = await Product.findAll({
      where,
      attributes: ['id', 'name', 'status', 'createdAt'],
      include: [
        {
          model: Variant,
          as: 'variants',
          // Only fetch the minimum needed: id + imagePath for cover
          attributes: ['id', 'imagePath'],
          // Don't add a WHERE here — we want all variants for the count
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    const products: ProductListItem[] = rows.map(p => {
      const plain = p.toJSON() as any;
      const variants: { id: number; imagePath: string }[] = plain.variants ?? [];
      return {
        id:             plain.id,
        name:           plain.name,
        status:         plain.status,
        createdAt:      plain.createdAt,
        variantCount:   variants.length,
        coverImagePath: variants[0]?.imagePath ?? null
      };
    });

    return {
      products,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  // ── get by id (full detail) ──────────────────────────────────────────────

  async getProductById(
    productId: number,
    userId: number,
    userRole: string
  ): Promise<ProductWithVariants> {
    const product = await Product.findByPk(productId, {
      include: [
        { model: Variant, as: 'variants' },
        { model: User, as: 'user', attributes: ['id', 'email'] }
      ]
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (userRole !== 'Admin' && product.userId !== userId) {
      throw new AppError('You do not have permission to access this product', 403);
    }

    return product.toJSON() as ProductWithVariants;
  }

  // ── update ───────────────────────────────────────────────────────────────

  async updateProduct(
    productId: number,
    userId: number,
    updateData: CreateProductRequest,
    variantFiles: Express.Multer.File[]
  ): Promise<ProductWithVariants> {
    const product = await Product.findByPk(productId);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (product.userId !== userId) {
      throw new AppError('You do not have permission to update this product', 403);
    }

    if (product.status !== ProductStatus.SUBMITTED) {
      throw new AppError(`Cannot edit product with status: ${product.status}`, 400);
    }

    // Only check uniqueness if the name actually changed
    if (updateData.name.trim() !== product.name.trim()) {
      await this.assertUniqueNameForUser(userId, updateData.name, productId);
    }

    const transaction: Transaction = await sequelize.transaction();

    try {
      await product.update(
        { name: updateData.name, description: updateData.description },
        { transaction }
      );

      await Variant.destroy({ where: { productId }, transaction });

      let fileIndex = 0;
      const variants = await Promise.all(
        updateData.variants.map((variant: any) => {
          const imagePath = variant.existingImagePath
            ? variant.existingImagePath
            : variantFiles[fileIndex++]?.path || '';
          return Variant.create(
            {
              productId: product.id,
              name: variant.name,
              price: variant.price,
              imagePath
            },
            { transaction }
          );
        })
      );

      await transaction.commit();

      return {
        ...(product.toJSON() as Omit<ProductWithVariants, 'variants'>),
        variants: variants.map(v => v.toJSON() as VariantJSON)
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // ── delete ───────────────────────────────────────────────────────────────

  async softDeleteProduct(productId: number, userId: number): Promise<void> {
    const product = await Product.findByPk(productId);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (product.userId !== userId) {
      throw new AppError('You do not have permission to delete this product', 403);
    }

    await product.destroy();
  }
}
