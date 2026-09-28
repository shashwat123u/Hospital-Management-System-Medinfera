import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2, Users, Receipt, CalendarCheck, ShieldCheck } from 'lucide-react';
import { hospitalService } from '../../services/hospitalService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatsCard } from '../../components/shared/StatsCard';
import { DataTable } from '../../components/shared/DataTable';
import { RoleBadge } from '../../components/shared/RoleBadge';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../hooks/useAuth';

export const HospitalDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [usersPage, setUsersPage] = useState(1);
  const canViewHospital = user?.role === 'SUPER_ADMIN' || user?.hospitalId === id;

  const { data: hospital, isLoading: isHospitalLoading } = useQuery({
    queryKey: ['hospitals', id],
    queryFn: async () => {
      const res = await hospitalService.getById(id);
      return res.data.data;
    }
    , enabled: canViewHospital,
  });

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['hospitals', id, 'stats'],
    queryFn: async () => {
      const res = await hospitalService.getStats(id);
      return res.data.data;
    },
    enabled: canViewHospital,
  });

  const { data: users, isLoading: isUsersLoading } = useQuery({
    queryKey: ['hospitals', id, 'users', usersPage],
    queryFn: async () => {
      const res = await hospitalService.getUsers(id, { page: usersPage, limit: 10 });
      return res.data;
    },
    enabled: canViewHospital,
  });

  const userColumns = [
    { header: 'Name', cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}` },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Role', cell: ({ row }) => <RoleBadge role={row.original.role} /> },
    { header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
  ];

  if (!canViewHospital) return <EmptyState title="Access denied" description="You can only view your own hospital." />;

  if (isHospitalLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Hospitals', path: '/hospitals' },
    { label: hospital?.name || 'Hospital Detail' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title={hospital?.name} 
        description={`Manage details and users for ${hospital?.name}`} 
        breadcrumbs={breadcrumbs}
        actions={
          <StatusBadge status={hospital?.isActive ? 'ACTIVE' : 'INACTIVE'} className="text-sm px-4 py-1.5" />
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Users" 
          value={stats?.users || 0} 
          icon={Users} 
          color="blue"
        />
        <StatsCard 
          title="Total Patients" 
          value={stats?.patients || 0} 
          icon={ShieldCheck}
          color="indigo"
        />
        <StatsCard 
          title="Appointments" 
          value={stats?.appointments || 0} 
          icon={CalendarCheck} 
          color="emerald"
        />
        <StatsCard 
          title="Active Admissions" 
          value={stats?.activeAdmissions || 0}
          icon={Receipt} 
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary-600" />
            Hospital Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email</label>
              <p className="text-slate-900">{hospital?.email}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Phone</label>
              <p className="text-slate-900">{hospital?.phone || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Address</label>
              <p className="text-slate-900">{hospital?.address || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Plan Type</label>
              <p className="text-slate-900 font-semibold text-primary-600">{hospital?.subscriptionPlan}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Revenue Collected</label>
              <p className="text-slate-900 font-semibold">₹{Number(stats?.revenue?.collected || 0).toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-600" />
              Staff Members
            </h3>
            <DataTable 
              columns={userColumns} 
              data={users?.data || []}
              isLoading={isUsersLoading} 
              pagination={users?.pagination}
              onPageChange={setUsersPage}
              emptyStateTitle="No users found"
              emptyStateDescription="This hospital doesn't have any registered users yet."
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

