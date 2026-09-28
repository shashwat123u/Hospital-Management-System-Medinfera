import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ambulanceService } from '../../services/ambulanceService';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/shared/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { StatsCard } from '../../components/shared/StatsCard';
import { Button } from '../../components/ui/Button';

export const DriverDashboard = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['ambulance', 'dispatches', 'active', page],
    queryFn: async () => {
      const response = await ambulanceService.getDispatches({ active: 'true', page, limit: 10 });
      return { rows: response.data.data, pagination: response.data.pagination };
    },
  });

  const columns = [
    { header: 'Vehicle', cell: ({ row }) => row.original.ambulance?.vehicleNumber || '—' },
    { header: 'Patient', cell: ({ row }) => `${row.original.patient?.firstName || ''} ${row.original.patient?.lastName || ''}`.trim() || 'Unassigned' },
    { header: 'Pickup', accessorKey: 'pickupAddress' },
    { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Active Dispatches"
        description="Current ambulance assignments for this hospital."
        actions={<Link to="/ambulance/tracking"><Button icon={MapPin}>Open Tracking</Button></Link>}
      />
      <StatsCard title="Active dispatches" value={data?.pagination?.total || 0} icon={Truck} color="primary" />
      {isError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">Dispatches could not be loaded.</p>
      ) : (
        <DataTable
          columns={columns}
          data={data?.rows || []}
          isLoading={isLoading}
          pagination={data?.pagination}
          onPageChange={setPage}
          emptyStateTitle="No active dispatches"
          emptyStateDescription="New dispatch assignments will appear here."
        />
      )}
    </div>
  );
};
