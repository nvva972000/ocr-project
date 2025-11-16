import type { Middleware } from '@reduxjs/toolkit';

// Custom middleware examples
export const loggerMiddleware: Middleware = (store) => (next) => (action) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Dispatching:', action);
    const result = next(action);
    console.log('Next State:', store.getState());
    return result;
  }
  return next(action);
};

export const errorMiddleware: Middleware = (store) => (next) => (action) => {
  // Handle global errors here
  const actionWithType = action as { type?: string };
  if (actionWithType.type && actionWithType.type.endsWith('/rejected')) {
    console.error('Action rejected:', action);
  }
  return next(action);
};

// Export all middleware
export const customMiddleware = [loggerMiddleware, errorMiddleware]; 