import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';

export const RoleGuard = ({ allowedRoles, children }) => {
  const { hasRole } = usePermissions();

  if (!hasRole(...allowedRoles)) {
    return <Navigate to="/403" replace />;
  }

  return children;
};
