import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { patientService } from '../../services/patientService';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/shared/DataTable';
import { SearchBar } from '../../components/shared/SearchBar';
import { Button } from '../../components/ui/Button';

export const PatientListPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['patients', { search, page }],
    queryFn: async () => {
      const res = await patientService.getAll({ search, page, limit: 10 });
      return res.data;
    }
  });

  const columns = [
    { header: 'Patient ID', accessorKey: 'id', cell: ({ row }) => <span className="text-xs font-mono">{row.original.id.slice(0, 8)}</span> },
    { 
      header: 'Name', 
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900">{row.original.firstName} {row.original.lastName}</span>
          <span className="text-xs text-slate-500">{row.original.gender}, {row.original.bloodGroup?.replace('_', ' ') || 'UNKNOWN'}</span>
        </div>
      )
    },
    { header: 'City', accessorKey: 'city', cell: ({ row }) => row.original.city || '-' },
    { header: 'Phone', accessorKey: 'phone' },
    { 
      header: 'Condition', 
      cell: ({ row }) => row.original.chronicConditions?.length > 0 ? (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
          Chronic
        </span>
      ) : (
        <span className="text-slate-400 text-xs">Normal</span>
      )
    },
  ];

  const { user } = useAuth();
  const canRegister = ['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE'].includes(user?.role);

  const actions = canRegister ? (
    <Button icon={UserPlus} onClick={() => navigate('/patients/register')}>
      Register Patient
    </Button>
  ) : null;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Patients" 
        description="Manage hospital patients, medical records, and insurance." 
        actions={actions}
      />

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="w-full sm:w-96">
          <SearchBar onSearch={(value) => { setSearch(value); setPage(1); }} placeholder="Search patients by name or ID..." />
        </div>
      </div>

      {isError ? <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">Patients could not be loaded.</p> : <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        pagination={{ page, totalPages: data?.pagination?.totalPages || 1 }}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/patients/${row.id}`)}
        emptyStateTitle="No patients found"
        emptyStateDescription={search ? "No patients match your search criteria." : "No patients have been registered yet."}
      />}
    </div>
  );
};
