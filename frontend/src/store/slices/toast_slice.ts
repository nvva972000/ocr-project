import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

// Toast types
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'jira';
  title: string;
  message?: string;
  duration?: number;
  onClick?: () => void;
  createdAt: number;
}

export interface ToastState {
  toasts: Toast[];
}

const initialState: ToastState = {
  toasts: [],
};

// Create toast slice
const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    addToast: (state, action: PayloadAction<Omit<Toast, 'id' | 'createdAt'>>) => {
      const toast: Toast = {
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: Date.now(),
      };
      state.toasts.push(toast);
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    },
  },
});

export const { addToast, removeToast, clearToasts } = toastSlice.actions;

// Toast creator function
export const createToast = {
  success: (title: string, message?: string, duration: number = 5000, onClick?: () => void) => ({
    type: 'success' as const,
    title,
    message,
    duration,
    onClick,
  }),
  
  error: (title: string, message?: string, duration: number = 7000, onClick?: () => void) => ({
    type: 'error' as const,
    title,
    message,
    duration,
    onClick,
  }),
  
  warning: (title: string, message?: string, duration: number = 5000, onClick?: () => void) => ({
    type: 'warning' as const,
    title,
    message,
    duration,
    onClick,
  }),
  
  info: (title: string, message?: string, duration: number = 4000, onClick?: () => void) => ({
    type: 'info' as const,
    title,
    message,
    duration,
    onClick,
  }),
  jira: (title: string, message?: string, duration: number = 10000, onClick?: () => void) => ({
    type: 'jira' as const,
    title,
    message,
    duration,
    onClick,
  }),
};

// Selectors
export const selectToasts = (state: { toast: ToastState }) => state.toast.toasts;

export default toastSlice.reducer; 