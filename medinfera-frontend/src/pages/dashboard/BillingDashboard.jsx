import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Receipt, IndianRupee, Clock } from 'lucide-react';
import { invoiceService } from '../../services/invoiceService';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatsCard } from '../../components/shared/StatsCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { DataTable } from '../../components/shared/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { format } from 'date-fns';

export const BillingDashboard = () => {
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['dashboard', 'billing', 'stats'],
    queryFn: async () => {
      const res = await invoiceService.getStatsRevenue();
      return res.data.data;
    }
  });

  const { data: invoicesResponse, isLoading: isInvoicesLoading } = useQuery({
    queryKey: ['dashboard', 'billing', 'invoices'],
    queryFn: async () => {
      const res = await invoiceService.getAll({ page: 1, limit: 5 });
      return res.data?.data || [];
    }
  });

  const columns = [
    { header: 'Invoice ID', accessorKey: 'id', cell: ({ row }) => row.original.id?.slice(-8).toUpperCase() || 'N/A' },
    { header: 'Patient', cell: ({ row }) => `${row.original.patient?.firstName || ''} ${row.original.patient?.lastName || ''}`.trim() || 'Unknown' },
    { header: 'Amount', accessorKey: 'totalAmount', cell: ({ row }) => `₹${(row.original.totalAmount || 0).toLocaleString()}` },
    { header: 'Date', cell: ({ row }) => row.original.createdAt ? format(new Date(row.original.createdAt), 'dd MMM yyyy') : 'N/A' },
    { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  ];

  const isLoading = isStatsLoading || isInvoicesLoading;
  const invoices = Array.isArray(invoicesResponse) ? invoicesResponse : invoicesResponse?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Billing Dashboard" description="Manage invoices and payments." />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Invoice Value" value={`₹${Number(stats?.totals?.revenue || 0).toLocaleString()}`} icon={IndianRupee} color="success" />
        <StatsCard title="Invoices" value={stats?.totals?.invoices || 0} icon={Receipt} color="primary" />
        <StatsCard title="Outstanding" value={`₹${Number(stats?.totals?.outstanding || 0).toLocaleString()}`} icon={Clock} color="danger" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {invoices.length === 0 && !isLoading ? (
             <div className="p-6">
                <EmptyState title="No recent invoices" description="There are no recent invoices to show." />
             </div>
          ) : (
             <DataTable 
               columns={columns} 
               data={invoices} 
               isLoading={isLoading} 
             />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
