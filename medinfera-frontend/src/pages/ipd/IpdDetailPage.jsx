import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { ipdService } from '../../services/ipdService';
import { patientService } from '../../services/patientService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Tabs } from '../../components/ui/Tabs';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { DataTable } from '../../components/shared/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { bedService } from '../../services/bedService';
import { useAuth } from '../../hooks/useAuth';

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
    return <EmptyState title="No vitals recorded" description="There are no vitals recorded for this patient yet." />;
  }

  return (
    <div className="p-4 border rounded-xl bg-white">
      <DataTable columns={columns} data={vitals} />
    </div>
  );
};

const NotesTab = ({ admissionId, notes = [], canAddNote }) => {
  const queryClient = useQueryClient();
  const [note, setNote] = useState('');

  const addNoteMutation = useMutation({
    mutationFn: (content) => ipdService.addNote(admissionId, { noteType: 'PROGRESS', content }),
    onSuccess: () => {
      toast.success('Note added successfully');
      setNote('');
      queryClient.invalidateQueries({ queryKey: ['ipd', admissionId] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add note');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    addNoteMutation.mutate(note.trim());
  };

  return (
    <div className="p-4 border rounded-xl bg-white space-y-6">
      <div className="space-y-4">
        {notes.length === 0 ? (
          <EmptyState title="No notes" description="There are no notes for this admission." />
        ) : (
          <div className="space-y-4">
            {notes.map((n, idx) => (
              <div key={n.id || idx} className="border-b pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-sm">
                    {n.noteType}
                  </span>
                  <span className="text-xs text-slate-500">
                    {n.writtenAt ? format(new Date(n.writtenAt), 'dd MMM yyyy, hh:mm a') : ''}
                  </span>
                </div>
                <p className="text-sm text-slate-700">{n.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {canAddNote && <div className="pt-4 border-t">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea 
            placeholder="Add a new note..." 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end">
            <Button type="submit" isLoading={addNoteMutation.isPending} disabled={!note.trim()}>
              Add Note
            </Button>
          </div>
        </form>
      </div>}
    </div>
  );
};

export const IpdDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isDischargeOpen, setDischargeOpen] = useState(false);
  const [isTransferOpen, setTransferOpen] = useState(false);
  const [finalDiagnosis, setFinalDiagnosis] = useState('');
  const [treatmentSummary, setTreatmentSummary] = useState('');
  const [dischargeNotes, setDischargeNotes] = useState('');
  const [toBedId, setToBedId] = useState('');
  
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['ipd', id],
    queryFn: async () => {
      const res = await ipdService.getById(id);
      return res.data.data;
    }
  });

  const { data: availableBeds = [] } = useQuery({
    queryKey: ['beds', 'available-transfer'],
    queryFn: async () => {
      const res = await bedService.getAll({ status: 'AVAILABLE', limit: 100 });
      return res.data.data;
    },
    enabled: isTransferOpen,
  });

  if (isLoading) return <Skeleton className="w-full h-96" />;
  if (isError || !response) return <EmptyState title="Error" description="Failed to load admission details." />;

  const admission = response;

  const tabs = [
    { 
      id: 'overview', 
      label: 'Overview', 
      content: (
        <div className="p-4 border rounded-xl bg-white space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-slate-500">Patient</p>
              <Link to={`/patients/${admission.patient?.id}`} className="font-medium text-primary-600 hover:underline">
                {admission.patient?.user?.firstName} {admission.patient?.user?.lastName}
              </Link>
            </div>
            <div>
              <p className="text-sm text-slate-500">Ward / Bed</p>
              <p className="font-medium">{admission.ward?.name} / {admission.bed?.bedNumber}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Admitting Doctor</p>
              <p className="font-medium">{admission.primaryDoctor?.user?.firstName} {admission.primaryDoctor?.user?.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Admission Date</p>
              <p className="font-medium">{admission.admissionDate ? format(new Date(admission.admissionDate), 'dd MMM yyyy') : 'N/A'}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-slate-500 mb-1">Diagnosis</p>
            <p className="text-sm bg-slate-50 p-3 rounded-lg border">{admission.provisionalDiagnosis || admission.reasonForAdmission || 'No diagnosis provided.'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500 mb-1">Insurance Provider</p>
              <p className="font-medium">{admission.patient?.insuranceProvider || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Insurance Policy Number</p>
              <p className="font-medium">{admission.patient?.insurancePolicyNumber || 'N/A'}</p>
            </div>
          </div>

          {admission.treatmentSummary && (
            <div>
              <p className="text-sm text-slate-500 mb-1">Discharge Summary</p>
              <p className="text-sm bg-slate-50 p-3 rounded-lg border">{admission.treatmentSummary}</p>
            </div>
          )}
        </div>
      )
    },
    { 
      id: 'vitals', 
      label: 'Vitals', 
      content: <VitalsTab patientId={admission.patient?.id} /> 
    },
    { 
      id: 'notes', 
      label: 'Notes', 
      content: <NotesTab admissionId={id} notes={admission.notes || []} canAddNote={['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE'].includes(user?.role)} />
    },
  ];

  const dischargeMutation = useMutation({
    mutationFn: (data) => ipdService.discharge(id, data),
    onSuccess: () => {
      toast.success('Patient discharged successfully');
      setDischargeOpen(false);
      queryClient.invalidateQueries({ queryKey: ['ipd', id] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to discharge patient');
    },
  });

  const transferMutation = useMutation({
    mutationFn: () => ipdService.transferBed(id, toBedId),
    onSuccess: () => {
      setTransferOpen(false);
      setToBedId('');
      queryClient.invalidateQueries({ queryKey: ['ipd', id] });
      queryClient.invalidateQueries({ queryKey: ['beds'] });
      toast.success('Bed transfer completed');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to transfer bed'),
  });

  const actions = (
    <div className="flex gap-2">
      <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
      {!['DISCHARGED', 'DECEASED'].includes(admission.status) && ['ADMIN', 'NURSE', 'DOCTOR'].includes(user?.role) && (
        <>
          <Button variant="outline" onClick={() => setTransferOpen(true)}>Transfer Bed</Button>
        </>
      )}
      {!['DISCHARGED', 'DECEASED'].includes(admission.status) && ['ADMIN', 'DOCTOR'].includes(user?.role) && (
        <Button variant="danger" onClick={() => setDischargeOpen(true)} isLoading={dischargeMutation.isPending}>Discharge Patient</Button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="IPD Details" 
        description={`Admission ID: ${admission.id}`}
        actions={actions}
      />
      <div className="bg-white rounded-2xl border p-4">
        <Tabs tabs={tabs} defaultTab="overview" />
      </div>

      <Modal isOpen={isDischargeOpen} onClose={() => setDischargeOpen(false)} title="Discharge patient">
        <form onSubmit={(event) => { event.preventDefault(); dischargeMutation.mutate({ finalDiagnosis, treatmentSummary, dischargeNotes }); }} className="space-y-4">
          <Input label="Final diagnosis" value={finalDiagnosis} onChange={(event) => setFinalDiagnosis(event.target.value)} required />
          <Textarea label="Treatment summary" value={treatmentSummary} onChange={(event) => setTreatmentSummary(event.target.value)} rows={3} />
          <Textarea label="Discharge notes" value={dischargeNotes} onChange={(event) => setDischargeNotes(event.target.value)} rows={3} />
          <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setDischargeOpen(false)}>Cancel</Button><Button type="submit" variant="danger" isLoading={dischargeMutation.isPending}>Confirm discharge</Button></div>
        </form>
      </Modal>

      <Modal isOpen={isTransferOpen} onClose={() => setTransferOpen(false)} title="Transfer bed">
        <form onSubmit={(event) => { event.preventDefault(); transferMutation.mutate(); }} className="space-y-4">
          <Select label="Available bed" value={toBedId} onChange={(event) => setToBedId(event.target.value)} required>
            <option value="">Select a bed</option>
            {availableBeds.filter(bed => bed.id !== admission.bedId).map(bed => <option key={bed.id} value={bed.id}>{bed.ward?.name || bed.wardId} · {bed.bedNumber} · {bed.bedType}</option>)}
          </Select>
          <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setTransferOpen(false)}>Cancel</Button><Button type="submit" isLoading={transferMutation.isPending} disabled={!toBedId}>Transfer bed</Button></div>
        </form>
      </Modal>
    </div>
  );
};
