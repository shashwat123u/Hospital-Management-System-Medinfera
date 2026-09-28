import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { patientService } from '../../services/patientService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { Tabs } from '../../components/ui/Tabs';
import { EmptyState } from '../../components/ui/EmptyState';
import { DataTable } from '../../components/shared/DataTable';
import { format } from 'date-fns';

const VitalsTab = ({ patientId }) => {
  const { data: vitalsResponse, isLoading } = useQuery({
    queryKey: ['patients', patientId, 'vitals'],
    queryFn: async () => {
      const res = await patientService.getVitals(patientId);
      return res.data.data;
    },
    enabled: !!patientId,
  });

  const columns = [
    { header: 'Date', accessorKey: 'recordedAt', cell: ({ row }) => format(new Date(row.original.recordedAt), 'dd MMM yyyy, hh:mm a') },
    { header: 'BP', cell: ({ row }) => `${row.original.bpSystolic ?? '—'}/${row.original.bpDiastolic ?? '—'}` },
    { header: 'Heart Rate', accessorKey: 'heartRate' },
    { header: 'Temperature °C', accessorKey: 'temperatureCelsius' },
    { header: 'SpO2', accessorKey: 'oxygenSaturation' },
    { header: 'Weight kg', accessorKey: 'weightKg' },
  ];

  if (isLoading) return <Skeleton className="w-full h-48" />;

  const vitals = Array.isArray(vitalsResponse) ? vitalsResponse : vitalsResponse?.data || [];

  if (vitals.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <EmptyState title="No vitals recorded yet" description="There are no vitals recorded for this patient." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <DataTable columns={columns} data={vitals} />
      </CardContent>
    </Card>
  );
};

export const PatientDetailPage = () => {
  const { id } = useParams();
  
  const { data: patient, isLoading } = useQuery({
    queryKey: ['patients', id],
    queryFn: async () => {
      const res = await patientService.getById(id);
      return res.data.data;
    }
  });

  if (isLoading) return <Skeleton className="w-full h-96" />;
  if (!patient) return <EmptyState title="Patient not found" description="The requested patient record could not be loaded." />;

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <Card>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6">
            <div>
              <p className="text-sm text-slate-500 mb-1">Blood Group</p>
              <p className="font-medium text-slate-900">{patient?.bloodGroup}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Gender</p>
              <p className="font-medium text-slate-900">{patient?.gender}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">DOB</p>
              <p className="font-medium text-slate-900">{patient?.dateOfBirth ? format(new Date(patient.dateOfBirth), 'dd MMM yyyy') : 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Phone</p>
              <p className="font-medium text-slate-900">{patient?.phone}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-slate-500 mb-1">Address</p>
              <p className="font-medium text-slate-900">{patient?.address}, {patient?.city}, {patient?.state} {patient?.pincode}</p>
            </div>
          </CardContent>
        </Card>
      )
    },
    {
      id: 'history',
      label: 'Medical History',
      content: (
        <Card>
          <CardContent className="pt-6">
            <h4 className="font-semibold text-slate-800 mb-2">Allergies</h4>
            <p className="text-slate-600 mb-6">{patient?.allergies?.length ? patient.allergies.join(', ') : 'None recorded'}</p>
            
            <h4 className="font-semibold text-slate-800 mb-2">Past Medical History</h4>
            <p className="text-slate-600">{patient?.chronicConditions?.length ? patient.chronicConditions.join(', ') : 'None recorded'}</p>
          </CardContent>
        </Card>
      )
    },
    {
      id: 'vitals',
      label: 'Vitals',
      content: <VitalsTab patientId={id} />
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title={`${patient?.firstName} ${patient?.lastName}`} 
        description={`Patient ID: ${patient?.id}`}
        breadcrumbs={[{ label: 'Patients', path: '/patients' }, { label: 'Details' }]}
      />

      <Tabs tabs={tabs} defaultTab="overview" />
    </div>
  );
};
