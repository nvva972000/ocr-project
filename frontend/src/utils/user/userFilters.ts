interface UserFilters {
  q?: string;
  page?: number;
  pageSize?: number;
}

export const getUsersFilterParams = (filters: UserFilters) => {
  const { q, page, pageSize } = filters;

  const filterParams: {
    q?: string;
    page?: number;
    page_size?: number;
  } = {
    ...(q && { q }),
    ...(page && { page }),
    ...(pageSize && { page_size: pageSize }),
  };

  return filterParams;
};

