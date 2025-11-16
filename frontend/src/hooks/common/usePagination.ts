import { useState } from 'react';

export const usePagination = (initialPage: number = 1, initialPageSize: number = 10) => {
  const [page, setPageState] = useState<number>(initialPage);
  const [pageSize, setPageSizeState] = useState<number>(initialPageSize);

  const setPage = (newPage: number) => {
    setPageState(newPage);
  };

  const setPageSize = (newPageSize: number) => {
    setPageSizeState(newPageSize);
    setPageState(1); // Reset to first page when page size changes
  };

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
  };
};

