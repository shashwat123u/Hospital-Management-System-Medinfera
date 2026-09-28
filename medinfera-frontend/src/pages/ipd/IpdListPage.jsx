import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ipdService } from '../../services/ipdService';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/shared/DataTable';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { useAuth } from '../../hooks/useAuth';

export const IpdListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['ipd', { page }],
    queryFn: async () => {
      const res = await ipdService.getAll({ page, limit: 10 });
      return res.data;
    }
  });

  const columns = [
    { header: 'Admission #', accessorKey: 'admissionNumber' },
    { header: 'Patient', cell: ({ row }) => `${row.original.patient?.firstName || ''} ${row.original.patient?.lastName || ''}`.trim() },
    { header: 'Ward / Bed', cell: ({ row }) => `${row.original.ward?.name || '—'} / ${row.original.bed?.bedNumber || '—'}` },
    { header: 'Admission Date', accessorKey: 'admissionDate', cell: ({ row }) => row.original.admissionDate ? new Date(row.original.admissionDate).toLocaleDateString() : '—' },
    { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="In-Patient Department (IPD)" 
        description="Manage admitted patients."
        actions={['ADMIN', 'RECEPTIONIST', 'DOCTOR'].includes(user?.role) ? <Button onClick={() => navigate('/ipd/admit')}>Admit Patient</Button> : null}
      />
      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        pagination={data?.pagination}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/ipd/${row.id}`)}
      />
    </div>
  );
};
