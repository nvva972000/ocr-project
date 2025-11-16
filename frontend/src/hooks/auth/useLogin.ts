import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { addToast, createToast } from '../../store/slices/toast_slice';
import { login } from '../../api/auth.api';

interface LoginValues {
  usernameOrEmail: string;
  password: string;
}

export const useLogin = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (values: LoginValues) => {
    try {
      setLoading(true);
      setError(null);
      
      // Tự động detect là username hay email (dựa vào dấu @)
      const input = values.usernameOrEmail.trim();
      const isEmail = input.includes('@');
      
      const response = await login(
        isEmail ? null : input,  // username
        isEmail ? input : null,  // email
        values.password
      );
      
      if (response?.data) {
        navigate("/", { replace: true });
      } else {
        setError(response.error);
      }
    } catch (error: any) {
      const errorMessage = error.message || error.error || "Invalid username/email or password";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    handleLogin,
    loading,
    error,
    setError,
  };
};
