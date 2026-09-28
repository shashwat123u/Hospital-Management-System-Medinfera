import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { hospitalService } from '../../services/hospitalService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const hospitalSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  code: z.string().min(2, 'Code is required').toUpperCase(),
  slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, and hyphens only'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().default('India'),
  pincode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').or(z.literal('')),
  website: z.string().url('Invalid URL').or(z.literal('')),
  registrationNumber: z.string().optional(),
  gstNumber: z.string().optional(),
  subscriptionPlan: z.enum(['TRIAL', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE']).default('TRIAL'),
  timezone: z.string().default('Asia/Kolkata'),
  currency: z.string().default('INR')
});

export const HospitalFormPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(hospitalSchema),
    defaultValues: {
      name: '',
      code: '',
      slug: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      pincode: '',
      phone: '',
      email: '',
      website: '',
      registrationNumber: '',
      gstNumber: '',
      subscriptionPlan: 'TRIAL',
      timezone: 'Asia/Kolkata',
      currency: 'INR'
    }
  });

  const createHospitalMutation = useMutation({
    mutationFn: (data) => hospitalService.create(data),
    onSuccess: () => {
      toast.success('Hospital registered successfully');
      queryClient.invalidateQueries(['hospitals']);
      navigate('/hospitals');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to register hospital');
    }
  });

  const onSubmit = (data) => {
    const payload = { ...data };
    for (const field of ['registrationNumber', 'gstNumber', 'pincode', 'phone', 'email', 'website']) {
      if (!payload[field]?.trim()) delete payload[field];
    }
    createHospitalMutation.mutate(payload);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader 
        title="Register Hospital" 
        description="Add a new hospital to the MedInfera platform." 
        breadcrumbs={[
          { label: 'Hospitals', path: '/hospitals' }, 
          { label: 'Register Hospital' }
        ]} 
      />
      <Card>
        <CardContent>
          <div onSubmit={handleSubmit(onSubmit)} as="form">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
              
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-4 border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Hospital Name" {...register('name')} error={errors.name?.message} className="md:col-span-2" />
                  <Input label="Hospital Code (e.g., MED001)" {...register('code')} error={errors.code?.message} />
                  <Input label="URL Slug (e.g., medinfera-general)" {...register('slug')} error={errors.slug?.message} />
                  <Input label="Registration Number" {...register('registrationNumber')} error={errors.registrationNumber?.message} />
                  <Input label="GST Number" {...register('gstNumber')} error={errors.gstNumber?.message} />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-4 border-b pb-2">Contact Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Email Address" type="email" {...register('email')} error={errors.email?.message} />
                  <Input label="Phone Number" {...register('phone')} error={errors.phone?.message} />
                  <Input label="Website" type="url" {...register('website')} error={errors.website?.message} className="md:col-span-2" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-4 border-b pb-2">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Street Address" {...register('address')} error={errors.address?.message} className="md:col-span-2" />
                  <Input label="City" {...register('city')} error={errors.city?.message} />
                  <Input label="State" {...register('state')} error={errors.state?.message} />
                  <Input label="Country" {...register('country')} error={errors.country?.message} />
                  <Input label="Pincode / ZIP" {...register('pincode')} error={errors.pincode?.message} />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-4 border-b pb-2">System Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Subscription Plan</label>
                    <select 
                      {...register('subscriptionPlan')} 
                      className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="TRIAL">Trial</option>
                      <option value="STARTER">Starter</option>
                      <option value="PROFESSIONAL">Professional</option>
                      <option value="ENTERPRISE">Enterprise</option>
                    </select>
                    {errors.subscriptionPlan && <p className="text-xs text-red-500">{errors.subscriptionPlan.message}</p>}
                  </div>
                  <Input label="Timezone" {...register('timezone')} error={errors.timezone?.message} />
                  <Input label="Currency" {...register('currency')} error={errors.currency?.message} />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
                <Button type="submit" isLoading={createHospitalMutation.isPending}>Register Hospital</Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
