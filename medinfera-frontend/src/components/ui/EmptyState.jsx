import React from 'react';
import { ClipboardList } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({ 
  icon: Icon = ClipboardList, 
  title = 'No data available', 
  description = 'There is currently no data to display in this section.',
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
};
