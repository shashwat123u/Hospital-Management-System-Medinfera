import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Truck, Navigation, MapPin, User, Send, AlertCircle } from 'lucide-react';
import { ambulanceService } from '../../services/ambulanceService';
import { patientService } from '../../services/patientService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';

const dispatchSchema = z.object({
  ambulanceId: z.string().min(1, 'Ambulance is required'),
  patientId: z.string().optional().or(z.literal('')),
  pickupAddress: z.string().min(5, 'Pickup location is required'),
  destination: z.string().optional(),
  callerName: z.string().optional(),
  callerPhone: z.string().optional(),
  notes: z.string().optional(),
});

export const DispatchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const preSelectedAmbulanceId = location.state?.ambulanceId || '';

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(dispatchSchema),
    defaultValues: { ambulanceId: preSelectedAmbulanceId }
  });

  const { data: ambulances } = useQuery({
    queryKey: ['ambulances', 'available'],
    queryFn: async () => {
      const res = await ambulanceService.getAll({ status: 'AVAILABLE' });
      return res.data.data;
    }
  });

  const { data: patients } = useQuery({
    queryKey: ['patients', 'all'],
    queryFn: async () => {
      const res = await patientService.getAll({ limit: 100 });
      return res.data.data;
    }
  });

  const mutation = useMutation({
    mutationFn: ({ patientId, ...data }) => ambulanceService.dispatch({
      ...data,
      ...(patientId ? { patientId } : {}),
    }),
    onSuccess: () => {
      toast.success('Ambulance dispatched successfully');
      queryClient.invalidateQueries({ queryKey: ['ambulances'] });
      queryClient.invalidateQueries({ queryKey: ['dispatches'] });
      navigate('/ambulance');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to dispatch ambulance');
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader 
        title="Emergency Dispatch" 
        description="Initiate rapid response and track ambulance deployment."
        breadcrumbs={[{ label: 'Ambulance', path: '/ambulance' }, { label: 'Dispatch' }]}
      />

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider border-b pb-2">
                  <Navigation className="w-4 h-4 text-primary-600" />
                  Route Details
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <Input label="Pickup Location" {...register('pickupAddress')} error={errors.pickupAddress?.message} placeholder="Enter exact address or landmark..." />
                  <Input label="Destination" {...register('destination')} error={errors.destination?.message} />
                </div>

                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider border-b pb-2 pt-4">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  Incident Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Caller Name" {...register('callerName')} />
                  <Input label="Caller Phone" {...register('callerPhone')} placeholder="On-site contact number" />
                </div>
                <Textarea label="Special Instructions" {...register('notes')} error={errors.notes?.message} rows={3} placeholder="Patient condition, gate codes, or specific entry instructions..." />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider mb-4">
                    <Truck className="w-4 h-4 text-primary-600" />
                    Vehicle Assignment
                  </h3>
                  <Select label="Select Ambulance" {...register('ambulanceId')} error={errors.ambulanceId?.message}>
                    <option value="">Choose vehicle</option>
                    {ambulances?.map(a => (
                      <option key={a.id} value={a.id}>{a.vehicleNumber} ({a.type})</option>
                    ))}
                  </Select>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider mb-4">
                    <User className="w-4 h-4 text-slate-400" />
                    Patient (Optional)
                  </h3>
                  <Select label="Assign Patient" {...register('patientId')} error={errors.patientId?.message}>
                    <option value="">Search by name...</option>
                    {patients?.map(p => (
                      <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                    ))}
                  </Select>
                </div>

                <div className="pt-6">
                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 focus:ring-red-500" isLoading={mutation.isPending} icon={Send}>
                    Confirm Dispatch
                  </Button>
                  <Button type="button" variant="secondary" className="w-full mt-2" onClick={() => navigate(-1)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-xs text-red-700 leading-relaxed">
                Dispatch details are available to authorized users in this hospital. GPS updates appear here when the ambulance reports its position.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
