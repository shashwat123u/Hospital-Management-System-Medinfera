import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Hotel, Users, CheckCircle2, AlertTriangle, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { bedService } from '../../services/bedService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/shared/DataTable';
import { StatsCard } from '../../components/shared/StatsCard';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { useAuth } from '../../hooks/useAuth';

export const WardListPage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: '', wardType: 'GENERAL', floor: '', description: '' });
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['beds', 'stats'],
    queryFn: async () => {
      const res = await bedService.getStats();
      return res.data.data;
    }
  });
  const wards = stats?.byWard || [];
  const totals = stats?.totals || {};
  const maintenance = wards.reduce((sum, ward) => sum + ward.maintenance, 0);
  const canManageWards = ['SUPER_ADMIN', 'ADMIN'].includes(user?.role);

  const createMutation = useMutation({
    mutationFn: () => bedService.createWard(form),
    onSuccess: () => {
      toast.success('Ward created');
      setCreateOpen(false);
      setForm({ name: '', wardType: 'GENERAL', floor: '', description: '' });
      queryClient.invalidateQueries({ queryKey: ['beds', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['wards'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not create ward'),
  });

  const columns = [
    { header: 'Ward Name', accessorKey: 'wardName', cell: ({ row }) => (
      <div className="font-semibold text-slate-900">{row.original.wardName}</div>
    )},
    { header: 'Type', accessorKey: 'wardType' },
    { header: 'Floor', accessorKey: 'floor' },
    { header: 'Total Beds', accessorKey: 'totalBeds' },
    { header: 'Occupied', accessorKey: 'occupied', cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500" style={{ width: `${row.original.occupancyRate}%` }}></div>
        </div>
        <span className="text-xs font-medium text-slate-600">{row.original.occupied}</span>
      </div>
    )},
    { header: 'Available', accessorKey: 'available', cell: ({ row }) => (
      <span className="text-emerald-600 font-semibold">{row.original.available}</span>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Wards & Units" 
        description="Monitor ward occupancy and bed availability across the hospital." 
        actions={canManageWards ? <Button icon={Plus} onClick={() => setCreateOpen(true)}>Add Ward</Button> : null}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Beds" 
          value={totals.totalBeds || 0} 
          icon={Hotel} 
          color="blue"
        />
        <StatsCard 
          title="Occupied" 
          value={totals.occupied || 0} 
          icon={Users} 
          color="indigo"
        />
        <StatsCard 
          title="Available" 
          value={totals.available || 0} 
          icon={CheckCircle2} 
          color="emerald"
        />
        <StatsCard 
          title="Maintenance" 
          value={maintenance}
          icon={AlertTriangle} 
          color="amber"
        />
      </div>

      {isError ? <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">Ward statistics could not be loaded.</p> : <Card>
        <DataTable 
          columns={columns} 
          data={wards}
          isLoading={isLoading} 
          emptyStateTitle="No wards found"
          emptyStateDescription="There are no wards configured in the system."
        />
      </Card>}

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create ward">
        <form onSubmit={(event) => { event.preventDefault(); createMutation.mutate(); }} className="space-y-4">
          <Input label="Ward name" value={form.name} onChange={(event) => setForm(current => ({ ...current, name: event.target.value }))} required />
          <Select label="Ward type" value={form.wardType} onChange={(event) => setForm(current => ({ ...current, wardType: event.target.value }))}>
            {['GENERAL', 'SURGICAL', 'PEDIATRIC', 'MATERNITY', 'ORTHOPEDIC', 'CARDIAC', 'NEUROLOGY', 'ONCOLOGY', 'ICU', 'EMERGENCY', 'OTHER'].map(value => <option key={value} value={value}>{value}</option>)}
          </Select>
          <Input label="Floor" value={form.floor} onChange={(event) => setForm(current => ({ ...current, floor: event.target.value }))} />
          <Textarea label="Description" value={form.description} onChange={(event) => setForm(current => ({ ...current, description: event.target.value }))} rows={2} />
          <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button><Button type="submit" isLoading={createMutation.isPending} disabled={!form.name.trim()}>Create ward</Button></div>
        </form>
      </Modal>
    </div>
  );
};
