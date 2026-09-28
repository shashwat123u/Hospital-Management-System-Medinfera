import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { purchaseOrderService, supplierService, medicineService } from '../../services/medicineService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/shared/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { format } from 'date-fns';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { useLocation } from 'react-router-dom';

export const PurchaseOrderPage = () => {
  const location = useLocation();
  const preselectedMedicineId = location.state?.medicineId || '';
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(Boolean(preselectedMedicineId));
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [modalMode, setModalMode] = useState(null);
  const [orderForm, setOrderForm] = useState({ supplierId: '', medicineId: preselectedMedicineId, quantityOrdered: '1', unitPrice: '', expectedDeliveryAt: '', notes: '' });
  const [receiveItems, setReceiveItems] = useState({});

  const { data, isLoading, isError } = useQuery({
    queryKey: ['purchase-orders', { page }],
    queryFn: async () => {
      const res = await purchaseOrderService.getAll({ page, limit: 10 });
      return res.data;
    }
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers', 'purchase-order-form'],
    queryFn: async () => (await supplierService.getAll({ page: 1, limit: 100 })).data.data,
    enabled: createOpen,
  });
  const { data: medicines = [] } = useQuery({
    queryKey: ['medicines', 'purchase-order-form'],
    queryFn: async () => (await medicineService.getAll({ page: 1, limit: 100 })).data.data,
    enabled: createOpen,
  });
  const { data: selectedOrder, isLoading: isOrderLoading } = useQuery({
    queryKey: ['purchase-orders', selectedOrderId],
    queryFn: async () => (await purchaseOrderService.getById(selectedOrderId)).data.data,
    enabled: Boolean(selectedOrderId && modalMode),
  });

  useEffect(() => {
    if (modalMode === 'receive' && selectedOrder?.items) {
      setReceiveItems(Object.fromEntries(selectedOrder.items.map(item => [item.id, {
        quantityReceived: String(Math.max(0, item.quantityOrdered - item.quantityReceived)),
        batchNumber: item.batchNumber || '',
        expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().slice(0, 10) : '',
      }])));
    }
  }, [modalMode, selectedOrder]);

  const createMutation = useMutation({
    mutationFn: () => purchaseOrderService.create({
      supplierId: orderForm.supplierId,
      ...(orderForm.expectedDeliveryAt && { expectedDeliveryAt: `${orderForm.expectedDeliveryAt}T00:00:00.000Z` }),
      notes: orderForm.notes,
      items: [{ medicineId: orderForm.medicineId, quantityOrdered: Number(orderForm.quantityOrdered), unitPrice: Number(orderForm.unitPrice) }],
    }),
    onSuccess: () => {
      toast.success('Purchase order created');
      setCreateOpen(false);
      setOrderForm({ supplierId: '', medicineId: '', quantityOrdered: '1', unitPrice: '', expectedDeliveryAt: '', notes: '' });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not create purchase order'),
  });

  const receiveMutation = useMutation({
    mutationFn: () => purchaseOrderService.receive(selectedOrderId, {
      items: selectedOrder.items.filter(item => Number(receiveItems[item.id]?.quantityReceived) > 0).map(item => ({
        itemId: item.id,
        quantityReceived: Number(receiveItems[item.id].quantityReceived),
        batchNumber: receiveItems[item.id].batchNumber,
        expiryDate: `${receiveItems[item.id].expiryDate}T00:00:00.000Z`,
      })),
    }),
    onSuccess: () => {
      toast.success('Stock received and inventory updated');
      setModalMode(null);
      setSelectedOrderId('');
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not receive purchase order'),
  });

  const columns = [
    { header: 'Order ID', accessorKey: 'orderNumber', cell: ({ row }) => (
      <div className="font-mono text-xs font-bold text-slate-900">{row.original.orderNumber}</div>
    )},
    { header: 'Supplier', accessorKey: 'supplier.name' },
    { header: 'Date', accessorKey: 'createdAt', cell: ({ row }) => (
      <div className="text-sm text-slate-500">{format(new Date(row.original.createdAt), 'dd MMM yyyy')}</div>
    )},
    { header: 'Amount', accessorKey: 'netAmount', cell: ({ row }) => (
      <div className="font-semibold text-slate-900">₹{Number(row.original.netAmount).toLocaleString()}</div>
    )},
    { header: 'Status', cell: ({ row }) => {
      const status = row.original.status;
      const variants = {
        DRAFT: 'warning',
        SUBMITTED: 'info',
        APPROVED: 'info',
        PARTIALLY_RECEIVED: 'primary',
        RECEIVED: 'success',
        CANCELLED: 'slate',
      };
      return <Badge variant={variants[status] || 'slate'}>{status}</Badge>;
    }},
    { header: 'Actions', cell: ({ row }) => (
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" icon={FileText} onClick={() => { setSelectedOrderId(row.original.id); setModalMode('details'); }}>Details</Button>
        {!['RECEIVED', 'CANCELLED'].includes(row.original.status) && (
          <Button variant="secondary" size="sm" icon={CheckCircle2} onClick={() => { setSelectedOrderId(row.original.id); setModalMode('receive'); }}>Receive</Button>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Purchase Orders" 
        description="Manage procurement of medicines and pharmacy supplies."
        actions={
          <Button icon={Plus} onClick={() => setCreateOpen(true)}>Create Order</Button>
        }
      />

      <Card>
        {isError ? <p className="p-6 text-sm text-red-600">Purchase orders could not be loaded.</p> : <DataTable
          columns={columns} 
          data={data?.data || []}
          isLoading={isLoading} 
          pagination={data?.pagination}
          onPageChange={setPage}
          emptyStateTitle="No purchase orders"
          emptyStateDescription="Procurement history will appear here."
        />}
      </Card>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create purchase order">
        <form onSubmit={(event) => { event.preventDefault(); createMutation.mutate(); }} className="space-y-4">
          <Select label="Supplier" value={orderForm.supplierId} onChange={(event) => setOrderForm(current => ({ ...current, supplierId: event.target.value }))} required>
            <option value="">Select a supplier</option>
            {suppliers.map(supplier => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
          </Select>
          <Select label="Medicine" value={orderForm.medicineId} onChange={(event) => setOrderForm(current => ({ ...current, medicineId: event.target.value }))} required>
            <option value="">Select a medicine</option>
            {medicines.map(medicine => <option key={medicine.id} value={medicine.id}>{medicine.name}</option>)}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Quantity" type="number" min="1" value={orderForm.quantityOrdered} onChange={(event) => setOrderForm(current => ({ ...current, quantityOrdered: event.target.value }))} required />
            <Input label="Unit price" type="number" min="0" step="0.01" value={orderForm.unitPrice} onChange={(event) => setOrderForm(current => ({ ...current, unitPrice: event.target.value }))} required />
          </div>
          <Input label="Expected delivery" type="date" value={orderForm.expectedDeliveryAt} onChange={(event) => setOrderForm(current => ({ ...current, expectedDeliveryAt: event.target.value }))} />
          <Textarea label="Notes" value={orderForm.notes} onChange={(event) => setOrderForm(current => ({ ...current, notes: event.target.value }))} rows={2} />
          <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button><Button type="submit" isLoading={createMutation.isPending} disabled={!orderForm.supplierId || !orderForm.medicineId || !orderForm.unitPrice}>Create order</Button></div>
        </form>
      </Modal>

      <Modal isOpen={Boolean(modalMode)} onClose={() => { setModalMode(null); setSelectedOrderId(''); }} title={modalMode === 'receive' ? 'Receive purchase order' : 'Purchase order details'} size="lg">
        {isOrderLoading || !selectedOrder ? <p className="text-sm text-slate-500">Loading purchase order…</p> : modalMode === 'details' ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">{selectedOrder.orderNumber} · {selectedOrder.supplier?.name} · {selectedOrder.status}</p>
            {selectedOrder.items?.map(item => <div key={item.id} className="flex justify-between border-t py-3 text-sm"><span>{item.medicine?.name} · {item.quantityReceived}/{item.quantityOrdered} received</span><span>₹{Number(item.totalPrice).toLocaleString()}</span></div>)}
          </div>
        ) : (
          <form onSubmit={(event) => { event.preventDefault(); receiveMutation.mutate(); }} className="space-y-4">
            {selectedOrder.items?.map(item => {
              const values = receiveItems[item.id] || {};
              const remaining = item.quantityOrdered - item.quantityReceived;
              return <div key={item.id} className="grid grid-cols-1 md:grid-cols-3 gap-3 border-b pb-4">
                <p className="self-center text-sm font-medium">{item.medicine?.name} · {remaining} remaining</p>
                <Input label="Qty received" type="number" min="0" max={remaining} value={values.quantityReceived || ''} onChange={(event) => setReceiveItems(current => ({ ...current, [item.id]: { ...current[item.id], quantityReceived: event.target.value } }))} required />
                <Input label="Batch number" value={values.batchNumber || ''} onChange={(event) => setReceiveItems(current => ({ ...current, [item.id]: { ...current[item.id], batchNumber: event.target.value } }))} required={Number(values.quantityReceived) > 0} />
                <Input label="Expiry date" type="date" value={values.expiryDate || ''} onChange={(event) => setReceiveItems(current => ({ ...current, [item.id]: { ...current[item.id], expiryDate: event.target.value } }))} required={Number(values.quantityReceived) > 0} />
              </div>;
            })}
            <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setModalMode(null)}>Cancel</Button><Button type="submit" isLoading={receiveMutation.isPending}>Receive stock</Button></div>
          </form>
        )}
      </Modal>
    </div>
  );
};
