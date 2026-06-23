import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { ProductWithVariants } from '../../types/product';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Card, { CardBody, CardHeader } from '../ui/Card';
import { LoadingState, InlineError, InlineSuccess } from '../common/PageStatus';
import { getImageUrl, formatCurrency } from '../../utils/image';
import { STATUS_BADGE_VARIANT } from '../../utils/constants';

interface AdminProductDetail extends ProductWithVariants {
  user: { id: number; email: string };
}

export default function ProductReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [product, setProduct] = useState<AdminProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiRequest<AdminProductDetail>(
        `/api/products/${id}`,
        {},
        token ?? undefined
      );
      setProduct(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product');
    } finally {
      setIsLoading(false);
    }
  }, [id, token]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  async function handleReview(status: 'Approved' | 'Rejected') {
    if (!id) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await apiRequest(
        `/api/admin/products/${id}/review`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        },
        token ?? undefined
      );
      setSuccessMessage(`Product has been ${status.toLowerCase()} successfully.`);
      setProduct((prev) => (prev ? { ...prev, status } : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <LoadingState fullScreen />;

  if (error && !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/products')}>
          ← Back to Products
        </Button>
        <div className="flex items-center justify-center mt-16">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const isSubmitted = product.status === 'Submitted';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/products')}>
          ← Back to Products
        </Button>
      </div>

      {successMessage && (
        <div className="mb-6">
          <InlineSuccess message={successMessage} />
        </div>
      )}

      {error && (
        <div className="mb-6">
          <InlineError message={error} />
        </div>
      )}

      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h1 className="text-xl font-semibold text-gray-900">Product Review</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                disabled={isSubmitting || !isSubmitted}
                onClick={() => handleReview('Approved')}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={isSubmitting}
                disabled={isSubmitting || !isSubmitted}
                onClick={() => handleReview('Rejected')}
              >
                Reject
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Product Name
              </dt>
              <dd className="text-gray-900 font-medium">{product.name || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Status
              </dt>
              <dd>
                <Badge
                  label={product.status || 'Unknown'}
                  variant={STATUS_BADGE_VARIANT[product.status] ?? 'default'}
                  size="md"
                />
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Description
              </dt>
              <dd className="text-gray-700">{product.description || 'No description provided.'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Submitted By
              </dt>
              <dd className="text-gray-700">{product.user?.email || '—'}</dd>
            </div>
          </dl>
        </CardBody>
      </Card>

      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Variants ({product.variants?.length ?? 0})
      </h2>

      {!product.variants?.length ? (
        <p className="text-gray-500 text-sm">No variants for this product.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {product.variants.map((variant) => (
            <Card key={variant.id}>
              <div className="overflow-hidden rounded-t-xl">
                {variant.imagePath ? (
                  <img
                    src={getImageUrl(variant.imagePath)}
                    alt={variant.name || 'Variant image'}
                    loading="lazy"
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'data:image/svg+xml,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%22100%25%22 height%3D%22192%22 viewBox%3D%220 0 400 192%22%3E%3Crect fill%3D%22%23f3f4f6%22 width%3D%22400%22 height%3D%22192%22%2F%3E%3Ctext fill%3D%22%239ca3af%22 font-family%3D%22sans-serif%22 font-size%3D%2214%22 x%3D%2250%25%22 y%3D%2250%25%22 text-anchor%3D%22middle%22 dominant-baseline%3D%22middle%22%3ENo image%3C%2Ftext%3E%3C%2Fsvg%3E';
                    }}
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-sm text-gray-400">
                    No image
                  </div>
                )}
              </div>
              <CardBody>
                <h3 className="font-semibold text-gray-900 mb-1">{variant.name || '—'}</h3>
                <p className="text-gray-600 text-sm">
                  {variant.price != null ? formatCurrency(variant.price) : '—'}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
