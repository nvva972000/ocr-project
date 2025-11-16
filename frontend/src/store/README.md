# Redux Store Base Structure

This directory contains the base Redux setup using Redux Toolkit for the application.

## Structure

```
store/
├── index.ts              # Main store configuration
├── types/
│   └── common.ts         # Common type definitions
├── utils/
│   └── createSlice.ts    # Utility functions for creating slices
├── slices/
│   └── index.ts          # Export all slices
├── api/
│   └── baseApi.ts        # RTK Query base configuration
├── middleware/
│   └── index.ts          # Custom middleware
└── README.md             # This file
```

## Usage

### 1. Store Setup
The main store is configured in `store/index.ts` with:
- Redux Toolkit configuration
- DevTools enabled for development
- Custom middleware support
- Typed hooks (`useAppDispatch`, `useAppSelector`)

### 2. Creating a Slice
Use the utility functions in `utils/createSlice.ts`:

```typescript
import { createBaseSlice } from '../utils/createSlice';
import { BaseState } from '../types/common';

interface MyState extends BaseState {
  data: any[];
}

const initialState: MyState = {
  loading: false,
  error: null,
  data: [],
};

const mySlice = createBaseSlice('my', initialState);

export const { setLoading, setError, clearError, reset } = mySlice.actions;
export default mySlice.reducer;
```

### 3. Adding to Store
In `store/index.ts`:
```typescript
import mySlice from './slices/mySlice';

export const store = configureStore({
  reducer: {
    my: mySlice,
  },
  // ... other config
});
```

### 4. Using in Components
```typescript
import { useAppDispatch, useAppSelector } from '../store';

const MyComponent = () => {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector(state => state.my);
  
  // Use dispatch and state
};
```

### 5. API Calls with RTK Query
Extend the base API in `api/baseApi.ts`:
```typescript
import { baseApi } from './baseApi';

export const myApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getData: builder.query<Data[], void>({
      query: () => 'api/data',
    }),
  }),
});

export const { useGetDataQuery } = myApi;
```

## Common Types
- `BaseState`: Basic state with loading and error
- `PaginatedState<T>`: For paginated data
- `SingleItemState<T>`: For single item data

## Middleware
Custom middleware can be added in `middleware/index.ts` and imported into the store configuration. 