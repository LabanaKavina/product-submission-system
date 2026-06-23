import Button from '../ui/Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * Pagination controls with "Showing X–Y of Z" summary.
 * Renders nothing when there is only one page or no results.
 */
export default function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPrev,
  onNext,
}: PaginationProps) {
  if (total === 0) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mt-8">
      <p className="text-sm text-gray-500">
        Showing {start}–{end} of {total} products
      </p>
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={onPrev}>
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={onNext}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
