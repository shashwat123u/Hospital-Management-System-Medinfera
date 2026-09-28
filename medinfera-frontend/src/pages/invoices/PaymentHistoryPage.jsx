import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard } from 'lucide-react';
import { invoiceService } from '../../services/invoiceService';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/shared/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { format } from 'date-fns';

export const PaymentHistoryPage = () => {
  const [page, setPage] = useState(1);
  const [paymentMode, setPaymentMode] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['payments', 'history', page, paymentMode],
    queryFn: async () => {
      const res = await invoiceService.getPayments({ page, limit: 10, ...(paymentMode && { paymentMode }) });
      return { rows: res.data.data, pagination: res.data.pagination };
    }
  });

  const columns = [
    { header: 'Transaction ID', accessorKey: 'transactionId', cell: ({ row }) => (
      <span className="font-mono text-xs text-slate-500">{row.original.id.slice(-12).toUpperCase()}</span>
    )},
    { header: 'Patient', cell: ({ row }) => (
      <div className="font-semibold text-slate-900">
        {row.original.patient?.firstName} {row.original.patient?.lastName}
      </div>
    )},
    { header: 'Amount', accessorKey: 'amount', cell: ({ row }) => (
      <div className="font-bold text-emerald-600">₹{Number(row.original.amount).toLocaleString()}</div>
    )},
    { header: 'Method', accessorKey: 'paymentMode', cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-sm text-slate-600">{row.original.paymentMode}</span>
      </div>
    )},
    { header: 'Date & Time', accessorKey: 'createdAt', cell: ({ row }) => (
      <div className="text-sm text-slate-500">{format(new Date(row.original.createdAt), 'dd MMM yyyy, hh:mm a')}</div>
    )},
    { header: 'Reference', accessorKey: 'transactionReference', cell: ({ row }) => row.original.transactionReference || '—' },
    { header: 'Invoice', accessorKey: 'invoice.invoiceNumber', cell: ({ row }) => row.original.invoice?.invoiceNumber || '—' },
    { header: 'Status', cell: ({ row }) => <Badge variant={row.original.status === 'SUCCESS' ? 'success' : 'slate'}>{row.original.status}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Payment History" 
        description="Audit trail of all financial transactions and patient payments."
      />

      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <Select className="w-48" value={paymentMode} onChange={(event) => { setPage(1); setPaymentMode(event.target.value); }}>
            <option value="">All Methods</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
            <option value="CASH">Cash</option>
            <option value="NETBANKING">Net Banking</option>
            <option value="CHEQUE">Cheque</option>
          </Select>
        </div>
      </Card>

      <Card>
        {isError && <p className="px-6 py-4 text-sm text-red-600">Payment history could not be loaded.</p>}
        <DataTable 
          columns={columns} 
          data={data?.rows || []} 
          isLoading={isLoading} 
          pagination={data?.pagination}
          onPageChange={setPage}
          emptyStateTitle="No payments found"
          emptyStateDescription="Completed transactions will be listed here."
        />
      </Card>
    </div>
  );
};
