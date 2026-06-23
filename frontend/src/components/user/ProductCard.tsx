import { ProductListItem, ProductStatus } from '../../types/product';
import Badge from '../ui/Badge';
import { STATUS_BADGE_VARIANT } from '../../utils/constants';
import { getImageUrl } from '../../utils/image';

interface ProductCardProps {
  product: ProductListItem;
  onClick: () => void;
}

// Accent bar colour per status — not derivable from the status string alone
const STATUS_ACCENT: Record<ProductStatus, string> = {
  Submitted: 'bg-amber-400',
  Approved:  'bg-emerald-500',
  Rejected:  'bg-red-500',
};

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const status  = (product.status as ProductStatus) || 'Submitted';
  const accent  = STATUS_ACCENT[status] ?? 'bg-gray-300';
  const variant = STATUS_BADGE_VARIANT[status] ?? 'default';

  const coverImage = product.coverImagePath
    ? getImageUrl(product.coverImagePath)
    : null;

  const variantCount = product.variantCount ?? 0;

  const dateStr = product.createdAt
    ? new Date(product.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '—';

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className="group relative bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
    >
      <div className={`h-1 w-full ${accent}`} />

      <div className="relative h-44 bg-gray-50 overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt={`${product.name || 'Product'} cover`}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300">
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M13.5 12a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
              />
            </svg>
            <span className="text-xs font-medium">No image</span>
          </div>
        )}

        {variantCount > 0 && (
          <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-2 py-0.5 rounded-full">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
            {variantCount} {variantCount === 1 ? 'variant' : 'variants'}
          </span>
        )}
      </div>

      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h2 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 flex-1">
            {product.name || 'Untitled Product'}
          </h2>
          <Badge label={product.status || 'Unknown'} variant={variant} size="sm" />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5"
              />
            </svg>
            {dateStr}
          </span>
          <span className="text-xs text-primary-600 font-medium group-hover:underline">
            View details →
          </span>
        </div>
      </div>
    </article>
  );
}
