import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/shared/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { SearchBar } from '../../components/shared/SearchBar';

export const DoctorListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const canAddDoctor = ['SUPER_ADMIN', 'ADMIN'].includes(user?.role);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['doctors', { page, search }],
    queryFn: async () => {
      const res = await doctorService.getAll({ page, limit: 10, ...(search && { search }) });
      return res.data;
    }
  });

  const columns = [
    { header: 'ID', accessorKey: 'id', cell: ({ row }) => <span className="text-xs font-mono">{row.original.id.slice(0, 8)}</span> },
    { header: 'Name', cell: ({ row }) => `${row.original.user?.firstName || ''} ${row.original.user?.lastName || ''}`.trim() },
    { header: 'Specialization', accessorKey: 'specialization' },
    { header: 'Qualification', accessorKey: 'qualification', cell: ({ row }) => row.original.qualification || '-' },
    { header: 'Exp (Years)', accessorKey: 'experienceYears', cell: ({ row }) => row.original.experienceYears || '0' },
    { header: 'Fee (₹)', accessorKey: 'consultationFee', cell: ({ row }) => row.original.consultationFee ? `₹${row.original.consultationFee}` : '-' },
    { header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Doctors" 
        description="Manage hospital doctors and professional fee structures."
        actions={canAddDoctor ? (
          <Button onClick={() => navigate('/doctors/register')}>+ Add Doctor</Button>
        ) : null}
      />
      <SearchBar onSearch={(value) => { setSearch(value); setPage(1); }} placeholder="Search doctors by name or specialization" />
      {isError ? <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">Doctors could not be loaded.</p> : <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        pagination={{ page, totalPages: data?.pagination?.totalPages || 1 }}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/doctors/${row.id}`)}
      />}
    </div>
  );
};
