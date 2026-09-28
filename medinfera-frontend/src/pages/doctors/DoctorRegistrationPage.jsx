import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorService } from '../../services/doctorService';
import { userService } from '../../services/userService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';

const doctorSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and a number'),
  specialization: z.string().min(2, 'Specialization is required'),
  licenseNumber: z.string().optional().or(z.literal('')),
  qualification: z.string().optional().or(z.literal('')),
  experienceYears: z.number().int().min(0, 'Experience must be 0 or more').default(0),
  consultationFee: z.number().min(0, 'Consultation fee is required').default(500),
  followUpFee: z.number().min(0, 'Follow-up fee is required').default(300),
  emergencyFee: z.number().min(0, 'Emergency fee is required').default(1000),
  maxDailyPatients: z.number().int().min(1, 'Must accept at least 1 patient').default(30),
  biography: z.string().optional(),
});

export const DoctorRegistrationPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(doctorSchema),
    defaultValues: { 
      experienceYears: 0,
      consultationFee: 500,
      followUpFee: 300,
      emergencyFee: 1000,
      maxDailyPatients: 30
    }
  });

  const mutation = useMutation({
    mutationFn: async ({ password, ...data }) => {
      const userResponse = await userService.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password,
        role: 'DOCTOR',
      });
      try {
        return await doctorService.create({
          userId: userResponse.data.data.id,
          specialization: data.specialization,
          licenseNumber: data.licenseNumber,
          qualification: data.qualification,
          experienceYears: data.experienceYears,
          consultationFee: data.consultationFee,
          followUpFee: data.followUpFee,
          emergencyFee: data.emergencyFee,
          maxDailyPatients: data.maxDailyPatients,
          biography: data.biography,
        });
      } catch (error) {
        error.createdUserId = userResponse.data.data.id;
        throw error;
      }
    },
    onSuccess: (res) => {
      toast.success('Doctor registered successfully');
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      navigate(`/doctors/${res.data.data.id}`);
    },
    onError: (error) => {
      toast.error(error.createdUserId
        ? `Doctor account created, but profile creation failed. Account ID: ${error.createdUserId}`
        : error.response?.data?.message || 'Failed to register doctor');
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader 
        title="Register Doctor" 
        description="Add a new doctor to the hospital"
        breadcrumbs={[{ label: 'Doctors', path: '/doctors' }, { label: 'Register' }]}
      />

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))}>
        <Card className="mb-6">
          <CardContent className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="First Name" {...register('firstName')} error={errors.firstName?.message} />
              <Input label="Last Name" {...register('lastName')} error={errors.lastName?.message} />
            </div>

            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2 pt-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
              <Input label="Phone Number" {...register('phone')} error={errors.phone?.message} />
              <Input label="Initial Password" type="password" {...register('password')} error={errors.password?.message} />
            </div>

            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2 pt-4">Professional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Specialization" {...register('specialization')} error={errors.specialization?.message} placeholder="e.g., Cardiology, General Medicine" />
              <Input label="License Number" {...register('licenseNumber')} error={errors.licenseNumber?.message} />
              <Input label="Qualification" {...register('qualification')} error={errors.qualification?.message} placeholder="e.g., MBBS, MD" />
              <Input label="Years of Experience" type="number" {...register('experienceYears', { valueAsNumber: true })} error={errors.experienceYears?.message} />
              <Input label="Max Daily Patients" type="number" {...register('maxDailyPatients', { valueAsNumber: true })} error={errors.maxDailyPatients?.message} />
            </div>

            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2 pt-4">Fee Structure</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Consultation Fee (₹)" type="number" {...register('consultationFee', { valueAsNumber: true })} error={errors.consultationFee?.message} />
              <Input label="Follow-Up Fee (₹)" type="number" {...register('followUpFee', { valueAsNumber: true })} error={errors.followUpFee?.message} />
              <Input label="Emergency Fee (₹)" type="number" {...register('emergencyFee', { valueAsNumber: true })} error={errors.emergencyFee?.message} />
            </div>

            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2 pt-4">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <Input label="Biography (for profile)" {...register('biography')} placeholder="Detailed biography..." error={errors.biography?.message} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" isLoading={mutation.isPending}>Register Doctor</Button>
        </div>
      </form>
    </div>
  );
};