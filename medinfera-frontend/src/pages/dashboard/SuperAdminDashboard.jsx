import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, Users, IndianRupee } from 'lucide-react';
import { hospitalService } from '../../services/hospitalService';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatsCard } from '../../components/shared/StatsCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/shared/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Link } from 'react-router-dom';

import { dashboardService } from '../../services/dashboardService';

export const SuperAdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      const res = await dashboardService.getSummary();
      return res.data?.data || {};
    }
  });

  const { data: hospitals = [], isLoading: isHospitalsLoading, isError: isHospitalsError } = useQuery({
    queryKey: ['hospitals', 'recent'],
    queryFn: async () => {
      const response = await hospitalService.getAll({ page: 1, limit: 5 });
      return response.data.data;
    },
  });

  const hospitalColumns = [
    { header: 'Hospital', accessorKey: 'name' },
    { header: 'City', accessorKey: 'city' },
    { header: 'Plan', accessorKey: 'subscriptionPlan' },
    { header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
  ];

  if (isLoading) return <Skeleton className="w-full h-96" />;
  if (!stats) return <div className="p-6 text-center text-slate-500">Failed to load dashboard statistics.</div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Super Admin Overview" description="Manage platform wide statistics and hospitals." />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          title="Total Hospitals" 
          value={stats.totalHospitals || 0} 
          icon={Building2} 
          color="primary" 
        />
        <StatsCard 
          title="Total Users" 
          value={(stats.totalUsers || 0).toLocaleString()} 
          icon={Users} 
          color="info" 
        />
        <StatsCard 
          title="Total Revenue (Platform)" 
          value={`₹${(Number(stats.totalRevenue || 0) / 100000).toFixed(1)}L`} 
          icon={IndianRupee} 
          color="success" 
        />
      </div>

      <Card>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="font-semibold text-slate-900">Recently added hospitals</h2>
          <Link to="/hospitals" className="text-sm font-medium text-primary-700 hover:text-primary-800">View all</Link>
        </div>
        {isHospitalsError ? <p className="px-6 py-4 text-sm text-red-600">Hospitals could not be loaded.</p> : <DataTable columns={hospitalColumns} data={hospitals} isLoading={isHospitalsLoading} emptyStateTitle="No hospitals found" emptyStateDescription="Hospitals will appear here when they are registered." />}
      </Card>
    </div>
  );
};
