import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { payoutService } from '../../services/payoutService';
import { userService } from '../../services/userService';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/shared/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Modal } from '../../components/ui/Modal';

export const PayoutsPage = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [payId, setPayId] = useState('');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [form, setForm] = useState({ userId: '', type: 'SALARY', amount: '', paymentMode: 'CASH', referenceNumber: '', notes: '' });
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['payouts', { page, status }],
    queryFn: async () => {
      const res = await payoutService.getPayouts({ page, limit: 10, ...(status && { status }) });
      return res.data;
    }
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users', 'payout-form'],
    queryFn: async () => (await userService.getAll({ page: 1, limit: 100 })).data.data,
    enabled: createOpen,
  });

  const createMutation = useMutation({
    mutationFn: () => payoutService.createPayout({ ...form, amount: Number(form.amount) }),
    onSuccess: () => {
      toast.success('Payout created');
      setCreateOpen(false);
      setForm({ userId: '', type: 'SALARY', amount: '', paymentMode: 'CASH', referenceNumber: '', notes: '' });
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not create payout'),
  });

  const payMutation = useMutation({
    mutationFn: () => payoutService.markPayoutPaid(payId, { paymentMode, referenceNumber }),
    onSuccess: () => {
      toast.success('Payout marked as paid');
      setPayId('');
      setReferenceNumber('');
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not mark payout as paid'),
  });

  const usersById = new Map(users.map(user => [user.id, user]));

  const columns = [
    { header: 'Reference #', accessorKey: 'referenceNumber', cell: ({ row }) => (
      <span className="font-mono text-xs text-slate-500">{row.original.referenceNumber || row.original.id.slice(-12).toUpperCase()}</span>
    )},
    { header: 'Employee', cell: ({ row }) => (
      <div className="font-semibold text-slate-900">
        {usersById.get(row.original.userId)?.firstName || 'Staff'} {usersById.get(row.original.userId)?.lastName || row.original.userId.slice(-6)}
      </div>
    )},
    { header: 'Amount', accessorKey: 'amount', cell: ({ row }) => (
      <div className="font-bold text-slate-900">₹{Number(row.original.amount).toLocaleString()}</div>
    )},
    { header: 'Method', accessorKey: 'paymentMode', cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-sm text-slate-600">{row.original.paymentMode || '—'}</span>
      </div>
    )},
    { header: 'Created', accessorKey: 'createdAt', cell: ({ row }) => (
      <div className="text-sm text-slate-500">{new Date(row.original.createdAt).toLocaleDateString()}</div>
    )},
    { header: 'Status', cell: ({ row }) => <Badge variant={row.original.status === 'PAID' ? 'success' : row.original.status === 'CANCELLED' ? 'slate' : 'warning'}>{row.original.status}</Badge> },
    { header: 'Actions', cell: ({ row }) => (
      !['PAID', 'CANCELLED'].includes(row.original.status) && <Button variant="secondary" size="sm" onClick={() => setPayId(row.original.id)}>Mark paid</Button>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Payout Transactions" 
        description="Complete history of staff salary disbursements and payments."
        actions={<Button icon={Plus} onClick={() => setCreateOpen(true)}>Create payout</Button>}
      />

      <Select aria-label="Filter payouts by status" className="w-56" value={status} onChange={(event) => { setPage(1); setStatus(event.target.value); }}>
        <option value="">All statuses</option>
        {['PENDING', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED'].map(value => <option key={value} value={value}>{value}</option>)}
      </Select>

      <Card>
        {isError ? <p className="p-6 text-sm text-red-600">Payouts could not be loaded.</p> : <DataTable
          columns={columns} 
          data={data?.data || []}
          isLoading={isLoading} 
          pagination={data?.pagination}
          onPageChange={setPage}
          emptyStateTitle="No payouts found"
          emptyStateDescription="Salary disbursement history will appear here."
        />}
      </Card>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create payout">
        <form onSubmit={(event) => { event.preventDefault(); createMutation.mutate(); }} className="space-y-4">
          <Select label="Staff member" value={form.userId} onChange={(event) => setForm(current => ({ ...current, userId: event.target.value }))} required>
            <option value="">Select staff member</option>
            {users.map(user => <option key={user.id} value={user.id}>{user.firstName} {user.lastName} · {user.role}</option>)}
          </Select>
          <Select label="Payout type" value={form.type} onChange={(event) => setForm(current => ({ ...current, type: event.target.value }))}>
            {['SALARY', 'ADVANCE', 'REIMBURSEMENT', 'BONUS', 'INCENTIVE', 'DEDUCTION'].map(value => <option key={value} value={value}>{value}</option>)}
          </Select>
          <Input label="Amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={(event) => setForm(current => ({ ...current, amount: event.target.value }))} required />
          <Select label="Payment mode" value={form.paymentMode} onChange={(event) => setForm(current => ({ ...current, paymentMode: event.target.value }))}>
            {['CASH', 'CARD', 'UPI', 'NETBANKING', 'CHEQUE'].map(value => <option key={value} value={value}>{value}</option>)}
          </Select>
          <Input label="Reference number" value={form.referenceNumber} onChange={(event) => setForm(current => ({ ...current, referenceNumber: event.target.value }))} />
          <Textarea label="Notes" value={form.notes} onChange={(event) => setForm(current => ({ ...current, notes: event.target.value }))} rows={2} />
          <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button><Button type="submit" isLoading={createMutation.isPending} disabled={!form.userId || !form.amount}>Create payout</Button></div>
        </form>
      </Modal>

      <Modal isOpen={Boolean(payId)} onClose={() => setPayId('')} title="Mark payout as paid">
        <form onSubmit={(event) => { event.preventDefault(); payMutation.mutate(); }} className="space-y-4">
          <Select label="Payment mode" value={paymentMode} onChange={(event) => setPaymentMode(event.target.value)}>
            {['CASH', 'CARD', 'UPI', 'NETBANKING', 'CHEQUE'].map(value => <option key={value} value={value}>{value}</option>)}
          </Select>
          <Input label="Reference number" value={referenceNumber} onChange={(event) => setReferenceNumber(event.target.value)} />
          <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setPayId('')}>Cancel</Button><Button type="submit" isLoading={payMutation.isPending}>Confirm payment</Button></div>
        </form>
      </Modal>
    </div>
  );
};
