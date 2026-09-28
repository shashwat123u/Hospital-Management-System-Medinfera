import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { FileText, Printer, CreditCard, Clock } from 'lucide-react';
import { invoiceService } from '../../services/invoiceService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { format } from 'date-fns';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { useAuth } from '../../hooks/useAuth';

export const InvoiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [payment, setPayment] = useState({ paymentMode: 'CASH', amount: '', transactionReference: '', notes: '' });

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoices', id],
    queryFn: async () => {
      const res = await invoiceService.getById(id);
      return res.data.data;
    }
  });

  const paymentMutation = useMutation({
    mutationFn: () => invoiceService.recordPayment({ invoiceId: id, ...payment, amount: Number(payment.amount) }),
    onSuccess: () => {
      toast.success('Payment recorded');
      setPaymentOpen(false);
      setPayment({ paymentMode: 'CASH', amount: '', transactionReference: '', notes: '' });
      queryClient.invalidateQueries({ queryKey: ['invoices', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not record payment'),
  });

  if (isLoading) return <Skeleton className="h-96 w-full rounded-2xl" />;

  const breadcrumbs = [
    { label: 'Invoices', path: '/billing/invoices' },
    { label: invoice?.invoiceNumber || 'Invoice Details' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader 
        title={`Invoice #${invoice?.invoiceNumber}`} 
        description="Detailed breakdown of charges and payment status."
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={Printer} onClick={() => window.print()}>Print</Button>
            {['SUPER_ADMIN', 'ADMIN', 'BILLING', 'RECEPTIONIST'].includes(user?.role) && Number(invoice?.dueAmount) > 0 && (
              <Button icon={CreditCard} onClick={() => { setPayment(current => ({ ...current, amount: String(invoice.dueAmount) })); setPaymentOpen(true); }}>Record Payment</Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-8">
              {/* Header Info */}
              <div className="flex justify-between items-start mb-10 pb-10 border-b border-slate-100">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center font-bold text-primary-600">
                      MI
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{invoice?.type} Invoice</h3>
                      <p className="text-xs text-slate-500">{invoice?.invoiceNumber}</p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Billed To</p>
                    <p className="text-sm font-bold text-slate-900">{invoice?.patient?.firstName} {invoice?.patient?.lastName}</p>
                    <p className="text-xs text-slate-500">{invoice?.patient?.phone}</p>
                  </div>
                </div>
                <div className="text-right space-y-4">
                  <StatusBadge status={invoice?.status} />
                  <div className="pt-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Date Issued</p>
                    <p className="text-sm font-bold text-slate-900">{format(new Date(invoice?.createdAt), 'dd MMM yyyy')}</p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 px-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2 text-right">Qty</div>
                  <div className="col-span-2 text-right">Price</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>
                
                <div className="divide-y divide-slate-50">
                  {invoice?.items?.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4 items-center py-4 px-2 hover:bg-slate-50 transition-colors rounded-xl">
                      <div className="col-span-6">
                        <p className="text-sm font-semibold text-slate-900">{item.description}</p>
                        <p className="text-xs text-slate-500">{item.description}</p>
                      </div>
                      <div className="col-span-2 text-right text-sm text-slate-600">{item.quantity}</div>
                      <div className="col-span-2 text-right text-sm text-slate-600">₹{Number(item.unitPrice).toLocaleString()}</div>
                      <div className="col-span-2 text-right text-sm font-bold text-slate-900">₹{Number(item.totalPrice).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="mt-10 pt-10 border-t-2 border-slate-50 flex justify-end">
                <div className="w-64 space-y-3">
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900">₹{Number(invoice?.subtotal || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Discount</span>
                    <span className="font-semibold text-slate-900">-₹{Number(invoice?.discountAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>GST</span>
                    <span className="font-semibold text-slate-900">₹{Number(invoice?.gstAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-500 pb-3 border-b border-slate-100">
                    <span>Paid Amount</span>
                    <span className="font-semibold text-emerald-600">-₹{Number(invoice?.paidAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="font-bold text-slate-900 uppercase tracking-wider">Total Due</span>
                    <span className="text-xl font-bold text-primary-600">₹{Number(invoice?.dueAmount || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-600" />
                Payment History
              </h4>
              <div className="space-y-4">
                {invoice?.payments?.length > 0 ? (
                  invoice.payments.map((payment, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-900">₹{payment.amount.toLocaleString()}</p>
                        <p className="text-slate-500">{payment.paymentMode} · {format(new Date(payment.createdAt), 'dd MMM')}</p>
                      </div>
                      <StatusBadge status={payment.status} size="sm" />
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic text-center py-4">No payments recorded yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      <Modal isOpen={paymentOpen} onClose={() => setPaymentOpen(false)} title="Record invoice payment">
        <form onSubmit={(event) => { event.preventDefault(); paymentMutation.mutate(); }} className="space-y-4">
          <Input label="Amount" type="number" min="0.01" max={invoice?.dueAmount} step="0.01" value={payment.amount} onChange={(event) => setPayment(current => ({ ...current, amount: event.target.value }))} required />
          <Select label="Payment mode" value={payment.paymentMode} onChange={(event) => setPayment(current => ({ ...current, paymentMode: event.target.value }))}>
            {['CASH', 'CARD', 'UPI', 'NETBANKING', 'CHEQUE', 'INSURANCE', 'CREDIT'].map(value => <option key={value} value={value}>{value}</option>)}
          </Select>
          <Input label="Transaction reference" value={payment.transactionReference} onChange={(event) => setPayment(current => ({ ...current, transactionReference: event.target.value }))} />
          <Textarea label="Notes" value={payment.notes} onChange={(event) => setPayment(current => ({ ...current, notes: event.target.value }))} rows={2} />
          <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setPaymentOpen(false)}>Cancel</Button><Button type="submit" isLoading={paymentMutation.isPending} disabled={!payment.amount || Number(payment.amount) > Number(invoice?.dueAmount)}>Record payment</Button></div>
        </form>
      </Modal>
    </div>
  );
};
