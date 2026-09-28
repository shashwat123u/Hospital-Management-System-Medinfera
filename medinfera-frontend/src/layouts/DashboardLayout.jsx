import React from 'react';
import { Outlet } from 'react-router-dom';

export const DashboardLayout = () => {
  // Can wrap dashboard specific context or styling here
  return <Outlet />;
};
