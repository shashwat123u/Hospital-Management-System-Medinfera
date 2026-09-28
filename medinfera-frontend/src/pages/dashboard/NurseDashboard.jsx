import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BedDouble, Activity, Users } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatsCard } from '../../components/shared/StatsCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { DataTable } from '../../components/shared/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';

import { dashboardService } from '../../services/dashboardService';
import { ipdService } from '../../services/ipdService';

export const NurseDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      const res = await dashboardService.getSummary();
      return res.data?.data || {};
    }
  });

  const { data: admissions = [], isLoading: isAdmissionsLoading, isError: isAdmissionsError } = useQuery({
    queryKey: ['ipd', 'active', 'nurse-dashboard'],
    queryFn: async () => {
      const res = await ipdService.getAll({ active: 'true', page: 1, limit: 10 });
      return res.data.data;
    },
  });

  const columns = [
    { header: 'Admission', accessorKey: 'admissionNumber' },
    { header: 'Patient', cell: ({ row }) => `${row.original.patient?.firstName || ''} ${row.original.patient?.lastName || ''}`.trim() },
    { header: 'Ward / Bed', cell: ({ row }) => `${row.original.ward?.name || '—'} / ${row.original.bed?.bedNumber || '—'}` },
    { header: 'Attending Doctor', cell: ({ row }) => `Dr. ${row.original.primaryDoctor?.user?.firstName || ''} ${row.original.primaryDoctor?.user?.lastName || ''}`.trim() },
    { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Nurse Dashboard" description="Manage your assigned ward and patients." />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Active Admissions" value={stats?.activeAdmissions || 0} icon={BedDouble} color="primary" />
        <StatsCard title="Vitals Pending" value={stats?.vitalsPending || 0} icon={Activity} color="warning" />
        <StatsCard title="Lab Collections" value={stats?.todayLabCollections || 0} icon={Users} color="danger" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Patients</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isAdmissionsError ? <p className="p-6 text-sm text-red-600">Active admissions could not be loaded.</p> : <DataTable columns={columns} data={admissions} isLoading={isLoading || isAdmissionsLoading} emptyStateTitle="No active admissions" emptyStateDescription="Active admissions will appear here." />}
        </CardContent>
      </Card>
    </div>
  );
};
