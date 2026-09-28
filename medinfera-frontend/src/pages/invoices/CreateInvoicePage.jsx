import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, IndianRupee, User, FilePlus, Send } from 'lucide-react';
import { invoiceService } from '../../services/invoiceService';
import { patientService } from '../../services/patientService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';

const invoiceSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  type: z.enum(['OPD', 'IPD', 'LAB', 'PHARMACY', 'AMBULANCE', 'PACKAGE', 'MISCELLANEOUS']),
  items: z.array(z.object({
    name: z.string().min(1, 'Item name is required'),
    quantity: z.number().min(1, 'Min 1'),
    price: z.number().min(0, 'Min 0'),
  })).min(1, 'At least one item is required'),
  notes: z.string().optional(),
});

export const CreateInvoicePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      items: [{ name: 'Consultation Fee', quantity: 1, price: 500 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const { data: patients } = useQuery({
    queryKey: ['patients', 'all'],
    queryFn: async () => {
      const res = await patientService.getAll({ limit: 100 });
      return res.data.data;
    }
  });

  const mutation = useMutation({
    mutationFn: ({ items, ...data }) => invoiceService.create({
      ...data,
      items: items.map(({ name, price, quantity }) => ({
        itemType: 'SERVICE',
        description: name,
        quantity,
        unitPrice: price,
        discount: 0,
        gstRate: 0,
      })),
    }),
    onSuccess: (res) => {
      toast.success('Invoice created successfully');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      navigate(`/billing/invoices/${res.data.data.id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create invoice');
    }
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader 
        title="Generate Invoice" 
        description="Create a new billing record for a patient."
        breadcrumbs={[{ label: 'Invoices', path: '/billing/invoices' }, { label: 'New' }]}
      />

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider mb-6">
                  <FilePlus className="w-4 h-4 text-primary-600" />
                  Invoice Items
                </h3>

                <Select label="Invoice Type" {...register('type')} error={errors.type?.message}>
                  <option value="OPD">Outpatient (OPD)</option>
                  <option value="IPD">Inpatient (IPD)</option>
                  <option value="LAB">Laboratory</option>
                  <option value="PHARMACY">Pharmacy</option>
                  <option value="AMBULANCE">Ambulance</option>
                  <option value="PACKAGE">Package</option>
                  <option value="MISCELLANEOUS">Miscellaneous</option>
                </Select>

                <div className="space-y-4">
                  <div className="grid grid-cols-12 gap-4 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <div className="col-span-6">Description</div>
                    <div className="col-span-2">Qty</div>
                    <div className="col-span-3">Unit Price</div>
                    <div className="col-span-1"></div>
                  </div>

                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-4 items-start">
                      <div className="col-span-6">
                        <Input 
                          placeholder="Item name" 
                          {...register(`items.${index}.name`)} 
                          error={errors.items?.[index]?.name?.message} 
                        />
                      </div>
                      <div className="col-span-2">
                        <Input 
                          type="number" 
                          {...register(`items.${index}.quantity`, { valueAsNumber: true })} 
                          error={errors.items?.[index]?.quantity?.message} 
                        />
                      </div>
                      <div className="col-span-3">
                        <Input 
                          type="number" 
                          placeholder="0.00"
                          {...register(`items.${index}.price`, { valueAsNumber: true })} 
                          error={errors.items?.[index]?.price?.message} 
                        />
                      </div>
                      <div className="col-span-1 pt-2">
                        <button 
                          type="button" 
                          onClick={() => remove(index)}
                          className="text-slate-300 hover:text-red-500 transition-colors"
                          disabled={fields.length === 1}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary-600"
                    onClick={() => append({ name: '', quantity: 1, price: 0 })}
                    icon={Plus}
                  >
                    Add Item
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Additional Notes</h3>
                <textarea 
                  {...register('notes')}
                  className="w-full border border-slate-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[100px]"
                  placeholder="Terms, payment instructions, or internal notes..."
                ></textarea>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider mb-4">
                    <User className="w-4 h-4 text-primary-600" />
                    Patient
                  </h3>
                  <Select label="Select Patient" {...register('patientId')} error={errors.patientId?.message}>
                    <option value="">Choose a patient</option>
                    {patients?.map(p => (
                      <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                    ))}
                  </Select>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Summary</h3>
                  <div className="space-y-3">
                    <p className="text-sm text-slate-500">Invoice totals are calculated by the backend when the invoice is created.</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <Button type="submit" className="w-full" isLoading={mutation.isPending} icon={Send}>Create Invoice</Button>
                  <Button type="button" variant="secondary" className="w-full" onClick={() => navigate(-1)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
              <Plus className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-700 leading-relaxed">
                Invoices once generated are immediately available to the patient. Ensure all items and prices are double-checked.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
