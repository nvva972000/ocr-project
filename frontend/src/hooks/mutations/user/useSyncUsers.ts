import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/api/user.api';
import { useAppDispatch } from '@/store';
import { addToast, createToast } from '@/store/slices/toast_slice';

interface UseSyncUsersOptions {
  showToast?: boolean; // Optional: control whether to show toast notifications
  onSuccess?: () => void; // Optional: callback on success
  onError?: (error: any) => void; // Optional: callback on error
}

export const useSyncUsers = (options?: UseSyncUsersOptions) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const showToast = options?.showToast !== false; // Default to true

  return useMutation({
    mutationFn: async () => {
      // Call sync-users endpoint
      return await userApi.syncUsers();
    },
    onSuccess: (data) => {
      if (data?.success) {
        // Invalidate and refetch users query
        queryClient.invalidateQueries({ queryKey: ['users'] });
        
        if (showToast) {
          dispatch(
            addToast(
              createToast.success(
                'Users synced successfully',
                data.data?.message || 'Users have been synced',
                3000
              )
            )
          );
        }
        
        // Call custom onSuccess callback if provided
        options?.onSuccess?.();
      } else {
        if (showToast) {
          dispatch(
            addToast(
              createToast.error(
                'Failed to sync users',
                data?.error || 'Unknown error occurred',
                5000
              )
            )
          );
        }
      }
    },
    onError: (error: any) => {
      if (showToast) {
        const errorMessage = error?.error || error?.message || 'Failed to sync users';
        dispatch(
          addToast(
            createToast.error(
              'Error syncing users',
              errorMessage,
              5000
            )
          )
        );
      }
      
      // Call custom onError callback if provided
      options?.onError?.(error);
    },
  });
};

