import { useState, useEffect } from 'react';

/**
 * Returns a debounced version of `value` that only updates
 * after the specified `delay` (ms) has elapsed with no changes.
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
