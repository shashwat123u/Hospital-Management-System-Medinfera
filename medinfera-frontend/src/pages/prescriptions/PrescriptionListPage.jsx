import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Pill, Plus, FileText, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { prescriptionService } from '../../services/prescriptionService';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/shared/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';

export const PrescriptionListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['prescriptions', { page }],
    queryFn: async () => {
      const res = await prescriptionService.getAll({ page, limit: 10 });
      return res.data;
    }
  });

  const columns = [
    { header: 'ID', accessorKey: 'id', cell: ({ row }) => (
      <span className="font-mono text-xs text-slate-500 uppercase">{row.original.id.slice(-8)}</span>
    )},
    { header: 'Patient', cell: ({ row }) => (
      <div className="font-semibold text-slate-900">
        {row.original.patient?.firstName} {row.original.patient?.lastName}
      </div>
    )},
    { header: 'Doctor', cell: ({ row }) => (
      <div className="text-sm text-slate-600">
        Dr. {row.original.doctor?.user?.firstName} {row.original.doctor?.user?.lastName}
      </div>
    )},
    { header: 'Date', accessorKey: 'createdAt', cell: ({ row }) => (
      <div className="text-sm text-slate-500">{format(new Date(row.original.createdAt), 'dd MMM yyyy')}</div>
    )},
    { header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { header: 'Actions', cell: ({ row }) => (
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" icon={FileText} onClick={() => navigate(`/prescriptions/${row.original.id}`)}>
          View
        </Button>
        {['PHARMACIST', 'ADMIN'].includes(user?.role) && ['ACTIVE', 'PARTIALLY_DISPENSED'].includes(row.original.status) && (
          <Button variant="secondary" size="sm" icon={CheckCircle2} onClick={() => navigate(`/prescriptions/${row.original.id}/dispense`)}>
            Dispense
          </Button>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Prescriptions" 
        description="View and manage patient medication prescriptions."
        actions={user?.role === 'DOCTOR' ? <Button icon={Plus} onClick={() => navigate('/prescriptions/create')}>New Prescription</Button> : null}
      />

      <Card>
        <DataTable 
          columns={columns} 
          data={data?.data || []}
          isLoading={isLoading} 
          pagination={data?.pagination}
          onPageChange={setPage}
          onRowClick={(row) => navigate(`/prescriptions/${row.id}`)}
          emptyStateTitle="No prescriptions found"
          emptyStateDescription="Prescriptions issued by doctors will appear here."
        />
      </Card>
    </div>
  );
};
