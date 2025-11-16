import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { addToast, createToast } from '../../store/slices/toast_slice';
import { register } from '../../api/auth.api';

interface RegisterValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  first_name?: string;
  last_name?: string;
}

export const useRegister = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (values: RegisterValues) => {
    try {
      setLoading(true);
      setError(null);

      // Đảm bảo email có giá trị
      if (!values.email || !values.email.trim()) {
        const errorMsg = 'Please input your email!';
        setError(errorMsg);
        setLoading(false);
        return;
      }

      // Kiểm tra password match
      if (values.password !== values.confirmPassword) {
        const errorMsg = 'Passwords do not match!';
        setError(errorMsg);
        setLoading(false);
        return;
      }

      const response = await register({
        username: values.username?.trim() || '',
        email: values.email.trim(),
        password: values.password || '',
        first_name: values.first_name?.trim() || undefined,
        last_name: values.last_name?.trim() || undefined,
      });

      if (response?.data) {
        navigate('/login', { replace: true });
      } else {
        const errorMsg = 'Registration failed: Invalid response from server';
        setError(errorMsg);
      }
    } catch (error: any) {
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error?.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          const firstError = error.response.data.detail[0];
          errorMessage = firstError.msg || `Field ${firstError.loc?.join('.')} is required`;
        } else {
          errorMessage = error.response.data.detail;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.error) {
        errorMessage = error.error;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    handleRegister,
    loading,
    error,
    setError,
  };
};
