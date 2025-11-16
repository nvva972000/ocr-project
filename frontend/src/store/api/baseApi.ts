import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL, API_PATH } from '../../utils/constants';

// Base API configuration 
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}${API_PATH}`,
    credentials: 'include', 
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      
      return headers;
    },
  }),
  endpoints: () => ({}),
  tagTypes: ['User'],
});

export const { usePrefetch } = baseApi; 