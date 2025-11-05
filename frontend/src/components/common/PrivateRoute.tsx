import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AUTH_MODE } from '@services/config';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;
  const authMode = AUTH_MODE;
  
  if (!isAuthenticated && authMode) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

export default PrivateRoute;
