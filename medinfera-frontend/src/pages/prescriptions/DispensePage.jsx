import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Pill, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { prescriptionService } from '../../services/prescriptionService';
import { medicineService } from '../../services/medicineService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';

export const DispensePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: routePrescriptionId } = useParams();
  const queryClient = useQueryClient();
  const prescriptionId = routePrescriptionId || location.state?.prescriptionId;
  const [selections, setSelections] = useState({});

  const { data: prescription, isLoading } = useQuery({
    queryKey: ['prescriptions', prescriptionId],
    queryFn: async () => {
      if (!prescriptionId) return null;
      const res = await prescriptionService.getById(prescriptionId);
      return res.data.data;
    },
    enabled: !!prescriptionId
  });

  const { data: medicines = [] } = useQuery({
    queryKey: ['medicines', 'dispense-inventory'],
    queryFn: async () => {
      const res = await medicineService.getAll({ page: 1, limit: 100 });
      return res.data.data;
    },
    enabled: !!prescriptionId,
  });

  const mutation = useMutation({
    mutationFn: () => prescriptionService.dispense({
      prescriptionId,
      items: (prescription?.items || []).filter(item => selections[item.id]?.batchId).map(item => ({
        prescriptionItemId: item.id,
        medicineId: item.medicineId,
        batchId: selections[item.id].batchId,
        quantity: Number(selections[item.id].quantity),
      })),
    }),
    onSuccess: () => {
      toast.success('Prescription dispensed successfully');
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      navigate('/prescriptions');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to dispense prescription');
    }
  });

  if (!prescriptionId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-900">No Prescription Selected</h2>
        <p className="text-slate-500 mt-2 mb-6">Please select a prescription from the list to dispense.</p>
        <Button onClick={() => navigate('/prescriptions')} icon={ArrowLeft}>Back to Prescriptions</Button>
      </div>
    );
  }

  if (isLoading) return <Skeleton className="h-96 w-full rounded-2xl" />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader 
        title="Dispense Medicine" 
        description={`Fulfilling prescription #${prescription?.id?.slice(-8)}`}
        breadcrumbs={[{ label: 'Prescriptions', path: '/prescriptions' }, { label: 'Dispense' }]}
      />

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-start mb-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center">
                <Pill className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {prescription?.patient?.firstName} {prescription?.patient?.lastName}
                </h3>
                <p className="text-sm text-slate-500">Age: {prescription?.patient?.age} | Gender: {prescription?.patient?.gender}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">Status</p>
              <StatusBadge status={prescription?.status} />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-2">Prescribed Medications</h4>
            <div className="divide-y divide-slate-100">
              {prescription?.items?.map((item) => {
                const batches = medicines.find(medicine => medicine.id === item.medicineId)?.batches || [];
                const selection = selections[item.id] || {};
                const remaining = item.quantityPrescribed - item.quantityDispensed;
                return (
                <div key={item.id} className="py-4 grid grid-cols-1 md:grid-cols-[1fr_12rem_8rem] gap-4 items-center">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900">{item.medicine?.name}</p>
                    <p className="text-sm text-slate-500">
                      <span className="font-medium text-slate-700">{item.dosage}</span> · {item.frequency} · {item.durationDays} days
                    </p>
                    {item.instructions && <p className="text-xs text-primary-600 italic">"{item.instructions}"</p>}
                    <p className="text-xs text-slate-500">Remaining: {remaining}</p>
                  </div>
                  <Select
                    aria-label={`Batch for ${item.medicine?.name}`}
                    value={selection.batchId || ''}
                    onChange={(event) => setSelections(current => ({ ...current, [item.id]: { ...current[item.id], batchId: event.target.value } }))}
                    disabled={!batches.length || remaining <= 0}
                  >
                    <option value="">{batches.length ? 'Select batch' : 'No available stock'}</option>
                    {batches.map(batch => <option key={batch.id} value={batch.id}>{batch.batchNumber} · {batch.quantity} available · expires {new Date(batch.expiryDate).toLocaleDateString()}</option>)}
                  </Select>
                  <Input
                    aria-label={`Quantity for ${item.medicine?.name}`}
                    type="number"
                    min="1"
                    max={Math.min(remaining, batches.find(batch => batch.id === selection.batchId)?.quantity || 0)}
                    value={selection.quantity || ''}
                    onChange={(event) => setSelections(current => ({ ...current, [item.id]: { ...current[item.id], quantity: event.target.value } }))}
                    disabled={!selection.batchId || remaining <= 0}
                  />
                </div>
                );
              })}
            </div>
          </div>

          <div className="mt-10 p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <h5 className="font-semibold text-slate-900 text-sm">Pharmacist Verification</h5>
                <p className="text-xs text-slate-500 mt-1">
                  By clicking confirm, you verify that you have checked the patient's identity and correctly prepared the medications listed above according to the dosage and frequency prescribed.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
            <Button 
              onClick={() => mutation.mutate()} 
              isLoading={mutation.isPending} 
              disabled={!prescription?.items?.some(item => selections[item.id]?.batchId && Number(selections[item.id]?.quantity) > 0) || ['FULLY_DISPENSED', 'CANCELLED', 'EXPIRED'].includes(prescription?.status)}
              icon={CheckCircle2}
            >
              Confirm Dispensing
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
