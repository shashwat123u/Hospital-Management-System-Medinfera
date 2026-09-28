import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { appointmentService } from '../../services/appointmentService';
import { doctorService } from '../../services/doctorService';
import { patientService } from '../../services/patientService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';

const appointmentSchema = z.object({
  doctorId: z.string().min(1, 'Doctor is required'),
  patientId: z.string().min(1, 'Patient is required'),
  date: z.string().min(1, 'Date is required'),
  appointmentTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Select an available time'),
  type: z.enum(['CONSULTATION', 'FOLLOW_UP', 'EMERGENCY', 'TELECONSULT']),
  chiefComplaint: z.string().optional(),
  notes: z.string().optional(),
});

export const BookAppointmentPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: { type: 'CONSULTATION' }
  });
  const doctorId = watch('doctorId');
  const date = watch('date');

  const { data: doctorsData } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const res = await doctorService.getAll({ limit: 100 });
      return res.data.data;
    }
  });

  const { data: patientsData } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const res = await patientService.getAll({ limit: 100 });
      return res.data.data;
    }
  });

  const { data: slots = [], isLoading: isSlotsLoading, isError: isSlotsError } = useQuery({
    queryKey: ['appointments', 'slots', doctorId, date],
    queryFn: async () => {
      const res = await doctorService.getSlots(doctorId, date);
      return res.data.data.slots;
    },
    enabled: Boolean(doctorId && date),
  });

  const mutation = useMutation({
    mutationFn: ({ date: appointmentDate, ...data }) => appointmentService.create({
      ...data,
      appointmentDate: `${appointmentDate}T00:00:00.000Z`,
    }),
    onSuccess: () => {
      toast.success('Appointment booked successfully');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      navigate('/appointments');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader 
        title="Book Appointment" 
        description="Schedule a new appointment"
        breadcrumbs={[{ label: 'Appointments', path: '/appointments' }, { label: 'Book' }]}
      />

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))}>
        <Card className="mb-6">
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label="Select Doctor" {...register('doctorId')} error={errors.doctorId?.message}>
                <option value="">Select a doctor</option>
                {doctorsData?.map(d => (
                  <option key={d.id} value={d.id}>{d.user?.firstName} {d.user?.lastName} - {d.specialization}</option>
                ))}
              </Select>
              
              <Select label="Select Patient" {...register('patientId')} error={errors.patientId?.message}>
                <option value="">Select a patient</option>
                {patientsData?.map(p => (
                  <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.phone})</option>
                ))}
              </Select>

              <Input label="Date" type="date" {...register('date')} error={errors.date?.message} />
              
              <Select label="Available time" {...register('appointmentTime')} error={errors.appointmentTime?.message} disabled={!doctorId || !date || isSlotsLoading}>
                <option value="">{isSlotsLoading ? 'Loading available times...' : 'Select an available time'}</option>
                {slots.filter(slot => slot.available).map(slot => (
                  <option key={slot.time} value={slot.time}>{slot.time}</option>
                ))}
              </Select>
              {isSlotsError && <p className="text-sm text-red-600 md:col-span-2">Available times could not be loaded.</p>}

              <Select label="Appointment Type" {...register('type')} error={errors.type?.message}>
                <option value="CONSULTATION">Consultation</option>
                <option value="FOLLOW_UP">Follow Up</option>
                <option value="EMERGENCY">Emergency</option>
                <option value="TELECONSULT">Teleconsultation</option>
              </Select>

              <div className="md:col-span-2">
                <Textarea label="Chief complaint" {...register('chiefComplaint')} error={errors.chiefComplaint?.message} />
                <Textarea label="Notes" {...register('notes')} error={errors.notes?.message} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" isLoading={mutation.isPending}>Book Appointment</Button>
        </div>
      </form>
    </div>
  );
};
