import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { doctorService } from '../../services/doctorService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Skeleton } from '../../components/ui/Skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { DataTable } from '../../components/shared/DataTable';
import { EmptyState } from '../../components/ui/EmptyState';

const ScheduleCard = ({ doctorId }) => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: scheduleResponse, isLoading } = useQuery({
    queryKey: ['doctors', doctorId, 'schedule', today],
    queryFn: async () => {
      const res = await doctorService.getSchedule(doctorId, today);
      return res.data.data;
    }
  });

  const columns = [
    { header: 'Patient', cell: ({ row }) => `${row.original.patient?.firstName || ''} ${row.original.patient?.lastName || ''}`.trim() },
    { header: 'Date', accessorKey: 'appointmentDate', cell: ({ row }) => new Date(row.original.appointmentDate).toLocaleDateString() },
    { header: 'Time', accessorKey: 'appointmentTime' },
    { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  ];

  if (isLoading) return <Skeleton className="w-full h-48" />;

  const schedule = Array.isArray(scheduleResponse) ? scheduleResponse : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Schedule</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {schedule.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No appointments" description="There are no upcoming appointments for today." />
          </div>
        ) : (
          <DataTable columns={columns} data={schedule} />
        )}
      </CardContent>
    </Card>
  );
};

export const DoctorDetailPage = () => {
  const { id } = useParams();
  
  const { data: response, isLoading } = useQuery({
    queryKey: ['doctors', id],
    queryFn: async () => {
      const res = await doctorService.getById(id);
      return res.data.data;
    }
  });

  if (isLoading) return <Skeleton className="w-full h-96" />;
  
  const doctor = response;
  if (!doctor) return <EmptyState title="Doctor not found" description="The requested doctor could not be found." />;

  const firstName = doctor.user?.firstName || '';
  const lastName = doctor.user?.lastName || '';
  const fallback = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();

  return (
    <div className="space-y-6">
      <PageHeader title={`${firstName} ${lastName}`} description={doctor.specialization} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar fallback={fallback} size="xl" className="h-24 w-24 text-3xl" />
              <div>
                <h3 className="text-xl font-bold text-slate-900">Dr. {firstName} {lastName}</h3>
                <p className="text-primary-600 font-medium">{doctor.specialization}</p>
              </div>
                <StatusBadge status={doctor.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'} />
            </div>
            
            <div className="mt-6 space-y-4 pt-6 border-t border-slate-100">
              <div>
                <p className="text-sm text-slate-500 font-medium">Qualification</p>
                <p className="text-slate-900">{doctor.qualification || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Registration Number</p>
                <p className="text-slate-900">{doctor.licenseNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Phone Number</p>
                <p className="text-slate-900">{doctor.user?.phone || doctor.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Email</p>
                <p className="text-slate-900">{doctor.user?.email || doctor.email || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="md:col-span-2 space-y-6">
          <ScheduleCard doctorId={id} />
        </div>
      </div>
    </div>
  );
};
