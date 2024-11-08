import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { agency } = useAuthStore();
  const location = useLocation();

  if (!agency) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}