import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Microscope, Plus, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { labService } from '../../services/labService';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/shared/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';

export const TestCatalogPage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [testForm, setTestForm] = useState({ name: '', code: '', category: '', sampleType: '', price: '', turnaroundHours: '24' });
  const canCreate = ['SUPER_ADMIN', 'ADMIN'].includes(user?.role);

  const { data: tests = [], isLoading, isError } = useQuery({
    queryKey: ['lab-tests', { search }],
    queryFn: async () => {
      const res = await labService.getTests({ search });
      return res.data.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: () => labService.createTest({
      ...testForm,
      price: Number(testForm.price),
      turnaroundHours: Number(testForm.turnaroundHours),
    }),
    onSuccess: () => {
      toast.success('Lab test added');
      setCreateOpen(false);
      setTestForm({ name: '', code: '', category: '', sampleType: '', price: '', turnaroundHours: '24' });
      queryClient.invalidateQueries({ queryKey: ['lab-tests'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not add lab test'),
  });

  const columns = [
    { header: 'Test Code', accessorKey: 'code', cell: ({ row }) => (
      <span className="font-mono text-xs font-bold text-slate-500">{row.original.code}</span>
    )},
    { header: 'Test Name', accessorKey: 'name', cell: ({ row }) => (
      <div className="font-semibold text-slate-900">{row.original.name}</div>
    )},
    { header: 'Category', accessorKey: 'category', cell: ({ row }) => (
      <Badge variant="info">{row.original.category || '—'}</Badge>
    )},
    { header: 'Sample Type', accessorKey: 'sampleType' },
    { header: 'Base Price', accessorKey: 'price', cell: ({ row }) => (
      <div className="font-semibold text-slate-900">₹{row.original.price.toLocaleString()}</div>
    )},
    { header: 'TAT', accessorKey: 'turnaroundHours', cell: ({ row }) => (
      <div className="text-sm text-slate-500">{row.original.turnaroundHours} hrs</div>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Diagnostic Test Catalog" 
        description="Comprehensive list of laboratory tests and diagnostic services."
        actions={canCreate ? <Button icon={Plus} onClick={() => setCreateOpen(true)}>Add New Test</Button> : null}
      />

      <Card className="p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by test name or code..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      {isError ? <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">The test catalog could not be loaded.</p> : <Card>
        <DataTable 
          columns={columns} 
          data={tests}
          isLoading={isLoading} 
          emptyStateTitle="No tests found"
          emptyStateDescription="The diagnostic test catalog is currently empty."
        />
      </Card>}

      <Modal isOpen={isCreateOpen} onClose={() => setCreateOpen(false)} title="Add lab test">
        <form onSubmit={(event) => { event.preventDefault(); createMutation.mutate(); }} className="space-y-4">
          <Input label="Test name" value={testForm.name} onChange={(event) => setTestForm(current => ({ ...current, name: event.target.value }))} required />
          <Input label="Code" value={testForm.code} onChange={(event) => setTestForm(current => ({ ...current, code: event.target.value }))} />
          <Input label="Category" value={testForm.category} onChange={(event) => setTestForm(current => ({ ...current, category: event.target.value }))} />
          <Input label="Sample type" value={testForm.sampleType} onChange={(event) => setTestForm(current => ({ ...current, sampleType: event.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price" type="number" min="0" step="0.01" value={testForm.price} onChange={(event) => setTestForm(current => ({ ...current, price: event.target.value }))} required />
            <Input label="Turnaround (hours)" type="number" min="1" value={testForm.turnaroundHours} onChange={(event) => setTestForm(current => ({ ...current, turnaroundHours: event.target.value }))} required />
          </div>
          <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button><Button type="submit" isLoading={createMutation.isPending} disabled={!testForm.name.trim() || testForm.price === ''}>Save test</Button></div>
        </form>
      </Modal>
    </div>
  );
};
