import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AUTH_MODE } from '../utils/constants';
import { validateToken } from '../api/auth.api';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const authMode = AUTH_MODE;
  
  useEffect(() => {
    const checkAuth = async () => {
      if (!authMode) {
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }

      // Skip validateToken call - assume authenticated if auth mode is on
      // Uncomment below if you want to validate token on route change
      // try {
      //   const result = await validateToken();
      //   if (result?.data?.detail === "TOKEN_VALID") {
      //     setIsAuthenticated(true);
      //   } else {
      //     setIsAuthenticated(false);
      //   }
      // } catch (error) {
      //   setIsAuthenticated(false);
      // } finally {
      //   setLoading(false);
      // }
      
      // For now, skip validation and assume authenticated
      setIsAuthenticated(true);
      setLoading(false);
    };

    checkAuth();
  }, [authMode]);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated && authMode) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;

