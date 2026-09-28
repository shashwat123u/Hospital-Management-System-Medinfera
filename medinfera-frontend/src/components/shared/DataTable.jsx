import React from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';
import { Skeleton } from '../ui/Skeleton';
import { Button } from '../ui/Button';

export const DataTable = ({ 
  columns, 
  data, 
  isLoading, 
  pagination, 
  onPageChange,
  onRowClick,
  emptyStateTitle,
  emptyStateDescription
}) => {
  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="border rounded-2xl overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-medium text-xs">
                <tr>
                  {columns.map((_, i) => (
                    <th key={i} className="px-6 py-4"><Skeleton className="h-4 w-24" /></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    {columns.map((_, j) => (
                      <td key={j} className="px-6 py-4"><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="border rounded-2xl bg-white">
        <EmptyState title={emptyStateTitle} description={emptyStateDescription} />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      <div className="border rounded-2xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-medium text-xs tracking-wider">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-6 py-4 whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr 
                  key={row.id} 
                  onClick={() => onRowClick && onRowClick(row.original)}
                  className={`border-t border-slate-100 transition-colors ${onRowClick ? 'cursor-pointer hover:bg-slate-50' : 'hover:bg-slate-50/50'}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-slate-600">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
            <span className="text-sm text-slate-500">
              Page <span className="font-medium text-slate-900">{pagination.page}</span> of{' '}
              <span className="font-medium text-slate-900">{pagination.totalPages}</span>
            </span>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                disabled={pagination.page <= 1}
                onClick={() => onPageChange(pagination.page - 1)}
                icon={ChevronLeft}
              >
                Prev
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => onPageChange(pagination.page + 1)}
              >
                Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
