import { useState, useEffect, useRef, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { ProductStatus, ProductListItem } from '../../types/product';
import { PaginatedResponse } from '../../types/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { LoadingState, ErrorState, EmptyState } from '../common/PageStatus';
import { useDebounce } from '../../hooks/useDebounce';
import { STATUS_OPTIONS } from '../../utils/constants';
import ProductCard from './ProductCard';

type StatusFilter = '' | ProductStatus;

export default function MyProducts() {
  const { token } = useAuth();
  const navigate  = useNavigate();

  const [products, setProducts]     = useState<ProductListItem[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState<string | null>(null);

  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [page, setPage]                 = useState(1);

  const debouncedSearch = useDebounce(search, 400);

  // pageRef holds the current page for use inside the effect without being a dep —
  // avoids a double-fetch when page resets to 1 on filter change.
  const pageRef = useRef(page);
  pageRef.current = page;

  const prevFilters = useRef({ search: debouncedSearch, status: statusFilter });

  // fetchTrigger increments to force a re-fetch when page navigation is clicked
  const [fetchTrigger, incTrigger] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    const filterChanged =
      prevFilters.current.search !== debouncedSearch ||
      prevFilters.current.status !== statusFilter;
    if (filterChanged) {
      prevFilters.current = { search: debouncedSearch, status: statusFilter };
      pageRef.current = 1;
      setPage(1);
    }
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    let cancelled = false;

    const doFetch = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set('page', String(pageRef.current));
        params.set('limit', '10');
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (statusFilter)    params.set('status', statusFilter);

        const data = await apiRequest<PaginatedResponse<ProductListItem>>(
          `/api/products/my?${params.toString()}`,
          {},
          token ?? undefined
        );
        if (!cancelled) {
          setProducts(data.products ?? []);
          setPagination(data.pagination ?? { total: 0, page: pageRef.current, limit: 10, totalPages: 1 });
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    doFetch();
    return () => { cancelled = true; };
  }, [debouncedSearch, statusFilter, token, fetchTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = pagination.total === 0 ? 0 : (page - 1) * pagination.limit + 1;
  const end   = Math.min(page * pagination.limit, pagination.total);

  return (
    <div className="flex flex-col h-full">

      <div className="sticky top-0 md:top-0 top-14 z-20 bg-gray-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">My Products</h1>
              {!isLoading && !error && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {pagination.total > 0
                    ? `${pagination.total} product${pagination.total !== 1 ? 's' : ''} submitted`
                    : 'No products yet'}
                </p>
              )}
            </div>
            <Button variant="primary" size="sm" onClick={() => navigate('/user/products/new')}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Product
            </Button>
          </div>

          <div className="flex flex-wrap gap-3 items-center pb-3">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search products…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                }
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {STATUS_OPTIONS.map((opt) => {
                const active = statusFilter === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { setStatusFilter(opt.value as StatusFilter); setPage(1); }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-300 ${
                      active
                        ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-primary-400 hover:text-primary-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} />
          ) : products.length === 0 ? (
            <EmptyState
              message={
                debouncedSearch || statusFilter
                  ? 'No products match your filters.'
                  : "You haven't submitted any products yet."
              }
              action={
                !debouncedSearch && !statusFilter ? (
                  <Button variant="primary" onClick={() => navigate('/user/products/new')}>
                    Submit your first product
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => navigate(`/user/products/${product.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {!isLoading && !error && pagination.total > 0 && (
        <div className="sticky bottom-0 z-20 bg-gray-50 border-t border-gray-100 shadow-[0_-1px_6px_rgba(0,0,0,0.06)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-500">
              Showing {start}–{end} of {pagination.total} products
            </p>
            {pagination.totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => { pageRef.current = page - 1; setPage(p => p - 1); incTrigger(); }}
                >
                  ← Previous
                </Button>
                <span className="text-sm text-gray-600 px-1">
                  Page {page} of {pagination.totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => { pageRef.current = page + 1; setPage(p => p + 1); incTrigger(); }}
                >
                  Next →
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
