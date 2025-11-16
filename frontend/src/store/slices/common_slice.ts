import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface Common {
    openMenuUser: boolean;
    isMetaSearchOpen: boolean;
    isCollapsedSidebar: boolean;
    selectedProject: string | null;
    selectedProjectName: string | null;
    openMenuProject: string | null;
}

const initialState: Common = {
    openMenuUser: false,
    isMetaSearchOpen: false,
    isCollapsedSidebar: false,
    selectedProject: localStorage.getItem('currentProject') || '',
    selectedProjectName: localStorage.getItem('currentProjectName') || '',
    openMenuProject: '',
};

const commonSlice = createSlice({
    name: 'common',
    initialState,
    reducers: {
        setOpenMenuUser: (state, action: PayloadAction<boolean>) => {
            state.openMenuUser = action.payload;
        },
        setIsMetaSearchOpen: (state, action: PayloadAction<boolean>) => {
            state.isMetaSearchOpen = action.payload;
        },
        setIsCollapsedSidebar: (state, action: PayloadAction<boolean>) => {
            state.isCollapsedSidebar = action.payload;
        },
        setSelectedProject: (state, action: PayloadAction<string>) => {
            localStorage.setItem('currentProject', action.payload);
            state.selectedProject = action.payload;
        },
        setSelectedProjectName: (state, action: PayloadAction<string>) => {
            localStorage.setItem('currentProjectName', action.payload);
            state.selectedProjectName = action.payload;
        },
        setOpenMenuProject: (state, action: PayloadAction<string>) => {
            state.openMenuProject = action.payload;
        },
    },
});

export const { setOpenMenuUser, setIsMetaSearchOpen, setIsCollapsedSidebar, setSelectedProject, setSelectedProjectName, setOpenMenuProject } = commonSlice.actions;

// Selectors
export const selectOpenMenuUser = (state: { common: Common }) => state.common.openMenuUser;
export const selectIsMetaSearchOpen = (state: { common: Common }) => state.common.isMetaSearchOpen;
export const selectIsCollapsedSidebar = (state: { common: Common }) => state.common.isCollapsedSidebar;
// export const selectSelectedProject = (state: { common: Common }) => state.common.selectedProject;
export const selectSelectedProjectName = (state: { common: Common }) => state.common.selectedProjectName;
export const selectOpenMenuProject = (state: { common: Common }) => state.common.openMenuProject;
export default commonSlice.reducer; 