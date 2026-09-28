import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { appointmentService } from '../../services/appointmentService';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/shared/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';

export const AppointmentListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const { user } = useAuth();
  const canBook = ['ADMIN', 'RECEPTIONIST', 'DOCTOR'].includes(user?.role);

  const { data, isLoading } = useQuery({
    queryKey: ['appointments', { page, status, date }],
    queryFn: async () => {
      const res = await appointmentService.getAll({ page, limit: 10, ...(status && { status }), ...(date && { date }) });
      return res.data;
    }
  });

  const columns = [
    { header: 'Appt ID', accessorKey: 'id' },
    { header: 'Patient', cell: ({ row }) => row.original.patient?.firstName + ' ' + row.original.patient?.lastName },
    { header: 'Doctor', cell: ({ row }) => `${row.original.doctor?.user?.firstName || ''} ${row.original.doctor?.user?.lastName || ''}`.trim() },
    { header: 'Date', accessorKey: 'appointmentDate', cell: ({ row }) => new Date(row.original.appointmentDate).toLocaleDateString() },
    { header: 'Time', accessorKey: 'appointmentTime' },
    { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  ];

  const actions = canBook ? (
    <Button icon={CalendarPlus} onClick={() => navigate('/appointments/book')}>
      Book Appointment
    </Button>
  ) : null;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Appointments" 
        description="Manage hospital appointments and schedules." 
        actions={actions}
      />

      <div className="flex flex-wrap gap-3">
        <Select aria-label="Filter appointments by status" className="w-56" value={status} onChange={(event) => { setPage(1); setStatus(event.target.value); }}>
          <option value="">All statuses</option>
          {['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED'].map(value => <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>)}
        </Select>
        <Input aria-label="Filter appointments by date" className="w-52" type="date" value={date} onChange={(event) => { setPage(1); setDate(event.target.value); }} />
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        pagination={{ page, totalPages: data?.pagination?.totalPages || 1 }}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/appointments/${row.id}`)}
        emptyStateTitle="No appointments found"
        emptyStateDescription="No appointments match your criteria."
      />
    </div>
  );
};
