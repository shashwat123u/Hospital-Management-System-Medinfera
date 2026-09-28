import React from 'react';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { bedService } from '../../services/bedService';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Tabs } from '../../components/ui/Tabs';
import { EmptyState } from '../../components/ui/EmptyState';
import { Select } from '../../components/ui/Select';
import { useAuth } from '../../hooks/useAuth';

export const BedMapPage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canChangeStatus = ['SUPER_ADMIN', 'ADMIN', 'NURSE'].includes(user?.role);
  const { data: wards = [], isLoading: isWardsLoading, isError: isWardsError } = useQuery({
    queryKey: ['wards'],
    queryFn: async () => {
      const res = await bedService.getWards();
      return res.data.data;
    }
  });

  const wardBedQueries = useQueries({
    queries: wards.map(ward => ({
      queryKey: ['beds', 'ward', ward.id],
      queryFn: async () => {
        const res = await bedService.getAll({ wardId: ward.id, page: 1, limit: 100 });
        return res.data.data;
      },
    })),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ bedId, status }) => bedService.updateStatus(bedId, status),
    onSuccess: () => {
      toast.success('Bed status updated');
      queryClient.invalidateQueries({ queryKey: ['beds'] });
      queryClient.invalidateQueries({ queryKey: ['wards'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not update bed status'),
  });

  const generateBedGrid = (beds) => (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 p-4">
      {beds.map(bed => {
        const bgMap = {
          AVAILABLE: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100',
          OCCUPIED: 'bg-red-50 border-red-200 hover:bg-red-100',
          RESERVED: 'bg-amber-50 border-amber-200 hover:bg-amber-100',
          MAINTENANCE: 'bg-slate-50 border-slate-200 hover:bg-slate-100',
          BLOCKED: 'bg-slate-100 border-slate-300 hover:bg-slate-200',
        };
        const colorClass = bgMap[bed.status] || bgMap.AVAILABLE;

        return (
          <div key={bed.id} className={`rounded-xl border p-4 cursor-pointer transition-colors ${colorClass}`}>
            <p className="font-bold text-slate-800 text-lg">{bed.bedNumber}</p>
            {canChangeStatus ? (
              <Select
                aria-label={`Update bed ${bed.bedNumber} status`}
                className="mt-2 text-xs"
                value={bed.status}
                disabled={updateStatusMutation.isPending}
                onChange={(event) => updateStatusMutation.mutate({ bedId: bed.id, status: event.target.value })}
              >
                {(bed.status === 'OCCUPIED' ? ['OCCUPIED', 'MAINTENANCE'] : ['AVAILABLE', 'RESERVED', 'MAINTENANCE', 'BLOCKED']).map(status => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
              </Select>
            ) : <StatusBadge status={bed.status} className="mt-2 text-[10px]" />}
            {bed.status === 'OCCUPIED' && bed.ipdAdmissions?.[0]?.patient && (
              <p className="text-xs font-medium text-slate-700 mt-2 truncate">{bed.ipdAdmissions[0].patient.firstName} {bed.ipdAdmissions[0].patient.lastName}</p>
            )}
          </div>
        );
      })}
    </div>
  );

  const tabs = wards.map((ward, index) => ({
    id: ward.id,
    label: ward.name,
    content: generateBedGrid(wardBedQueries[index]?.data || []),
  }));
  const isLoading = isWardsLoading || wardBedQueries.some(query => query.isLoading);

  return (
    <div className="space-y-6">
      <PageHeader title="Bed Map" description="Live view of bed occupancy." />
      <div className="bg-white rounded-2xl border">
        {isWardsError ? (
          <p className="p-8 text-center text-sm text-red-600">Wards could not be loaded.</p>
        ) : isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading beds...</div>
        ) : tabs.length === 0 ? (
          <EmptyState title="No wards configured" description="Ward beds will appear here after wards are added." />
        ) : (
          <Tabs tabs={tabs} defaultTab={tabs[0].id} />
        )}
      </div>
    </div>
  );
};
