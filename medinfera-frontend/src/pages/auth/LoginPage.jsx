import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const LoginPage = () => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      toast.success('Successfully logged in');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <Card className="w-full border-none shadow-none sm:shadow-sm sm:border-slate-100 p-0 sm:p-8 bg-transparent sm:bg-white">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in</h1>
        <p className="text-sm text-slate-500 mt-2">Enter your credentials to access your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="relative">
          <Input
            id="email"
            label="Email address"
            type="email"
            placeholder="name@hospital.com"
            autoComplete="email"
            {...register('email')}
            error={errors.email?.message}
            className="pl-10"
          />
          <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-9 pointer-events-none" />
        </div>

        <div className="relative">
          <Input
            id="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
            {...register('password')}
            error={errors.password?.message}
            className="pl-10 pr-10"
          />
          <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-9 pointer-events-none" />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <Button
          type="submit"
          className="w-full h-11"
          isLoading={isSubmitting}
        >
          Sign in
        </Button>
      </form>

      <div className="mt-8 border-t border-slate-100 pt-6">
        <h2 className="mb-4 text-center text-xs font-semibold uppercase text-slate-500">Select a demo profile</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[
            { label: 'Super Admin', email: 'superadmin@medinfera.com' },
            { label: 'Admin', email: 'admin@medinfera.com' },
            { label: 'Doctor', email: 'doctor@medinfera.com' },
            { label: 'Patient', email: 'patient@medinfera.com' },
            { label: 'Pharmacist', email: 'pharmacist@medinfera.com' },
            { label: 'Staff', email: 'staff@medinfera.com' },
          ].map((profile) => (
            <button
              key={profile.email}
              type="button"
              onClick={() => setValue('email', profile.email, { shouldValidate: true })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-left transition-colors hover:border-primary-300 hover:bg-primary-50"
            >
              <span className="block text-sm font-medium text-slate-800">{profile.label}</span>
              <span className="block truncate text-xs text-slate-500">{profile.email}</span>
            </button>
          ))}
        </div>
      </div>

    </Card>
  );
};
