import React, { useEffect, useRef } from 'react';
import { notification } from 'antd';
import { useAppSelector, useAppDispatch } from '@/store';
import { selectToasts, removeToast } from '@/store/slices/toast_slice';

const ToastContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector(selectToasts);
  const displayedToasts = useRef<Set<string>>(new Set());
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    toasts.forEach((toast) => {
      // Only show toast if it hasn't been displayed yet
      if (!displayedToasts.current.has(toast.id)) {
        displayedToasts.current.add(toast.id);
        
        const { id, type, title, message: toastMessage, duration } = toast;

        // Map toast type to notification type
        const notificationType = type === 'jira' ? 'info' : type;

        api.open({
          message: title,
          description: toastMessage,
          type: notificationType,
          duration: duration ? duration / 1000 : (type === 'error' ? 5 : 3),
          showProgress: true,
          pauseOnHover: true,
          onClose: () => {
            dispatch(removeToast(id));
            displayedToasts.current.delete(id);
          },
        });

        // Remove toast from store after duration
        setTimeout(() => {
          dispatch(removeToast(id));
          displayedToasts.current.delete(id);
        }, duration || 3000);
      }
    });
  }, [toasts, dispatch, api]);

  return <>{contextHolder}</>;
};

export default ToastContainer;

