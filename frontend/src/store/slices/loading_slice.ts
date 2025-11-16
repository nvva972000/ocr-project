import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface Loading {
    on: boolean;
}

const initialState: Loading = {
    on: false,
};

// Create loading slice
const loadingSlice = createSlice({
    name: 'loading',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.on = action.payload;
        },
    },
});

export const { setLoading } = loadingSlice.actions;

// Selectors
export const selectLoading = (state: { loading: Loading }) => state.loading.on;

export default loadingSlice.reducer; 