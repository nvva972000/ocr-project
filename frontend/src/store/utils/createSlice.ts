import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { BaseState } from '../types/common';

// Utility function to create a slice with common loading and error patterns
export const createBaseSlice = <T extends BaseState>(
  name: string,
  initialState: T
) => {
  return createSlice({
    name,
    initialState,
    reducers: {
      setLoading: (state, action: PayloadAction<boolean>) => {
        state.loading = action.payload;
      },
      setError: (state, action: PayloadAction<string | null>) => {
        state.error = action.payload;
      },
      clearError: (state) => {
        state.error = null;
      },
      reset: (state) => {
        Object.assign(state, initialState);
      },
    },
  });
};

// Utility function to create async thunk action types
export const createAsyncActionTypes = (baseType: string) => ({
  pending: `${baseType}/pending`,
  fulfilled: `${baseType}/fulfilled`,
  rejected: `${baseType}/rejected`,
}); 