import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Microscope, Send, User, ClipboardList } from 'lucide-react';
import { labService } from '../../services/labService';
import { patientService } from '../../services/patientService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';

const labOrderSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  testId: z.string().min(1, 'Test is required'),
  instructions: z.string().optional(),
  priority: z.enum(['ROUTINE', 'URGENT', 'STAT']).default('ROUTINE'),
});

export const CreateLabOrderPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(labOrderSchema),
    defaultValues: { priority: 'ROUTINE' }
  });

  const { data: patients } = useQuery({
    queryKey: ['patients', 'all'],
    queryFn: async () => {
      const res = await patientService.getAll({ limit: 100 });
      return res.data.data;
    }
  });

  const { data: tests } = useQuery({
    queryKey: ['lab-tests', 'catalog'],
    queryFn: async () => {
      const res = await labService.getTests({ limit: 100 });
      return res.data.data;
    }
  });

  const mutation = useMutation({
    mutationFn: ({ testId, instructions, ...data }) => labService.createOrder({
      ...data,
      testIds: [testId],
      clinicalInfo: instructions,
    }),
    onSuccess: (res) => {
      toast.success('Lab order created successfully');
      queryClient.invalidateQueries({ queryKey: ['lab-orders'] });
      navigate(`/lab/orders/${res.data.data.id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create lab order');
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader 
        title="New Lab Order" 
        description="Request a diagnostic test for a patient."
        breadcrumbs={[{ label: 'Lab Orders', path: '/lab/orders' }, { label: 'New Order' }]}
      />

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-center gap-2 text-primary-600 mb-4 pb-2 border-b">
                  <ClipboardList className="w-5 h-5" />
                  <h3 className="font-bold uppercase tracking-wider text-xs">Test Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select label="Diagnostic Test" {...register('testId')} error={errors.testId?.message}>
                    <option value="">Select a test</option>
                    {tests?.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                    ))}
                  </Select>

                  <Select label="Priority Level" {...register('priority')} error={errors.priority?.message}>
                    <option value="ROUTINE">Routine</option>
                    <option value="URGENT">Urgent</option>
                    <option value="STAT">STAT (Immediate)</option>
                  </Select>
                </div>

                <Textarea 
                  label="Clinical Instructions / Notes" 
                  {...register('instructions')} 
                  error={errors.instructions?.message} 
                  rows={4} 
                  placeholder="Reason for test, specific parameters to watch, etc..." 
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <User className="w-4 h-4" />
                  <h3 className="font-bold uppercase tracking-wider text-xs">Patient</h3>
                </div>

                <Select label="Select Patient" {...register('patientId')} error={errors.patientId?.message}>
                  <option value="">Choose patient</option>
                  {patients?.map(p => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.id.slice(-6)})</option>
                  ))}
                </Select>

                <div className="pt-6">
                  <Button type="submit" className="w-full" isLoading={mutation.isPending} icon={Send}>
                    Create Lab Order
                  </Button>
                  <Button type="button" variant="secondary" className="w-full mt-2" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100 flex gap-3">
              <Microscope className="w-5 h-5 text-primary-600 flex-shrink-0" />
              <p className="text-xs text-primary-700 leading-relaxed">
                Once created, the order will appear in the Lab Technician's queue for collection and processing.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
