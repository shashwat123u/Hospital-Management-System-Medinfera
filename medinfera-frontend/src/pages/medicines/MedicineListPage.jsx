import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { medicineService } from '../../services/medicineService';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/shared/DataTable';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useAuth } from '../../hooks/useAuth';

export const MedicineListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const { user } = useAuth();
  const canCreate = ['SUPER_ADMIN', 'ADMIN', 'PHARMACIST'].includes(user?.role);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['medicines', { page, search, category }],
    queryFn: async () => {
      const res = await medicineService.getAll({ page, limit: 10, ...(search && { search }), ...(category && { category }) });
      return res.data;
    }
  });

  const columns = [
    { header: 'ID', accessorKey: 'id', cell: ({ row }) => <span className="text-xs font-mono">{row.original.id.slice(-6)}</span> },
    { header: 'Name', accessorKey: 'name' },
    { header: 'Generic Name', accessorKey: 'genericName' },
    { header: 'Category', accessorKey: 'category' },
    { header: 'Stock', accessorKey: 'currentStock', cell: ({ row }) => (
      <span className={row.original.currentStock <= row.original.reorderLevel ? 'text-red-600 font-bold' : ''}>
        {row.original.currentStock} {row.original.unitOfMeasure}
      </span>
    )},
    { header: 'Price', accessorKey: 'sellingPrice', cell: ({ row }) => `₹${row.original.sellingPrice}` },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Medicines Inventory" 
        description="Manage pharmacy medicines and stock levels." 
        actions={canCreate ? <Button icon={Plus} onClick={() => navigate('/medicines/new')}>Add Medicine</Button> : null}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input aria-label="Search medicines" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search name, generic name, or manufacturer" />
        <Select aria-label="Filter by medicine category" value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }}>
          <option value="">All categories</option>
          {['TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'DROPS', 'CREAM', 'OINTMENT', 'INHALER', 'POWDER', 'PATCH', 'SUPPOSITORY', 'OTHER'].map(value => <option key={value} value={value}>{value}</option>)}
        </Select>
      </div>
      {isError ? <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">Medicines could not be loaded.</p> : <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        pagination={data?.pagination}
        onPageChange={setPage}
        emptyStateTitle="No medicines found"
        emptyStateDescription="Your pharmacy inventory is currently empty. Add medicines to get started."
      />}
    </div>
  );
};
