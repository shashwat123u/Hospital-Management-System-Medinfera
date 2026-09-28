import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/shared/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { RoleBadge } from '../../components/shared/RoleBadge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const UserListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [role, setRole] = useState('ALL');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['users', { page, role, search }],
    queryFn: async () => {
      const params = { page, limit: 10 };
      if (role !== 'ALL') params.role = role;
      if (search) params.search = search;
      const res = await userService.getAll(params);
      return res.data;
    }
  });

  const columns = [
    { header: 'Emp Code', accessorKey: 'employeeCode', cell: ({ row }) => row.original.employeeCode || '-' },
    { header: 'Name', cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}` },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Department', accessorKey: 'department', cell: ({ row }) => row.original.department || '-' },
    { header: 'Role', cell: ({ row }) => <RoleBadge role={row.original.role} /> },
    { header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
  ];

  const { user } = useAuth();
  const canAddUser = ['ADMIN', 'SUPER_ADMIN'].includes(user?.role);

  const roles = [
    'ALL', ...(user?.role === 'SUPER_ADMIN' ? ['SUPER_ADMIN'] : []), 'ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST',
    'LAB_TECHNICIAN', 'PHARMACIST', 'BILLING', 'PATIENT', 'STAFF', 'DRIVER'
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Users & Staff" 
        description="Manage hospital personnel, doctors, and system access." 
        actions={canAddUser ? <Button icon={UserPlus} onClick={() => navigate('/users/new')}>Add User</Button> : null}
      />

      <Input aria-label="Search users" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search name, email, or employee code" />

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {roles.map((r) => (
          <button
            key={r}
            onClick={() => { setRole(r); setPage(1); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              role === r 
                ? 'bg-primary-600 text-white shadow-sm' 
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {r === 'ALL' ? 'All Personnel' : r.replace('_', ' ')}
          </button>
        ))}
      </div>

      {isError ? <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">Users could not be loaded.</p> : <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        pagination={{ page, totalPages: data?.pagination?.totalPages || 1 }}
        onPageChange={setPage}
      />}
    </div>
  );
};
