import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { BedDouble, User, ShieldCheck, Stethoscope } from 'lucide-react';
import { ipdService } from '../../services/ipdService';
import { patientService } from '../../services/patientService';
import { bedService } from '../../services/bedService';
import { doctorService } from '../../services/doctorService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';

const admissionSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  wardId: z.string().min(1, 'Ward is required'),
  bedId: z.string().min(1, 'Bed is required'),
  primaryDoctorId: z.string().min(1, 'Attending doctor is required'),
  reasonForAdmission: z.string().min(3, 'Reason for admission is required'),
  provisionalDiagnosis: z.string().optional(),
});

export const AdmitPatientPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(admissionSchema),
  });

  const watchWard = watch('wardId');

  // Fetch data for dropdowns
  const { data: patients } = useQuery({
    queryKey: ['patients', 'all'],
    queryFn: async () => {
      const res = await patientService.getAll({ limit: 100 });
      return res.data.data;
    }
  });

  const { data: doctors } = useQuery({
    queryKey: ['doctors', 'all'],
    queryFn: async () => {
      const res = await doctorService.getAll({ limit: 100 });
      return res.data.data;
    }
  });

  const { data: wards } = useQuery({
    queryKey: ['wards'],
    queryFn: async () => {
      const res = await bedService.getWards();
      return res.data.data;
    }
  });

  const { data: beds, isLoading: isBedsLoading } = useQuery({
    queryKey: ['beds', 'ward', watchWard],
    queryFn: async () => {
      if (!watchWard) return [];
      const res = await bedService.getAll({ wardId: watchWard });
      return res.data.data.filter(bed => bed.status === 'AVAILABLE');
    },
    enabled: !!watchWard
  });

  const mutation = useMutation({
    mutationFn: ({ wardId, ...data }) => ipdService.create(data),
    onSuccess: (res) => {
      toast.success('Patient admitted successfully');
      queryClient.invalidateQueries({ queryKey: ['ipd'] });
      queryClient.invalidateQueries({ queryKey: ['beds'] });
      navigate(`/ipd/${res.data.data.id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to admit patient');
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader 
        title="Admit Patient" 
        description="Formalize admission to In-Patient Department (IPD)"
        breadcrumbs={[{ label: 'IPD', path: '/ipd' }, { label: 'Admit Patient' }]}
      />

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))}>
        <Card className="mb-6">
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Patient Selection */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                  <User className="w-4 h-4 text-primary-600" />
                  Patient & Doctor
                </h3>
                <Select label="Select Patient" {...register('patientId')} error={errors.patientId?.message}>
                  <option value="">Select a patient</option>
                  {patients?.map(p => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.id.slice(-6)})</option>
                  ))}
                </Select>
                <Select label="Attending Doctor" {...register('primaryDoctorId')} error={errors.primaryDoctorId?.message}>
                  <option value="">Select a doctor</option>
                  {doctors?.map(d => (
                    <option key={d.id} value={d.id}>Dr. {d.user.firstName} {d.user.lastName} - {d.specialization}</option>
                  ))}
                </Select>
              </div>

              {/* Bed Assignment */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                  <BedDouble className="w-4 h-4 text-primary-600" />
                  Bed Assignment
                </h3>
                <Select 
                  label="Select Ward" 
                  {...register('wardId')} 
                  error={errors.wardId?.message}
                  onChange={(e) => {
                    register('wardId').onChange(e);
                    setValue('bedId', '');
                  }}
                >
                  <option value="">Select a ward</option>
                  {wards?.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.type}) - {w.availableBeds} Free</option>
                  ))}
                </Select>
                
                <Select label="Select Bed" {...register('bedId')} error={errors.bedId?.message} disabled={!watchWard || isBedsLoading}>
                  <option value="">{isBedsLoading ? 'Loading beds...' : 'Select a bed'}</option>
                  {beds?.map(b => (
                    <option key={b.id} value={b.id}>Bed {b.bedNumber} ({b.type})</option>
                  ))}
                </Select>

                {watchWard && beds?.length === 0 && !isBedsLoading && (
                  <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg border border-red-100 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    No available beds in this ward.
                  </p>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                <Stethoscope className="w-4 h-4 text-primary-600" />
                Clinical Details
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <Input label="Provisional Diagnosis" {...register('provisionalDiagnosis')} placeholder="e.g. Acute Appendicitis" />
                <Textarea label="Reason for Admission" {...register('reasonForAdmission')} error={errors.reasonForAdmission?.message} rows={3} placeholder="Describe the symptoms and reason for admitting the patient..." />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" isLoading={mutation.isPending}>Confirm Admission</Button>
        </div>
      </form>
    </div>
  );
};
