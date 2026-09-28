import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../../services/authService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and a number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const { changePassword } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data) => changePassword({
      currentPassword: data.currentPassword, 
      newPassword: data.newPassword 
    }),
    onSuccess: () => {
      toast.success('Password changed successfully');
      reset();
      navigate('/login', { replace: true });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  });

  const onSubmit = (data) => {
    changePasswordMutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader 
        title="Change Password" 
        description="Update your account password for security."
      />
      
      <Card>
        <CardContent>
          <div onSubmit={handleSubmit(onSubmit)} as="form">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-4">
              <Input
                label="Current Password"
                type="password"
                {...register('currentPassword')}
                error={errors.currentPassword?.message}
              />
              
              <Input
                label="New Password"
                type="password"
                {...register('newPassword')}
                error={errors.newPassword?.message}
              />
              
              <Input
                label="Confirm New Password"
                type="password"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
              />
              
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={changePasswordMutation.isPending}>
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
