/**
 * Shape of a single variant row in create / edit product forms.
 * `existingImagePath` is only populated in the edit flow.
 */
export interface VariantFormData {
  name: string;
  price: string;
  image: File | null;
  previewUrl: string | null;
  existingImagePath?: string | null;
}

export interface ProductFormErrors {
  name?: string;
  description?: string;
  variants: {
    name?: string;
    price?: string;
    image?: string;
  }[];
}

export function emptyFormErrors(variantCount: number = 0): ProductFormErrors {
  return { variants: Array.from({ length: variantCount }, () => ({})) };
}
