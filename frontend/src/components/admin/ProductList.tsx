import { useState, useEffect, useRef, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { PaginatedResponse } from '../../types/api';
import { AdminProductListItem, ProductStatus } from '../../types/product';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Input from '../ui/Input';
import { LoadingState } from '../common/PageStatus';
import { useDebounce } from '../../hooks/useDebounce';
import { STATUS_OPTIONS, STATUS_BADGE_VARIANT } from '../../utils/constants';

type SortBy = 'name' | 'createdAt' | 'status';
type Order = 'ASC' | 'DESC';
type StatusFilter = '' | ProductStatus;

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'createdAt', label: 'Date' },
  { value: 'name', label: 'Name' },
  { value: 'status', label: 'Status' },
];

export default function ProductList() {
  const { token }  = useAuth();
  const navigate   = useNavigate();

  const [products, setProducts]     = useState<AdminProductListItem[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const [page, setPage]                 = useState(1);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [sortBy, setSortBy]             = useState<SortBy>('createdAt');
  const [order, setOrder]               = useState<Order>('DESC');

  const debouncedSearch = useDebounce(search, 400);

  const pageRef = useRef(page);
  pageRef.current = page;

  const prevFilters = useRef({ search: debouncedSearch, status: statusFilter, sortBy, order });
  const [fetchTrigger, incTrigger] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    const f = prevFilters.current;
    const changed = f.search !== debouncedSearch || f.status !== statusFilter || f.sortBy !== sortBy || f.order !== order;
    if (changed) {
      prevFilters.current = { search: debouncedSearch, status: statusFilter, sortBy, order };
      pageRef.current = 1;
      setPage(1);
    }
  }, [debouncedSearch, statusFilter, sortBy, order]);

  useEffect(() => {
    let cancelled = false;

    const doFetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set('page', String(pageRef.current));
        params.set('limit', '10');
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (statusFilter)    params.set('status', statusFilter);
        params.set('sortBy', sortBy);
        params.set('order', order);

        const data = await apiRequest<PaginatedResponse<AdminProductListItem>>(
          `/api/admin/products?${params.toString()}`,
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
        if (!cancelled) setLoading(false);
      }
    };

    doFetch();
    return () => { cancelled = true; };
  }, [debouncedSearch, statusFilter, sortBy, order, token, fetchTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSortBy(value: SortBy) {
    if (sortBy === value) {
      setOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(value);
      setOrder('DESC');
    }
  }

  const start = pagination.total === 0 ? 0 : (page - 1) * pagination.limit + 1;
  const end   = Math.min(page * pagination.limit, pagination.total);

  return (
    <div className="flex flex-col h-full">

      <div className="sticky top-0 md:top-0 top-14 z-20 bg-gray-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">All Products</h1>
              {!loading && !error && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {pagination.total > 0
                    ? `${pagination.total} product${pagination.total !== 1 ? 's' : ''} total`
                    : 'No products yet'}
                </p>
              )}
            </div>
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
                    onClick={() => setStatusFilter(opt.value as StatusFilter)}
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

            <div className="flex items-center gap-1 shrink-0">
              <span className="text-xs text-gray-500 mr-1">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 bg-white"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => handleSortBy(sortBy)}
                aria-label={`Sort ${order === 'ASC' ? 'descending' : 'ascending'}`}
                className="px-2 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-200 text-xs font-medium w-8 text-center"
              >
                {order === 'ASC' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <div className="py-16 text-center text-red-600 text-sm">{error}</div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center text-gray-500 text-sm">No products found.</div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-5 py-3 font-semibold text-xs text-gray-500 uppercase tracking-wider whitespace-nowrap">Product Name</th>
                      <th className="px-5 py-3 font-semibold text-xs text-gray-500 uppercase tracking-wider whitespace-nowrap">Submitted By</th>
                      <th className="px-5 py-3 font-semibold text-xs text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                      <th className="px-5 py-3 font-semibold text-xs text-gray-500 uppercase tracking-wider whitespace-nowrap">Variants</th>
                      <th className="px-5 py-3 font-semibold text-xs text-gray-500 uppercase tracking-wider whitespace-nowrap">Date</th>
                      <th className="px-5 py-3 font-semibold text-xs text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/admin/products/${product.id}/review`)}
                      >
                        <td className="px-5 py-3.5 font-medium text-gray-900 whitespace-nowrap">
                          {product.name || '—'}
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                          {product.userEmail || '—'}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <Badge
                            variant={STATUS_BADGE_VARIANT[product.status] ?? 'default'}
                            label={product.status || 'Unknown'}
                          />
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                          {product.variantCount ?? 0}
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                          {product.createdAt
                            ? new Date(product.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '—'}
                        </td>
                        <td
                          className="px-5 py-3.5 whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/products/${product.id}/review`)}
                          >
                            Review
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {!loading && !error && pagination.total > 0 && (
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
