// Common Redux types that can be reused across slices

export interface BaseState {
  loading: boolean;
  error: string | null;
}

export interface PaginatedState<T> extends BaseState {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface SingleItemState<T> extends BaseState {
  data: T | null;
}

// Common action types
export type LoadingAction = {
  type: string;
  payload: boolean;
};

export type ErrorAction = {
  type: string;
  payload: string | null;
};

// Generic action creators
export const createLoadingAction = (type: string, loading: boolean): LoadingAction => ({
  type,
  payload: loading,
});

export const createErrorAction = (type: string, error: string | null): ErrorAction => ({
  type,
  payload: error,
}); 