/**
 * Resolves a variant image path to a full URL.
 * Handles absolute URLs, relative paths, and bare filenames.
 */
export function getImageUrl(imagePath: string): string {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const base = process.env.REACT_APP_API_URL || '';
  const filename = imagePath.includes('/') ? imagePath.split('/').pop()! : imagePath;
  return `${base}/uploads/${filename}`;
}

/** Formats a number as INR currency, e.g. ₹1,200.00 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
}
