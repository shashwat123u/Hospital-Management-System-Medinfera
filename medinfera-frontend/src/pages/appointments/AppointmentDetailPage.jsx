import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { appointmentService } from '../../services/appointmentService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { useAuth } from '../../hooks/useAuth';

export const AppointmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [confirmCancel, setConfirmCancel] = React.useState(false);
  
  const { data: appt, isLoading } = useQuery({
    queryKey: ['appointments', id],
    queryFn: async () => {
      const res = await appointmentService.getById(id);
      return res.data.data;
    }
  });

  const cancelMutation = useMutation({
    mutationFn: () => appointmentService.updateStatus(id, 'CANCELLED'),
    onSuccess: () => {
      toast.success('Appointment cancelled');
      setConfirmCancel(false);
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', id] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not cancel appointment'),
  });

  if (isLoading) return <Skeleton className="w-full h-96" />;

  const actions = (
    <div className="flex gap-3">
      <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
      {['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE'].includes(user?.role) && ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'].includes(appt?.status) && (
        <Button variant="danger" onClick={() => setConfirmCancel(true)}>Cancel Appointment</Button>
      )}
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader 
        title={`Appointment Details`} 
        description={`ID: ${appt?.id}`}
        actions={actions}
        breadcrumbs={[{ label: 'Appointments', path: '/appointments' }, { label: 'Details' }]}
      />

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <CardTitle>Overview</CardTitle>
            <StatusBadge status={appt?.status} />
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-slate-500 mb-1">Date</p>
            <p className="font-medium text-slate-900">{appt?.appointmentDate ? new Date(appt.appointmentDate).toLocaleDateString() : '—'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Time</p>
            <p className="font-medium text-slate-900">{appt?.appointmentTime || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Type</p>
            <p className="font-medium text-slate-900">{appt?.type}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-slate-500 mb-1">Patient</p>
            <p className="font-medium text-slate-900">{appt?.patient?.firstName} {appt?.patient?.lastName}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-slate-500 mb-1">Doctor</p>
            <p className="font-medium text-slate-900">{appt?.doctor?.user?.firstName} {appt?.doctor?.user?.lastName}</p>
          </div>
          <div className="col-span-4">
            <p className="text-sm text-slate-500 mb-1">Notes</p>
            <p className="text-slate-900">{appt?.chiefComplaint || appt?.notes || 'No notes provided'}</p>
          </div>
        </CardContent>
      </Card>
      <ConfirmDialog
        isOpen={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={() => cancelMutation.mutate()}
        title="Cancel appointment?"
        message="This will update the appointment status to cancelled."
        confirmText="Cancel appointment"
        isDanger
        isLoading={cancelMutation.isPending}
      />
    </div>
  );
};
