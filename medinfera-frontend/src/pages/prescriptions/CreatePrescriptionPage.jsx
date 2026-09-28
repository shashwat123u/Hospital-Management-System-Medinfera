import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, Pill, User, Clipboard, Send } from 'lucide-react';
import { prescriptionService } from '../../services/prescriptionService';
import { patientService } from '../../services/patientService';
import { medicineService } from '../../services/medicineService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';

const prescriptionSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  diagnosis: z.string().min(3, 'Diagnosis is required'),
  medicines: z.array(z.object({
    medicineId: z.string().min(1, 'Medicine is required'),
    dosage: z.string().min(1, 'Dosage is required'),
    frequency: z.string().min(1, 'Frequency is required'),
    durationDays: z.number().int().min(1, 'Duration must be at least one day'),
    quantityPrescribed: z.number().int().min(1, 'Quantity must be at least one'),
    instructions: z.string().optional(),
  })).min(1, 'At least one medicine is required'),
  notes: z.string().optional(),
});

export const CreatePrescriptionPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      medicines: [{ medicineId: '', dosage: '', frequency: '', durationDays: 1, quantityPrescribed: 1, instructions: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'medicines'
  });

  const { data: patients } = useQuery({
    queryKey: ['patients', 'all'],
    queryFn: async () => {
      const res = await patientService.getAll({ limit: 100 });
      return res.data.data;
    }
  });

  const { data: availableMedicines } = useQuery({
    queryKey: ['medicines', 'all'],
    queryFn: async () => {
      const res = await medicineService.getAll({ limit: 200 });
      return res.data.data;
    }
  });

  const mutation = useMutation({
    mutationFn: ({ diagnosis, medicines, notes }) => prescriptionService.create({
      notes: [`Diagnosis: ${diagnosis}`, notes].filter(Boolean).join('\n\n'),
      items: medicines,
    }),
    onSuccess: (res) => {
      toast.success('Prescription created successfully');
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      navigate(`/prescriptions/${res.data.data.id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create prescription');
    }
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader 
        title="Create Prescription" 
        description="Issue a new medication prescription for a patient."
        breadcrumbs={[{ label: 'Prescriptions', path: '/prescriptions' }, { label: 'New' }]}
      />

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="space-y-4 pt-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider mb-2">
                  <User className="w-4 h-4 text-primary-600" />
                  Patient Selection
                </h3>
                <Select label="Select Patient" {...register('patientId')} error={errors.patientId?.message}>
                  <option value="">Select a patient</option>
                  {patients?.map(p => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.id.slice(-6)})</option>
                  ))}
                </Select>
                <div className="pt-2">
                  <Input label="Diagnosis" {...register('diagnosis')} error={errors.diagnosis?.message} placeholder="e.g. Type 2 Diabetes" />
                </div>
                <Textarea label="General Notes" {...register('notes')} error={errors.notes?.message} rows={4} placeholder="Additional observations or advice..." />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider ml-1">
              <Pill className="w-4 h-4 text-primary-600" />
              Medications
            </h3>

            {fields.map((field, index) => (
              <Card key={field.id} className="relative overflow-visible">
                {fields.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => remove(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm z-10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <CardContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select 
                      label="Medicine" 
                      {...register(`medicines.${index}.medicineId`)} 
                      error={errors.medicines?.[index]?.medicineId?.message}
                    >
                      <option value="">Select medicine</option>
                      {availableMedicines?.map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.category})</option>
                      ))}
                    </Select>
                    <Input 
                      label="Dosage" 
                      {...register(`medicines.${index}.dosage`)} 
                      error={errors.medicines?.[index]?.dosage?.message}
                      placeholder="e.g. 500mg, 1 tablet" 
                    />
                    <Input 
                      label="Frequency" 
                      {...register(`medicines.${index}.frequency`)} 
                      error={errors.medicines?.[index]?.frequency?.message}
                      placeholder="e.g. 1-0-1, Every 8 hours" 
                    />
                    <Input
                      label="Duration (days)"
                      type="number"
                      min="1"
                      {...register(`medicines.${index}.durationDays`, { valueAsNumber: true })}
                      error={errors.medicines?.[index]?.durationDays?.message}
                    />
                    <Input
                      label="Quantity Prescribed"
                      type="number"
                      min="1"
                      {...register(`medicines.${index}.quantityPrescribed`, { valueAsNumber: true })}
                      error={errors.medicines?.[index]?.quantityPrescribed?.message}
                    />
                  </div>
                  <Input 
                    label="Instructions" 
                    {...register(`medicines.${index}.instructions`)} 
                    error={errors.medicines?.[index]?.instructions?.message}
                    placeholder="e.g. After meals, take with plenty of water" 
                  />
                </CardContent>
              </Card>
            ))}

            <Button 
              type="button" 
              variant="secondary" 
              className="w-full border-dashed py-4 border-slate-200 text-slate-500 hover:text-primary-600 hover:border-primary-200"
              onClick={() => append({ medicineId: '', dosage: '', frequency: '', durationDays: 1, quantityPrescribed: 1, instructions: '' })}
              icon={Plus}
            >
              Add Another Medicine
            </Button>
            
            {errors.medicines?.root && (
              <p className="text-sm text-red-500 text-center">{errors.medicines.root.message}</p>
            )}

            <div className="flex justify-end gap-3 pt-6">
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" isLoading={mutation.isPending} icon={Send}>Create & Send to Pharmacy</Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
