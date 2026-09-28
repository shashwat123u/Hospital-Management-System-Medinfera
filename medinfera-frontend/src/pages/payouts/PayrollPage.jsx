import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { payoutService } from '../../services/payoutService';
import { userService } from '../../services/userService';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/shared/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';

export const PayrollPage = () => {
  const [page, setPage] = useState(1);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ userId: '', basicSalary: '', allowances: '0', deductions: '0', notes: '' });
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['payroll', { page, month, year }],
    queryFn: async () => {
      const res = await payoutService.getPayroll({ page, limit: 10, month, year });
      return res.data;
    }
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users', 'payroll-form'],
    queryFn: async () => (await userService.getAll({ page: 1, limit: 100 })).data.data,
  });

  const createMutation = useMutation({
    mutationFn: () => payoutService.createPayroll({
      ...form,
      month,
      year,
      basicSalary: Number(form.basicSalary),
      allowances: Number(form.allowances || 0),
      deductions: Number(form.deductions || 0),
    }),
    onSuccess: () => {
      toast.success('Payroll record created');
      setCreateOpen(false);
      setForm({ userId: '', basicSalary: '', allowances: '0', deductions: '0', notes: '' });
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not create payroll record'),
  });

  const processMutation = useMutation({
    mutationFn: (id) => payoutService.processPayroll(id),
    onSuccess: () => {
      toast.success('Payroll processed and payout created');
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not process payroll'),
  });

  const usersById = new Map(users.map(user => [user.id, user]));

  const columns = [
    { header: 'Employee', cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 text-xs">
          {row.original.user?.firstName?.[0]}{row.original.user?.lastName?.[0]}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{usersById.get(row.original.userId)?.firstName || 'Staff'} {usersById.get(row.original.userId)?.lastName || row.original.userId?.slice(-6)}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">{usersById.get(row.original.userId)?.role || 'Employee'}</p>
        </div>
      </div>
    )},
    { header: 'Basic Salary', accessorKey: 'basicSalary', cell: ({ row }) => (
      <div className="text-sm font-medium text-slate-700">₹{Number(row.original.basicSalary || 0).toLocaleString()}</div>
    )},
    { header: 'Allowances', accessorKey: 'allowances', cell: ({ row }) => (
      <div className="text-sm text-emerald-600">+₹{Number(row.original.allowances || 0).toLocaleString()}</div>
    )},
    { header: 'Deductions', accessorKey: 'deductions', cell: ({ row }) => (
      <div className="text-sm text-red-500">-₹{Number(row.original.deductions || 0).toLocaleString()}</div>
    )},
    { header: 'Net Salary', accessorKey: 'netSalary', cell: ({ row }) => (
      <div className="font-bold text-slate-900">₹{Number(row.original.netSalary || 0).toLocaleString()}</div>
    )},
    { header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { header: 'Actions', cell: ({ row }) => (
      row.original.status === 'PENDING' && <Button variant="secondary" size="sm" onClick={() => processMutation.mutate(row.original.id)} isLoading={processMutation.isPending}>Process</Button>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Staff Payroll" 
        description="Manage employee salaries, allowances, and monthly payouts."
        actions={<Button icon={Plus} onClick={() => setCreateOpen(true)}>Create Payroll</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 flex items-center justify-center gap-6">
          <div className="text-center">
            <p className="text-xs text-slate-500 uppercase font-medium mb-1">Month</p>
            <Select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="w-32">
              <option value={1}>January</option>
              <option value={2}>February</option>
              <option value={3}>March</option>
              <option value={4}>April</option>
              <option value={5}>May</option>
              <option value={6}>June</option>
              <option value={7}>July</option>
              <option value={8}>August</option>
              <option value={9}>September</option>
              <option value={10}>October</option>
              <option value={11}>November</option>
              <option value={12}>December</option>
            </Select>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 uppercase font-medium mb-1">Year</p>
            <Select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="w-24">
              {[year - 2, year - 1, year, year + 1].map(optionYear => <option key={optionYear} value={optionYear}>{optionYear}</option>)}
            </Select>
          </div>
        </Card>
      </div>

      {isError ? <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">Payroll records could not be loaded.</p> : <Card>
        <DataTable
          columns={columns} 
          data={data?.data || []} 
          isLoading={isLoading} 
          pagination={{ page, totalPages: data?.pagination?.totalPages || 1 }}
          onPageChange={setPage}
          emptyStateTitle="No payroll records"
          emptyStateDescription="Payroll records for the selected month will appear here."
        />
      </Card>}

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title={`Create payroll · ${month}/${year}`}>
        <form onSubmit={(event) => { event.preventDefault(); createMutation.mutate(); }} className="space-y-4">
          <Select label="Staff member" value={form.userId} onChange={(event) => setForm(current => ({ ...current, userId: event.target.value }))} required>
            <option value="">Select staff member</option>
            {users.map(user => <option key={user.id} value={user.id}>{user.firstName} {user.lastName} · {user.role}</option>)}
          </Select>
          <Input label="Basic salary" type="number" min="0" step="0.01" value={form.basicSalary} onChange={(event) => setForm(current => ({ ...current, basicSalary: event.target.value }))} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Allowances" type="number" min="0" step="0.01" value={form.allowances} onChange={(event) => setForm(current => ({ ...current, allowances: event.target.value }))} />
            <Input label="Deductions" type="number" min="0" step="0.01" value={form.deductions} onChange={(event) => setForm(current => ({ ...current, deductions: event.target.value }))} />
          </div>
          <Textarea label="Notes" value={form.notes} onChange={(event) => setForm(current => ({ ...current, notes: event.target.value }))} rows={2} />
          <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button><Button type="submit" isLoading={createMutation.isPending} disabled={!form.userId || form.basicSalary === ''}>Create payroll</Button></div>
        </form>
      </Modal>
    </div>
  );
};
