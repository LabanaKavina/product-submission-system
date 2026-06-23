import { VariantFormData, ProductFormErrors } from '../types/form';
import { ALLOWED_IMAGE_TYPES } from './constants';

/**
 * Validates the product name, description, and all variant rows.
 * Returns `{ errors, isValid }`.
 *
 * In the edit flow, a variant is allowed to have no *new* image as long
 * as `existingImagePath` is set (pass `requireNewImage = false`).
 */
export function validateProductForm(
  productName: string,
  description: string,
  variants: VariantFormData[],
  requireNewImage: boolean = true
): { errors: ProductFormErrors; isValid: boolean } {
  const errors: ProductFormErrors = { variants: [] };
  let isValid = true;

  if (!productName.trim()) {
    errors.name = 'Product name is required';
    isValid = false;
  }

  if (!description.trim()) {
    errors.description = 'Description is required';
    isValid = false;
  }

  variants.forEach((variant) => {
    const variantError: ProductFormErrors['variants'][number] = {};

    if (!variant.name.trim()) {
      variantError.name = 'Variant name is required';
      isValid = false;
    }

    if (!variant.price.trim()) {
      variantError.price = 'Price is required';
      isValid = false;
    } else if (parseFloat(variant.price) <= 0) {
      variantError.price = 'Price must be greater than 0';
      isValid = false;
    }

    const hasExisting = !requireNewImage && !!variant.existingImagePath;
    if (!variant.image && !hasExisting) {
      variantError.image = 'Image is required';
      isValid = false;
    } else if (variant.image && !ALLOWED_IMAGE_TYPES.includes(variant.image.type as any)) {
      variantError.image = 'Image must be JPEG, PNG, or WebP';
      isValid = false;
    }

    errors.variants.push(variantError);
  });

  return { errors, isValid };
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
