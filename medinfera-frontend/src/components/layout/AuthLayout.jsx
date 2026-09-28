import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const AuthLayout = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col sm:flex-row bg-slate-50">
      {/* Branding Panel */}
      <div className="hidden sm:flex flex-1 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-white blur-3xl"></div>
          <div className="absolute top-[60%] -right-[10%] w-[60%] h-[60%] rounded-full bg-white blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 font-bold text-3xl tracking-tight mb-8">
            <img src="/medinfera-logo.svg" alt="MedInfera logo" className="w-16 h-16 object-contain" />
            <span>MedInfera</span>
          </div>
          <p className="text-primary-100 text-lg max-w-md leading-relaxed">
            Modern Hospital Management System.<br />
            Streamline your healthcare operations with our comprehensive, secure, and intuitive platform.
          </p>
        </div>

        <div className="relative z-10 text-sm text-primary-200">
          &copy; {new Date().getFullYear()} MedInfera. All rights reserved.
        </div>
      </div>

      {/* Form Panel */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 relative">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="sm:hidden flex items-center gap-2 font-bold text-2xl tracking-tight mb-8 text-primary-600 justify-center">
            <img src="/medinfera-logo.svg" alt="" className="w-10 h-10 object-contain" />
            <span>MedInfera</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};
