import React from 'react';
import { Filter } from 'lucide-react';

export const FilterBar = ({ filters, onFilterChange, className = '' }) => {
  return (
    <div className={`flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-3 py-1.5 ${className}`}>
      <Filter className="w-4 h-4 text-slate-400" />
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {filters.map((filter) => (
          <select
            key={filter.name}
            className="text-sm bg-transparent border-none text-slate-600 focus:ring-0 cursor-pointer outline-none pl-1 pr-6 py-1 appearance-none relative"
            onChange={(e) => onFilterChange(filter.name, e.target.value)}
            defaultValue={filter.defaultValue || ''}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: `right center`,
              backgroundRepeat: `no-repeat`,
              backgroundSize: `1.5em 1.5em`
            }}
          >
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ))}
      </div>
    </div>
  );
};
