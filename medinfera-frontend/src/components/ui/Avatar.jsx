import React from 'react';

export const Avatar = ({ src, alt, fallback, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  return (
    <div className={`relative inline-flex items-center justify-center overflow-hidden bg-primary-100 rounded-full ${sizes[size]} ${className}`}>
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <span className="font-medium text-primary-700">
          {fallback || alt?.charAt(0).toUpperCase() || '?'}
        </span>
      )}
    </div>
  );
};
