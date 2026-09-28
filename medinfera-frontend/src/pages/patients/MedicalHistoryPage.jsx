import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ClipboardList, Activity, Stethoscope, Pill, AlertCircle } from 'lucide-react';
import { patientService } from '../../services/patientService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { Badge } from '../../components/ui/Badge';

export const MedicalHistoryPage = () => {
  const { id } = useParams();

  const { data: patient, isLoading: isPatientLoading } = useQuery({
    queryKey: ['patients', id],
    queryFn: async () => {
      const res = await patientService.getById(id);
      return res.data.data;
    }
  });

  const { data: history, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['patients', id, 'medical-history'],
    queryFn: async () => {
      const res = await patientService.getMedicalHistory(id);
      return res.data.data;
    }
  });

  if (isPatientLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-2xl md:col-span-1" />
          <Skeleton className="h-96 rounded-2xl md:col-span-2" />
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Patients', path: '/patients' },
    { label: `${patient?.firstName} ${patient?.lastName}`, path: `/patients/${id}` },
    { label: 'Medical History' },
  ];

  const historyItems = [
    ...(history?.appointments || []).map(item => ({
      id: item.id,
      date: item.appointmentDate,
      title: `Appointment · ${item.type}`,
      detail: item.chiefComplaint || item.status,
      clinician: `Dr. ${item.doctor?.user?.firstName || ''} ${item.doctor?.user?.lastName || ''}`.trim(),
    })),
    ...(history?.admissions || []).map(item => ({
      id: item.id,
      date: item.admissionDate,
      title: `Admission · ${item.admissionNumber}`,
      detail: item.finalDiagnosis || item.provisionalDiagnosis || item.reasonForAdmission,
      clinician: item.ward?.name || 'Inpatient admission',
    })),
    ...(history?.prescriptions || []).map(item => ({
      id: item.id,
      date: item.createdAt,
      title: 'Prescription',
      detail: item.notes || item.items?.map(medicine => medicine.medicine?.name).filter(Boolean).join(', '),
      clinician: `Dr. ${item.doctor?.user?.firstName || ''} ${item.doctor?.user?.lastName || ''}`.trim(),
    })),
    ...(history?.labOrders || []).map(item => ({
      id: item.id,
      date: item.createdAt,
      title: `Lab order · ${item.orderNumber}`,
      detail: item.items?.map(test => test.labTest?.name).filter(Boolean).join(', ') || item.status,
      clinician: item.status,
    })),
  ].filter(item => item.date).sort((left, right) => new Date(right.date) - new Date(left.date));

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Medical History" 
        description={`Complete medical records for ${patient?.firstName} ${patient?.lastName}`}
        breadcrumbs={breadcrumbs}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Summary Side Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary-600" />
              Quick Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500">Blood Group</span>
                <Badge variant="danger">{patient?.bloodGroup || 'Not Set'}</Badge>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">Allergies</span>
                <div className="flex flex-wrap gap-2">
                  {patient?.allergies?.length > 0 ? (
                    patient.allergies.map((allergy, i) => (
                      <Badge key={i} variant="warning" className="bg-amber-50 text-amber-700 border border-amber-100">
                        {allergy}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400 italic">No known allergies</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">Pre-existing Conditions</span>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {patient?.chronicConditions?.length ? patient.chronicConditions.join(', ') : 'No pre-existing conditions recorded.'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900 border-none text-white">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              Emergency Contact
            </h3>
            <div className="space-y-3">
              <p className="text-slate-400 text-xs uppercase tracking-widest">Name</p>
              <p className="text-white font-medium">{patient?.emergencyContactName || 'N/A'}</p>
              <p className="text-slate-400 text-xs uppercase tracking-widest">Relation</p>
              <p className="text-white font-medium">{patient?.emergencyContactRelation || 'N/A'}</p>
              <p className="text-slate-400 text-xs uppercase tracking-widest">Phone</p>
              <p className="text-white font-medium">{patient?.emergencyContactPhone || 'N/A'}</p>
            </div>
          </Card>
        </div>

        {/* Timeline of History */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <h3 className="font-semibold text-slate-800 mb-8 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-600" />
              Medical Timeline
            </h3>

            {isHistoryLoading ? (
              <div className="space-y-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-2xl" />
                ))}
              </div>
            ) : historyItems.length > 0 ? (
              <div className="relative border-l-2 border-slate-100 ml-4 pl-8 space-y-12">
                {historyItems.map((event) => (
                  <div key={event.id} className="relative">
                    {/* Timeline Dot */}
                    <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full border-4 border-white bg-primary-600 shadow-sm"></div>
                    
                    <div className="flex flex-col gap-1 mb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {format(new Date(event.date), 'dd MMM yyyy')}
                      </span>
                      <h4 className="text-lg font-bold text-slate-900">{event.title}</h4>
                    </div>
                    
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <Stethoscope className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 font-medium">Details</p>
                            <p className="text-sm text-slate-600 line-clamp-2">{event.detail || 'No details recorded.'}</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Pill className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 font-medium">Provider / status</p>
                            <p className="text-sm font-semibold text-slate-800">{event.clinician || '—'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <ClipboardList className="w-10 h-10 text-slate-300" />
                </div>
                <h4 className="text-slate-900 font-medium text-lg">No history recorded</h4>
                <p className="text-sm text-slate-500 max-w-[300px] mt-2">
                  There are no previous medical records or diagnoses for this patient in the system.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
