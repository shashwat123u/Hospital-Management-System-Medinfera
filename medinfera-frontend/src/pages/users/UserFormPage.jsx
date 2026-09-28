import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { userService } from '../../services/userService';
import { useAuth } from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { hospitalService } from '../../services/hospitalService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';

const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB_TECHNICIAN', 'PHARMACIST', 'BILLING', 'PATIENT', 'DRIVER', 'STAFF'], {
    errorMap: () => ({ message: 'Role is required' })
  }),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and a number'),
  employeeCode: z.string().optional(),
  department: z.string().optional(),
  hospitalId: z.string().uuid().optional(),
});

export const UserFormPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'STAFF',
      password: '',
      employeeCode: '',
      department: '',
    }
  });
  const selectedRole = watch('role');

  const { data: hospitals = [] } = useQuery({
    queryKey: ['hospitals', 'user-form'],
    queryFn: async () => {
      const response = await hospitalService.getAll({ page: 1, limit: 100 });
      return response.data.data;
    },
    enabled: isSuperAdmin,
  });

  const createUserMutation = useMutation({
    mutationFn: (data) => {
      const payload = { ...data };
      if (payload.role === 'SUPER_ADMIN' || !isSuperAdmin) delete payload.hospitalId;
      return userService.create(payload);
    },
    onSuccess: () => {
      toast.success('User created successfully');
      queryClient.invalidateQueries(['users']);
      navigate('/users');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  });

  const onSubmit = (data) => {
    if (isSuperAdmin && data.role !== 'SUPER_ADMIN' && !data.hospitalId) {
      toast.error('Select a hospital for this account');
      return;
    }
    createUserMutation.mutate(data);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader 
        title="New User" 
        description="Add a new user to the system." 
        breadcrumbs={[
          { label: 'Users', path: '/users' }, 
          { label: 'New User' }
        ]} 
      />
      <Card>
        <CardContent>
          <div onSubmit={handleSubmit(onSubmit)} as="form">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="First Name" 
                  {...register('firstName')} 
                  error={errors.firstName?.message} 
                />
                <Input 
                  label="Last Name" 
                  {...register('lastName')} 
                  error={errors.lastName?.message} 
                />
              </div>
              <Input 
                label="Email" 
                type="email" 
                {...register('email')} 
                error={errors.email?.message} 
              />
              <Input 
                label="Phone" 
                {...register('phone')} 
                error={errors.phone?.message} 
              />
              <Select 
                label="Role" 
                {...register('role')} 
                error={errors.role?.message}
              >
                <option value="ADMIN">Admin</option>
                <option value="DOCTOR">Doctor</option>
                <option value="NURSE">Nurse</option>
                <option value="RECEPTIONIST">Receptionist</option>
                <option value="LAB_TECHNICIAN">Lab Technician</option>
                <option value="PHARMACIST">Pharmacist</option>
                <option value="BILLING">Billing</option>
                <option value="PATIENT">Patient</option>
                <option value="DRIVER">Driver</option>
                <option value="STAFF">Staff</option>
                {isSuperAdmin && <option value="SUPER_ADMIN">Super Admin</option>}
              </Select>
              {isSuperAdmin && selectedRole !== 'SUPER_ADMIN' && (
                <Select label="Hospital" {...register('hospitalId')} error={errors.hospitalId?.message} required>
                  <option value="">Select a hospital</option>
                  {hospitals.map(hospital => <option key={hospital.id} value={hospital.id}>{hospital.name} ({hospital.code})</option>)}
                </Select>
              )}
              <Input 
                label="Password" 
                type="password" 
                {...register('password')} 
                error={errors.password?.message} 
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="Employee Code" 
                  {...register('employeeCode')} 
                  error={errors.employeeCode?.message} 
                />
                <Input 
                  label="Department" 
                  {...register('department')} 
                  error={errors.department?.message} 
                />
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-4">
                <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
                <Button type="submit" isLoading={createUserMutation.isPending}>Save User</Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
