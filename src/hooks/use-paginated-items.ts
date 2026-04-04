import { useState, useRef, useCallback, useMemo } from "react";

interface PaginatedItem {
  _id: string;
  name: string;
}

interface UsePaginatedItemsReturn {
  page: number;
  search: string;
  items: PaginatedItem[];
  isLoading: boolean;
  hasMore: boolean;
  onSearch: (s: string) => void;
  onLoadMore: () => void;
  setQueryResult: (data: { items: PaginatedItem[]; page: number; totalPages: number } | undefined, loading: boolean) => void;
}

export function usePaginatedItems(): UsePaginatedItemsReturn {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const accumulatedRef = useRef<Map<string, PaginatedItem>>(new Map());
  const lastSearchRef = useRef("");
  const [version, setVersion] = useState(0);

  const handleSearch = useCallback((s: string) => {
    setSearch(s);
    setPage(1);
    accumulatedRef.current = new Map();
    setVersion((v) => v + 1);
  }, []);

  const handleLoadMore = useCallback(() => {
    setPage((p) => p + 1);
  }, []);

  const setQueryResult = useCallback(
    (
      data: { items: PaginatedItem[]; page: number; totalPages: number } | undefined,
      loading: boolean
    ) => {
      setIsLoading(loading);
      if (data?.items) {
        // Reset on new search
        if (search !== lastSearchRef.current) {
          accumulatedRef.current = new Map();
          lastSearchRef.current = search;
        }
        for (const item of data.items) {
          accumulatedRef.current.set(item._id, item);
        }
        setHasMore(data.page < data.totalPages);
        setVersion((v) => v + 1);
      }
    },
    [search]
  );

  const items = useMemo(
    () => Array.from(accumulatedRef.current.values()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );

  return {
    page,
    search,
    items,
    isLoading,
    hasMore,
    onSearch: handleSearch,
    onLoadMore: handleLoadMore,
    setQueryResult,
  };
}
