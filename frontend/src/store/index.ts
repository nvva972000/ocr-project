import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';

import toastReducer from './slices/toast_slice';
import loadingReducer from './slices/loading_slice';
import breadcrumbsReducer from './slices/breadcrumbs';
import commonReducer from './slices/common_slice';
import apiTestReducer from './slices/apitest';
export const store = configureStore({
  reducer: {
    toast: toastReducer,
    loading: loadingReducer,
    breadcrumbs: breadcrumbsReducer,
    common: commonReducer,
    apiTest: apiTestReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 