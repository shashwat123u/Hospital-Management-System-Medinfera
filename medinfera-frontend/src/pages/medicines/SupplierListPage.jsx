import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Phone, Mail, MapPin, Plus, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supplierService } from '../../services/medicineService';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/shared/DataTable';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Textarea';
import { StatusBadge } from '../../components/shared/StatusBadge';

export const SupplierListPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [supplier, setSupplier] = useState({ name: '', contactPerson: '', phone: '', email: '', address: '', city: '' });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers', { page, search }],
    queryFn: async () => {
      const res = await supplierService.getAll({ page, limit: 10, ...(search && { search }) });
      return res.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: () => supplierService.create(supplier),
    onSuccess: () => {
      toast.success('Supplier added');
      setCreateOpen(false);
      setSupplier({ name: '', contactPerson: '', phone: '', email: '', address: '', city: '' });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not add supplier'),
  });

  const columns = [
    { header: 'Supplier Name', accessorKey: 'name', cell: ({ row }) => (
      <div className="font-semibold text-slate-900">{row.original.name}</div>
    )},
    { header: 'Contact Person', accessorKey: 'contactPerson' },
    { header: 'Contact Details', cell: ({ row }) => (
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Phone className="w-3 h-3" />
          {row.original.phone}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Mail className="w-3 h-3" />
          {row.original.email}
        </div>
      </div>
    )},
    { header: 'Address', accessorKey: 'address', cell: ({ row }) => (
      <div className="flex items-start gap-1.5 text-xs text-slate-500 max-w-[200px] truncate">
        <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
        {[row.original.address, row.original.city].filter(Boolean).join(', ') || '—'}
      </div>
    )},
    { header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Medicine Suppliers" 
        description="Manage vendor relationships and contact information."
        actions={
          <Button icon={Plus} onClick={() => setCreateOpen(true)}>Add Supplier</Button>
        }
      />

      <Card className="p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search suppliers" className="w-full rounded-xl border border-slate-200 py-2 pl-10 pr-3 text-sm" />
        </div>
      </Card>
      <Card>
        <DataTable 
          columns={columns} 
          data={data?.data || []}
          isLoading={isLoading} 
          pagination={data?.pagination}
          onPageChange={setPage}
          emptyStateTitle="No suppliers found"
          emptyStateDescription="Manage your pharmacy vendors here."
        />
      </Card>

      <Modal isOpen={isCreateOpen} onClose={() => setCreateOpen(false)} title="Add supplier">
        <form onSubmit={(event) => { event.preventDefault(); createMutation.mutate(); }} className="space-y-4">
          <Input label="Supplier name" value={supplier.name} onChange={(event) => setSupplier(current => ({ ...current, name: event.target.value }))} required />
          <Input label="Contact person" value={supplier.contactPerson} onChange={(event) => setSupplier(current => ({ ...current, contactPerson: event.target.value }))} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Phone" value={supplier.phone} onChange={(event) => setSupplier(current => ({ ...current, phone: event.target.value }))} />
            <Input label="Email" type="email" value={supplier.email} onChange={(event) => setSupplier(current => ({ ...current, email: event.target.value }))} />
          </div>
          <Input label="City" value={supplier.city} onChange={(event) => setSupplier(current => ({ ...current, city: event.target.value }))} />
          <Textarea label="Address" value={supplier.address} onChange={(event) => setSupplier(current => ({ ...current, address: event.target.value }))} rows={2} />
          <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button><Button type="submit" isLoading={createMutation.isPending} disabled={!supplier.name.trim()}>Save supplier</Button></div>
        </form>
      </Modal>
    </div>
  );
};
