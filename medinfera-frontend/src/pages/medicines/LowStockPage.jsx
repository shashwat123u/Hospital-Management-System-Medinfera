import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ShoppingCart, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { medicineService } from '../../services/medicineService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/shared/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const LowStockPage = () => {
  const navigate = useNavigate();

  const { data: medicines, isLoading } = useQuery({
    queryKey: ['medicines', 'low-stock'],
    queryFn: async () => {
      const res = await medicineService.getLowStock();
      return res.data;
    }
  });

  const columns = [
    { header: 'Medicine Name', accessorKey: 'name', cell: ({ row }) => (
      <div className="font-semibold text-slate-900">{row.original.name}</div>
    )},
    { header: 'Generic Name', accessorKey: 'generic_name' },
    { header: 'Current Stock', accessorKey: 'current_stock', cell: ({ row }) => (
      <span className="text-red-600 font-bold">{row.original.current_stock} {row.original.unit_of_measure}</span>
    )},
    { header: 'Min Level', accessorKey: 'reorder_level', cell: ({ row }) => (
      <span className="text-slate-500 font-medium">{row.original.reorder_level} {row.original.unit_of_measure}</span>
    )},
    { header: 'Status', cell: ({ row }) => {
      const stock = Number(row.original.current_stock);
      return stock === 0 
        ? <Badge variant="danger">Out of Stock</Badge> 
        : <Badge variant="warning">Critical</Badge>;
    }},
    { header: 'Actions', cell: ({ row }) => (
      <Button 
        variant="secondary" 
        size="sm" 
        icon={ShoppingCart}
        onClick={() => navigate('/medicines/purchase-orders', { state: { medicineId: row.original.id } })}
      >
        Reorder
      </Button>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Low Stock Alerts" 
        description="Medicines currently below the minimum threshold."
        actions={
          <Button icon={ShoppingCart} onClick={() => navigate('/medicines/purchase-orders')}>
            View Purchase Orders
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-red-50 border-red-100 flex items-center gap-4 p-6">
          <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-red-600 uppercase tracking-wider">Critical Items</p>
            <p className="text-2xl font-bold text-red-900">{medicines?.length || 0}</p>
          </div>
        </Card>
      </div>

      <Card>
        <DataTable 
          columns={columns} 
          data={medicines || []} 
          isLoading={isLoading} 
          emptyStateTitle="Stock Levels Healthy"
          emptyStateDescription="No medicines are currently below the minimum stock level."
        />
      </Card>
    </div>
  );
};
