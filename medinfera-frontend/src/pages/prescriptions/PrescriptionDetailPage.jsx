import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { prescriptionService } from '../../services/prescriptionService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { StatusBadge } from '../../components/shared/StatusBadge';

export const PrescriptionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: prescription, isLoading, isError } = useQuery({
    queryKey: ['prescriptions', id],
    queryFn: async () => (await prescriptionService.getById(id)).data.data,
  });

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (isError || !prescription) return <EmptyState title="Prescription unavailable" description="The prescription could not be loaded." />;

  const canDispense = ['ADMIN', 'PHARMACIST'].includes(user?.role)
    && ['ACTIVE', 'PARTIALLY_DISPENSED'].includes(prescription.status)
    && prescription.items?.some(item => item.quantityDispensed < item.quantityPrescribed);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Prescription"
        description={`Issued ${new Date(prescription.createdAt).toLocaleDateString()}`}
        breadcrumbs={[{ label: 'Prescriptions', path: '/prescriptions' }, { label: 'Details' }]}
        actions={<StatusBadge status={prescription.status} />}
      />
      <Card>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><p className="text-xs uppercase text-slate-500">Patient</p><p className="mt-1 font-medium">{prescription.patient?.firstName} {prescription.patient?.lastName}</p></div>
            <div><p className="text-xs uppercase text-slate-500">Prescribing doctor</p><p className="mt-1 font-medium">Dr. {prescription.doctor?.user?.firstName} {prescription.doctor?.user?.lastName}</p></div>
            {prescription.validUntil && <div><p className="text-xs uppercase text-slate-500">Valid until</p><p className="mt-1 font-medium">{new Date(prescription.validUntil).toLocaleDateString()}</p></div>}
          </div>
          {prescription.notes && <div><p className="text-xs uppercase text-slate-500">Notes</p><p className="mt-1 whitespace-pre-wrap text-slate-700">{prescription.notes}</p></div>}
          <div className="border-t border-slate-100 pt-4">
            <h2 className="mb-3 font-semibold text-slate-900">Prescribed items</h2>
            <div className="divide-y divide-slate-100">
              {prescription.items?.map(item => (
                <div key={item.id} className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 py-4">
                  <div>
                    <p className="font-medium text-slate-900">{item.medicine?.name}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.dosage} · {item.frequency}{item.durationDays ? ` · ${item.durationDays} days` : ''}</p>
                    {item.instructions && <p className="mt-1 text-sm text-slate-500">{item.instructions}</p>}
                  </div>
                  <p className="text-sm text-slate-600">{item.quantityDispensed} / {item.quantityPrescribed} dispensed</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button variant="secondary" onClick={() => navigate('/prescriptions')}>Back to prescriptions</Button>
            {canDispense && <Button onClick={() => navigate(`/prescriptions/${prescription.id}/dispense`)}>Dispense remaining</Button>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
