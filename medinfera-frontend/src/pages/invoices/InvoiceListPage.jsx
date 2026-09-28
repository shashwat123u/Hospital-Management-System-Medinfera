import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Plus, IndianRupee, CreditCard, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { invoiceService } from '../../services/invoiceService';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/shared/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { format } from 'date-fns';
import { Select } from '../../components/ui/Select';
import { useAuth } from '../../hooks/useAuth';

export const InvoiceListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const { user } = useAuth();
  const canCreate = ['SUPER_ADMIN', 'ADMIN', 'BILLING', 'RECEPTIONIST'].includes(user?.role);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['invoices', { page, status, type }],
    queryFn: async () => {
      const res = await invoiceService.getAll({ page, limit: 10, ...(status && { status }), ...(type && { type }) });
      return res.data.data;
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['invoices', 'stats'],
    queryFn: async () => {
      const res = await invoiceService.getStatsRevenue();
      return res.data;
    }
  });

  const columns = [
    { header: 'Invoice #', accessorKey: 'invoiceNumber', cell: ({ row }) => (
      <span className="font-mono text-xs font-bold text-slate-900">{row.original.invoiceNumber}</span>
    )},
    { header: 'Patient', cell: ({ row }) => (
      <div className="font-semibold text-slate-900">
        {row.original.patient?.firstName} {row.original.patient?.lastName}
      </div>
    )},
    { header: 'Date', accessorKey: 'createdAt', cell: ({ row }) => (
      <div className="text-sm text-slate-500">{format(new Date(row.original.createdAt), 'dd MMM yyyy')}</div>
    )},
    { header: 'Total Amount', accessorKey: 'totalAmount', cell: ({ row }) => (
      <div className="font-semibold text-slate-900">₹{Number(row.original.totalAmount).toLocaleString()}</div>
    )},
    { header: 'Balance', accessorKey: 'dueAmount', cell: ({ row }) => (
      <div className={`font-semibold ${Number(row.original.dueAmount) > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
        ₹{Number(row.original.dueAmount).toLocaleString()}
      </div>
    )},
    { header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { header: 'Actions', cell: ({ row }) => (
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" icon={FileText} onClick={() => navigate(`/billing/invoices/${row.original.id}`)}>
          View
        </Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Billing & Invoices" 
        description="Manage patient billing, payments, and financial records."
        actions={canCreate ? <Button icon={Plus} onClick={() => navigate('/billing/invoices/create')}>Create Invoice</Button> : null}
      />

      <div className="flex flex-wrap gap-3">
        <Select aria-label="Filter invoices by status" className="w-56" value={status} onChange={(event) => { setPage(1); setStatus(event.target.value); }}>
          <option value="">All statuses</option>
          {['DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'CANCELLED', 'REFUNDED'].map(value => <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>)}
        </Select>
        <Select aria-label="Filter invoices by type" className="w-56" value={type} onChange={(event) => { setPage(1); setType(event.target.value); }}>
          <option value="">All types</option>
          {['OPD', 'IPD', 'LAB', 'PHARMACY', 'AMBULANCE', 'PACKAGE', 'MISCELLANEOUS'].map(value => <option key={value} value={value}>{value}</option>)}
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center">
            <IndianRupee className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Revenue</p>
            <p className="text-xl font-bold text-slate-900">₹{Number(stats?.totals?.revenue || 0).toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Pending Dues</p>
            <p className="text-xl font-bold text-slate-900">₹{Number(stats?.totals?.outstanding || 0).toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Collected</p>
            <p className="text-xl font-bold text-slate-900">₹{Number(stats?.totals?.collected || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {isError ? <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">Invoices could not be loaded.</p> : <Card>
        <DataTable 
          columns={columns} 
          data={data?.data || []} 
          isLoading={isLoading} 
          pagination={{ page, totalPages: data?.pagination?.totalPages || 1 }}
          onPageChange={setPage}
          onRowClick={(row) => navigate(`/billing/invoices/${row.id}`)}
          emptyStateTitle="No invoices found"
          emptyStateDescription="Billing records will appear here as invoices are generated."
        />
      </Card>}
    </div>
  );
};
