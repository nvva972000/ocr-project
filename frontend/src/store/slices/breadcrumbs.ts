import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface Breadcrumbs {
    projectName: string;
    documentName: string;
}

const initialState: Breadcrumbs = {
    projectName: "",
    documentName: "",
};

// Create loading slice
const breadcrumbsSlice = createSlice({
    name: 'breadcrumbs',
    initialState,
    reducers: {
        setProjectName: (state, action: PayloadAction<string>) => {
            state.projectName = action.payload;
        },
        setDocumentName: (state, action: PayloadAction<string>) => {
            state.documentName = action.payload;
        },
    },
});

export const { setProjectName, setDocumentName } = breadcrumbsSlice.actions;

// Selectors
export const selectBreadcrumbs = (state: { breadcrumbs: Breadcrumbs }) => state.breadcrumbs;

export default breadcrumbsSlice.reducer; 