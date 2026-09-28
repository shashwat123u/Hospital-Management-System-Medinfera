import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Microscope, Plus, FileText, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { labService } from '../../services/labService';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/shared/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { format } from 'date-fns';

export const LabOrderListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['lab-orders', { page }],
    queryFn: async () => {
      const res = await labService.getOrders({ page, limit: 10 });
      return res.data;
    }
  });

  const columns = [
    { header: 'Order ID', cell: ({ row }) => (
      <span className="font-mono text-xs font-bold text-slate-900">{row.original.orderNumber || row.original.id.slice(-8)}</span>
    )},
    { header: 'Patient', cell: ({ row }) => (
      <div className="font-semibold text-slate-900">
        {row.original.patient?.user?.firstName} {row.original.patient?.user?.lastName}
      </div>
    )},
    { header: 'Test Name', accessorKey: 'testName', cell: ({ row }) => (
      <div className="text-sm font-medium text-slate-700">{row.original.testName || row.original.test?.name}</div>
    )},
    { header: 'Requested By', cell: ({ row }) => (
      <div className="text-sm text-slate-500">Dr. {row.original.doctor?.user?.lastName}</div>
    )},
    { header: 'Date', accessorKey: 'createdAt', cell: ({ row }) => (
      <div className="text-sm text-slate-500">{format(new Date(row.original.createdAt), 'dd MMM yyyy')}</div>
    )},
    { header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { header: 'Actions', cell: ({ row }) => (
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" icon={FileText} onClick={() => navigate(`/lab/orders/${row.original.id}`)}>
          View
        </Button>
        {row.original.status === 'PENDING' && (
          <Button variant="secondary" size="sm" icon={Upload} onClick={() => navigate(`/lab/orders/${row.original.id}/results`)}>
            Enter Results
          </Button>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Laboratory Orders" 
        description="Monitor status and results of diagnostic test orders."
        actions={
          <Button icon={Plus} onClick={() => navigate('/lab/orders/new')}>New Test Order</Button>
        }
      />

      <Card>
        <DataTable 
          columns={columns} 
          data={data?.data || []} 
          isLoading={isLoading} 
          pagination={{ page, totalPages: data?.pagination?.totalPages || 1 }}
          onPageChange={setPage}
          onRowClick={(row) => navigate(`/lab/orders/${row.id}`)}
          emptyStateTitle="No lab orders"
          emptyStateDescription="Diagnostic test orders will appear here once requested by doctors."
        />
      </Card>
    </div>
  );
};
