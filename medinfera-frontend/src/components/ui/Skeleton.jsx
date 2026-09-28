import React from 'react';

export const Skeleton = ({ className = '', variant = 'rectangular', ...props }) => {
  const variants = {
    rectangular: 'rounded-xl',
    circular: 'rounded-full',
    text: 'rounded-md',
  };

  return (
    <div 
      className={`animate-pulse bg-slate-200 ${variants[variant]} ${className}`}
      {...props}
    />
  );
};
