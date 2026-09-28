import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { hospitalService } from '../../services/hospitalService';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/shared/DataTable';
import { Button } from '../../components/ui/Button';

export const HospitalListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['hospitals', { page }],
    queryFn: async () => {
      const res = await hospitalService.getAll({ page, limit: 10 });
      return res.data;
    }
  });

  const columns = [
    { header: 'Code', accessorKey: 'code' },
    { header: 'Name', accessorKey: 'name' },
    { header: 'City', accessorKey: 'city' },
    { header: 'Phone', accessorKey: 'phone' },
    { header: 'Plan', accessorKey: 'subscriptionPlan' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Hospitals" 
        description="Manage registered hospitals." 
        actions={<Button onClick={() => navigate('/hospitals/new')}>+ Add Hospital</Button>}
      />
      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        pagination={data?.pagination}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/hospitals/${row.id}`)}
      />
    </div>
  );
};
