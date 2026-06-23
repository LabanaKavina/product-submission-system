import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ProductWithVariants, ProductStatus } from '../../types/product';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Card, { CardBody } from '../ui/Card';
import Modal from '../ui/Modal';
import { LoadingState, ErrorState } from '../common/PageStatus';
import { getImageUrl, formatCurrency } from '../../utils/image';
import { STATUS_BADGE_VARIANT } from '../../utils/constants';

// Status-specific config for the hero banner
const STATUS_CONFIG: Record<
  ProductStatus,
  { accent: string; bgStrip: string; icon: React.ReactNode }
> = {
  Submitted: {
    accent: 'border-amber-400',
    bgStrip: 'bg-amber-50',
    icon: (
      <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    ),
  },
  Approved: {
    accent: 'border-emerald-500',
    bgStrip: 'bg-emerald-50',
    icon: (
      <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  },
  Rejected: {
    accent: 'border-red-500',
    bgStrip: 'bg-red-50',
    icon: (
      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
  },
};

export default function ProductDetail() {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const { token } = useAuth();

  const [product, setProduct]               = useState<ProductWithVariants | null>(null);
  const [isLoading, setIsLoading]           = useState(true);
  const [error, setError]                   = useState<string | null>(null);
  const [errorType, setErrorType]           = useState<'403' | '404' | 'generic' | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting]         = useState(false);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    setErrorType(null);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || ''}/api/products/${id}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (response.status === 403) { setErrorType('403'); setError("You don't have permission to view this product"); return; }
      if (response.status === 404) { setErrorType('404'); setError('Product not found'); return; }
      if (!response.ok) {
        const body = await response.json().catch(() => ({ message: 'Request failed' }));
        setErrorType('generic');
        setError(body.message || 'Failed to load product');
        return;
      }
      setProduct(await response.json());
    } catch {
      setErrorType('generic');
      setError('Failed to load product');
    } finally {
      setIsLoading(false);
    }
  }, [id, token]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  async function handleDelete() {
    if (!id) return;
    setIsDeleting(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || ''}/api/products/${id}`,
        { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (!response.ok) {
        const body = await response.json().catch(() => ({ message: 'Delete failed' }));
        throw new Error(body.message || 'Delete failed');
      }
      navigate('/user/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) return <LoadingState fullScreen />;

  if (error && (errorType === '403' || errorType === '404')) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" size="sm" onClick={() => navigate('/user/products')} className="-ml-2 mb-8">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to My Products
        </Button>
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-2">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-gray-700">{errorType === '404' ? 'Product not found' : 'Access denied'}</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (error || !product) return <ErrorState message={error || 'Something went wrong'} fullScreen />;

  const status        = product.status as ProductStatus;
  const statusConfig  = STATUS_CONFIG[status] ?? STATUS_CONFIG.Submitted;
  const badgeVariant  = STATUS_BADGE_VARIANT[status] ?? 'default';
  const variantCount  = product.variants?.length ?? 0;
  const canEdit       = status === 'Submitted';
  const dateFormatted = product.createdAt
    ? new Date(product.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <Button variant="ghost" size="sm" onClick={() => navigate('/user/products')} className="-ml-2 mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to My Products
      </Button>

      <Card className={`mb-8 border-l-4 ${statusConfig.accent} overflow-hidden`}>
        <div className={`${statusConfig.bgStrip} px-6 py-2.5 flex items-center gap-2 border-b border-gray-100`}>
          {statusConfig.icon}
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            {status}
          </span>
        </div>

        <CardBody>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                  {product.name || 'Untitled Product'}
                </h1>
                <Badge
                  label={product.status || 'Unknown'}
                  variant={badgeVariant}
                  size="md"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-5 mt-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                  </svg>
                  Submitted {dateFormatted}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  {variantCount} {variantCount === 1 ? 'variant' : 'variants'}
                </span>
              </div>

              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Description</p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {product.description || 'No description provided.'}
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center gap-2 shrink-0">
              {canEdit && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/user/products/${product.id}/edit`)}
                  className="w-full sm:w-auto"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                  </svg>
                  Edit
                </Button>
              )}
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                className="w-full sm:w-auto"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                Delete
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Variants
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {variantCount > 0 ? `${variantCount} variant${variantCount !== 1 ? 's' : ''} in this product` : 'No variants added yet'}
          </p>
        </div>
      </div>

      {!variantCount ? (
        <Card>
          <CardBody>
            <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
              <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M13.5 12a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              <p className="text-sm text-gray-400">No variants found for this product.</p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {product.variants.map((variant, index) => (
            <Card key={variant.id} className="overflow-hidden group">
              <div className="relative h-52 bg-gray-50 overflow-hidden">
                {variant.imagePath ? (
                  <img
                    src={getImageUrl(variant.imagePath)}
                    alt={variant.name || 'Variant image'}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M13.5 12a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                    <span className="text-xs font-medium">No image</span>
                  </div>
                )}
                {/* index badge */}
                <span className="absolute top-2 left-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-bold">
                  {index + 1}
                </span>
              </div>

              <CardBody className="py-3.5">
                <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                  {variant.name || '—'}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-primary-700">
                    {variant.price != null ? formatCurrency(variant.price) : '—'}
                  </span>
                  <span className="text-xs text-gray-400">
                    ID #{variant.id}
                  </span>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Product"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
              Yes, Delete
            </Button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center gap-4 py-2">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-1">
              Delete "{product.name || 'this product'}"?
            </p>
            <p className="text-sm text-gray-500">
              This will permanently remove the product and all its variants. This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
