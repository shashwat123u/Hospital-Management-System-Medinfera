import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Pill, Save, Package, Tag, Layers } from 'lucide-react';
import { medicineService } from '../../services/medicineService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';

const medicineSchema = z.object({
  name: z.string().min(2, 'Medicine name is required'),
  genericName: z.string().optional(),
  category: z.enum(['TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'DROPS', 'CREAM', 'OINTMENT', 'INHALER', 'POWDER', 'PATCH', 'SUPPOSITORY', 'OTHER']),
  manufacturer: z.string().optional(),
  unitOfMeasure: z.string().min(1, 'Unit (e.g. Strip, Bottle) is required'),
  reorderLevel: z.coerce.number().min(0, 'Must be at least 0'),
  gstRate: z.coerce.number().min(0).max(100).default(12),
  sellingPrice: z.coerce.number().min(0, 'Must be at least 0'),
  mrp: z.preprocess(value => value === '' || value === undefined ? undefined : Number(value), z.number().min(0).optional()),
  isControlled: z.boolean().default(false),
});

export const AddMedicinePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(medicineSchema),
    defaultValues: { category: 'TABLET', reorderLevel: 10, gstRate: 12, isControlled: false }
  });

  const mutation = useMutation({
    mutationFn: (data) => medicineService.create(data),
    onSuccess: () => {
      toast.success('Medicine added to inventory');
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      navigate('/medicines');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add medicine');
    }
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader 
        title="Add Medicine" 
        description="Add a new medication to the pharmacy inventory."
        breadcrumbs={[{ label: 'Inventory', path: '/medicines' }, { label: 'Add New' }]}
      />

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-center gap-2 text-primary-600 mb-4 pb-2 border-b">
                  <Pill className="w-5 h-5" />
                  <h3 className="font-bold uppercase tracking-wider text-xs">General Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Medicine Name" {...register('name')} error={errors.name?.message} placeholder="e.g. Paracetamol 500mg" />
                  <Input label="Generic Name" {...register('genericName')} error={errors.genericName?.message} placeholder="e.g. Acetaminophen" />
                  <Select label="Category" {...register('category')} error={errors.category?.message}>
                    <option value="TABLET">Tablet</option>
                    <option value="CAPSULE">Capsule</option>
                    <option value="SYRUP">Syrup</option>
                    <option value="INJECTION">Injection</option>
                    <option value="DROPS">Drops</option>
                    <option value="CREAM">Cream</option>
                    <option value="OINTMENT">Ointment</option>
                    <option value="INHALER">Inhaler</option>
                    <option value="POWDER">Powder</option>
                    <option value="PATCH">Patch</option>
                    <option value="SUPPOSITORY">Suppository</option>
                    <option value="OTHER">Other</option>
                  </Select>
                  <Input label="Manufacturer" {...register('manufacturer')} error={errors.manufacturer?.message} placeholder="e.g. Cipla Ltd" />
                </div>

              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-center gap-2 text-primary-600 mb-4 pb-2 border-b">
                  <Tag className="w-5 h-5" />
                  <h3 className="font-bold uppercase tracking-wider text-xs">Pricing & Units</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input label="Unit of Measure" {...register('unitOfMeasure')} error={errors.unitOfMeasure?.message} placeholder="e.g. Strip (10 tabs)" />
                  <Input label="MRP (₹)" type="number" step="0.01" {...register('mrp')} error={errors.mrp?.message} />
                  <Input label="Selling Price (₹)" type="number" step="0.01" {...register('sellingPrice')} error={errors.sellingPrice?.message} />
                  <Input label="GST Rate (%)" type="number" min="0" max="100" step="0.01" {...register('gstRate')} error={errors.gstRate?.message} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-center gap-2 text-primary-600 mb-4 pb-2 border-b">
                  <Layers className="w-5 h-5" />
                  <h3 className="font-bold uppercase tracking-wider text-xs">Stock Management</h3>
                </div>

                <div className="space-y-4">
                  <Input label="Reorder Level" type="number" {...register('reorderLevel')} error={errors.reorderLevel?.message} />
                  <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" {...register('isControlled')} />Controlled medicine</label>
                </div>

                <div className="pt-6 border-t">
                  <Button type="submit" className="w-full" isLoading={mutation.isPending} icon={Save}>
                    Add to Inventory
                  </Button>
                  <Button type="button" variant="secondary" className="w-full mt-2" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-3">
              <Package className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <p className="text-xs text-emerald-700 leading-relaxed">
                Stock is added through a purchase order and receiving workflow. Alerts use the configured reorder level.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
