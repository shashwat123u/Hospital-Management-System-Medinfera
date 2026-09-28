import React from 'react';

export const Select = React.forwardRef(({ className = '', error, label, id, options = [], children, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
          {label}
        </label>
      )}
      <select
        id={id}
        ref={ref}
        className={`w-full border rounded-xl px-4 py-2.5 outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white ${
          error ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
        } ${props.disabled ? 'bg-slate-50 cursor-not-allowed text-slate-500' : ''} ${className}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: `right 0.5rem center`,
          backgroundRepeat: `no-repeat`,
          backgroundSize: `1.5em 1.5em`,
          paddingRight: `2.5rem`
        }}
        {...props}
      >
        {children ? children : (
          <>
            <option value="" disabled>Select option</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </>
        )}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
