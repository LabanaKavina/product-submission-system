import { ProductStatus } from '../types/product';

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export const STATUS_OPTIONS: { value: '' | ProductStatus; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'Submitted', label: 'Submitted' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
];

export const STATUS_BADGE_VARIANT: Record<ProductStatus, 'submitted' | 'approved' | 'rejected'> = {
  Submitted: 'submitted',
  Approved: 'approved',
  Rejected: 'rejected',
};
