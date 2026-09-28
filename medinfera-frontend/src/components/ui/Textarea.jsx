import React from 'react';

export const Textarea = React.forwardRef(({ className = '', error, label, id, rows = 4, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={id}
        ref={ref}
        rows={rows}
        className={`w-full border rounded-xl px-4 py-2.5 outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y ${
          error ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 bg-white'
        } ${props.disabled ? 'bg-slate-50 cursor-not-allowed text-slate-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';
