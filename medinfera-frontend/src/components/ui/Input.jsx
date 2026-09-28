import React from 'react';

export const Input = React.forwardRef(({ className = '', error, label, id, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={`w-full border rounded-xl px-4 py-2.5 outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
          error ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 bg-white'
        } ${props.disabled ? 'bg-slate-50 cursor-not-allowed text-slate-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
