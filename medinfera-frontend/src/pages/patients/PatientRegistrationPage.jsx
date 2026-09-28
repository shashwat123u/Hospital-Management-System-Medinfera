import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService } from '../../services/patientService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';

const patientSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  phone: z.string().min(10, 'Valid phone required'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(6, 'Valid pincode required'),
  bloodGroup: z.enum(['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE', 'UNKNOWN']).default('UNKNOWN'),
  allergies: z.string().optional().default(''),
  chronicConditions: z.string().optional().default(''),
  emergencyContactName: z.string().min(2, 'Emergency contact required'),
  emergencyContactRelation: z.string().min(2, 'Relation required'),
  emergencyContactPhone: z.string().min(10, 'Valid phone required'),
  insuranceProvider: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
  insuranceValidUntil: z.string().optional(),
  notes: z.string().optional()
}).transform((data) => ({
  ...data,
  dateOfBirth: data.dateOfBirth || undefined,
  insuranceValidUntil: data.insuranceValidUntil || undefined,
  allergies: data.allergies ? data.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
  chronicConditions: data.chronicConditions ? data.chronicConditions.split(',').map(s => s.trim()).filter(Boolean) : [],
}));

export const PatientRegistrationPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(patientSchema),
    defaultValues: { 
      gender: 'MALE', 
      bloodGroup: 'UNKNOWN', 
      allergies: '',
      chronicConditions: '',
      insuranceProvider: '',
      insurancePolicyNumber: '',
      insuranceValidUntil: '',
      notes: ''
    }
  });

  const mutation = useMutation({
    mutationFn: (data) => patientService.create(data),
    onSuccess: (res) => {
      toast.success('Patient registered successfully');
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      navigate(`/patients/${res.data.data.id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to register patient');
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader 
        title="Register Patient" 
        description="Add a new patient to the system"
        breadcrumbs={[{ label: 'Patients', path: '/patients' }, { label: 'Register' }]}
      />

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))}>
        <Card className="mb-6">
          <CardContent className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="First Name" {...register('firstName')} error={errors.firstName?.message} />
              <Input label="Last Name" {...register('lastName')} error={errors.lastName?.message} />
              <Input label="Date of Birth" type="date" {...register('dateOfBirth')} error={errors.dateOfBirth?.message} />
              <Select label="Gender" {...register('gender')} error={errors.gender?.message}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </Select>
            </div>

            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2 pt-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Phone Number" {...register('phone')} error={errors.phone?.message} />
              <Input label="Email (Optional)" type="email" {...register('email')} error={errors.email?.message} />
              <div className="md:col-span-2">
                <Input label="Address" {...register('address')} error={errors.address?.message} />
              </div>
              <Input label="City" {...register('city')} error={errors.city?.message} />
              <Input label="State" {...register('state')} error={errors.state?.message} />
              <Input label="Pincode" {...register('pincode')} error={errors.pincode?.message} />
            </div>

            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2 pt-4">Medical Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label="Blood Group" {...register('bloodGroup')} error={errors.bloodGroup?.message}>
                <option value="UNKNOWN">Select Blood Group</option>
                {['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'].map(bg => <option key={bg} value={bg}>{bg.replace('_', ' ')}</option>)}
              </Select>
              <Input label="Allergies (comma separated)" 
                     {...register('allergies')}
                     placeholder="Penicillin, Pollen"
                     error={errors.allergies?.message} />
              <div className="md:col-span-2">
                <Input label="Chronic Conditions (comma separated)" 
                       {...register('chronicConditions')}
                       placeholder="Diabetes, Hypertension"
                       error={errors.chronicConditions?.message} />
              </div>
              <div className="md:col-span-2">
                <Textarea label="Medical Notes" {...register('notes')} error={errors.notes?.message} />
              </div>
            </div>

            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2 pt-4">Insurance Details (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Insurance Provider" {...register('insuranceProvider')} error={errors.insuranceProvider?.message} />
              <Input label="Policy Number" {...register('insurancePolicyNumber')} error={errors.insurancePolicyNumber?.message} />
              <Input label="Valid Until" type="date" {...register('insuranceValidUntil')} error={errors.insuranceValidUntil?.message} />
            </div>

            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2 pt-4">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Name" {...register('emergencyContactName')} error={errors.emergencyContactName?.message} />
              <Input label="Relationship" {...register('emergencyContactRelation')} error={errors.emergencyContactRelation?.message} />
              <Input label="Phone" {...register('emergencyContactPhone')} error={errors.emergencyContactPhone?.message} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" isLoading={mutation.isPending}>Register Patient</Button>
        </div>
      </form>
    </div>
  );
};
