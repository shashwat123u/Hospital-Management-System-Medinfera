import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Microscope, Save } from 'lucide-react';
import { labService } from '../../services/labService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';

const resultsSchema = z.object({
  results: z.array(z.object({
    itemId: z.string().uuid(),
    resultValue: z.string().min(1, 'Result value is required'),
    resultNotes: z.string().optional(),
    isAbnormal: z.boolean().optional(),
  })).min(1, 'At least one result parameter is required'),
});

export const EnterResultsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['lab-orders', id],
    queryFn: async () => {
      const res = await labService.getOrderById(id);
      return res.data.data;
    }
  });

  const { register, control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resultsSchema),
    values: {
      results: order?.items?.map(item => ({
        itemId: item.id,
        resultValue: item.resultValue || '',
        resultNotes: item.resultNotes || '',
        isAbnormal: item.isAbnormal ?? false,
      })) || [],
    }
  });

  const { fields } = useFieldArray({
    control,
    name: 'results'
  });

  const mutation = useMutation({
    mutationFn: (data) => labService.enterResults(id, data),
    onSuccess: () => {
      toast.success('Lab results entered successfully');
      queryClient.invalidateQueries({ queryKey: ['lab-orders'] });
      navigate(`/lab/orders/${id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to enter results');
    }
  });

  if (isLoading) return <Skeleton className="h-96 w-full rounded-2xl" />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader 
        title="Enter Lab Results" 
        description={`Processing order ${order?.orderNumber || ''}`}
        breadcrumbs={[{ label: 'Lab Orders', path: '/lab/orders' }, { label: 'Enter Results' }]}
      />

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))}>
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Microscope className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{order?.patient?.user?.firstName} {order?.patient?.user?.lastName}</h3>
                  <p className="text-sm text-slate-500">Order Ref: #{order?.orderNumber || id.slice(-8)}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-12 gap-4 px-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <div className="col-span-4">Test</div>
                    <div className="col-span-3">Result Value</div>
                    <div className="col-span-5">Notes</div>
                  </div>
                  
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-4 items-start">
                      <div className="col-span-4">
                        <p className="py-2 text-sm font-medium text-slate-700">{order?.items?.[index]?.labTest?.name}</p>
                        <input type="hidden" {...register(`results.${index}.itemId`)} />
                      </div>
                      <div className="col-span-3">
                        <Input {...register(`results.${index}.resultValue`)} error={errors.results?.[index]?.resultValue?.message} placeholder="Enter result" />
                      </div>
                      <div className="col-span-5">
                        <Input {...register(`results.${index}.resultNotes`)} placeholder="Optional note" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <p className="text-sm text-slate-500">Enter one result for each ordered test. Additional test results must be ordered separately.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" isLoading={mutation.isPending} icon={Save}>Finalize & Release Results</Button>
          </div>
        </div>
      </form>
    </div>
  );
};
