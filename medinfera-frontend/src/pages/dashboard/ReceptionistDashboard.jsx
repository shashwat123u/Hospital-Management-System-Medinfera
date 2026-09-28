import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarCheck, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatsCard } from '../../components/shared/StatsCard';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { DataTable } from '../../components/shared/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';

import { dashboardService } from '../../services/dashboardService';

export const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      const res = await dashboardService.getSummary();
      return res.data?.data || {};
    }
  });

  const columns = [
    { header: 'Time', accessorKey: 'time' },
    { header: 'Patient', accessorKey: 'patient' },
    { header: 'Doctor', accessorKey: 'doctor' },
    { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  ];

  const actions = (
    <div className="flex gap-3">
      <Button icon={Users} onClick={() => navigate('/patients/register')}>Walk-in Registration</Button>
      <Button icon={CalendarCheck} variant="secondary" onClick={() => navigate('/appointments/book')}>Book Appt</Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Reception Dashboard" description="Manage today's front desk operations." actions={actions} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Today's Appointments" value={stats?.todayAppointments || 0} icon={CalendarCheck} color="primary" />
        <StatsCard title="Walk-in Registrations" value={stats?.walkInRegistrations || 0} icon={Users} color="success" />
        <StatsCard title="Pending Confirmation" value={stats?.pendingAppointments || 0} icon={Clock} color="warning" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Appointment List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable 
            columns={columns} 
            data={stats?.appointments || []} 
            isLoading={isLoading} 
          />
        </CardContent>
      </Card>
    </div>
  );
};
