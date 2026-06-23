export type ProductStatus = 'Submitted' | 'Approved' | 'Rejected';

export interface Variant {
  id: number;
  productId: number;
  name: string;
  price: number;
  imagePath: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  userId: number;
  name: string;
  description: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export type ProductWithVariants = Product & {
  variants: Variant[];
};

/**
 * Lightweight shape returned by GET /api/admin/products (list view).
 */
export interface AdminProductListItem {
  id: number;
  name: string;
  status: ProductStatus;
  createdAt: string;
  userEmail: string | null;
  variantCount: number;
}
export interface ProductListItem {
  id: number;
  name: string;
  status: ProductStatus;
  createdAt: string;
  variantCount: number;
  coverImagePath: string | null;
}
