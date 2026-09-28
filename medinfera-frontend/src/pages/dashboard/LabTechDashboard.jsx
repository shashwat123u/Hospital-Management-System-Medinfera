import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FlaskConical, ClipboardCheck, Clock } from 'lucide-react';
import { labService } from '../../services/labService';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatsCard } from '../../components/shared/StatsCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { DataTable } from '../../components/shared/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';

export const LabTechDashboard = () => {
  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ['dashboard', 'labtech', 'stats'],
    queryFn: async () => {
      const statusTotals = await Promise.all(['ORDERED', 'SAMPLE_COLLECTED', 'IN_PROGRESS'].map(async status => {
        const res = await labService.getOrders({ page: 1, limit: 1, status });
        return [status, res.data.pagination.total];
      }));
      return Object.fromEntries(statusTotals);
    }
  });

  const { data: recentOrdersResponse, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['dashboard', 'labtech', 'recentOrders'],
    queryFn: async () => {
      const res = await labService.getOrders({ page: 1, limit: 5 });
      return res.data?.data || [];
    }
  });

  const columns = [
    { header: 'Order ID', accessorKey: 'id', cell: ({ row }) => row.original.id?.slice(-8).toUpperCase() || 'N/A' },
    { header: 'Patient', cell: ({ row }) => `${row.original.patient?.firstName || ''} ${row.original.patient?.lastName || ''}`.trim() || 'Unknown' },
    { header: 'Tests', cell: ({ row }) => row.original.items?.map(item => item.labTest?.name).filter(Boolean).join(', ') || '—' },
    { header: 'Priority', accessorKey: 'priority' },
    { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  ];

  const isLoading = isStatsLoading || isOrdersLoading;
  const orders = Array.isArray(recentOrdersResponse) ? recentOrdersResponse : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Laboratory Dashboard" description="Manage lab orders and enter results." />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Ordered" value={statsData?.ORDERED || 0} icon={Clock} color="warning" />
        <StatsCard title="Samples Collected" value={statsData?.SAMPLE_COLLECTED || 0} icon={FlaskConical} color="info" />
        <StatsCard title="In Progress" value={statsData?.IN_PROGRESS || 0} icon={ClipboardCheck} color="success" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {orders.length === 0 && !isLoading ? (
             <div className="p-6">
                <EmptyState title="No recent orders" description="There are no recent lab orders to show." />
             </div>
          ) : (
             <DataTable 
               columns={columns} 
               data={orders} 
               isLoading={isLoading} 
             />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
