import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { TestExecutionState } from '../../types/test-mnt/api-test-detail-types';

export interface ApiTest {
   activeTestCases: TestExecutionState[];
   runningTestCase: string | null;
}

const initialState: ApiTest = {
    activeTestCases: [],
    runningTestCase: null,
};

// Create loading slice
const apiTestSlice = createSlice({
    name: 'loading',
    initialState,
    reducers: {
        addActiveTestCase: (state, action: PayloadAction<TestExecutionState>) => {
            state.activeTestCases.push(action.payload);
        },
        setRunningTestCase: (state, action: PayloadAction<string | null>) => {
            state.runningTestCase = action.payload;
        },
        updateActiveTestCase: (state, action: PayloadAction<{ executionId: string, data: Partial<TestExecutionState> }>) => {
            const idx = state.activeTestCases.findIndex(tc => tc.id === action.payload.executionId);
            if (idx !== -1) {
                state.activeTestCases[idx] = {
                    ...state.activeTestCases[idx],
                    ...action.payload.data,
                };
            }
        },
    },
});

export const { addActiveTestCase, setRunningTestCase, updateActiveTestCase } = apiTestSlice.actions;

// Selectors
export const selectActiveTestCases = (state: { apiTest: ApiTest }) => state.apiTest.activeTestCases;
export const selectRunningTestCase = (state: { apiTest: ApiTest }) => state.apiTest.runningTestCase;

export default apiTestSlice.reducer; 