import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Hotel, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { bedService } from '../../services/bedService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatsCard } from '../../components/shared/StatsCard';
import { OccupancyChart } from '../../components/charts/OccupancyChart';
import { Skeleton } from '../../components/ui/Skeleton';

export const BedStatsPage = () => {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['beds', 'stats'],
    queryFn: async () => {
      const res = await bedService.getStats();
      return res.data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  const byWard = stats?.byWard || [];
  const totals = stats?.totals || {};
  const sumWardField = (field) => byWard.reduce((sum, ward) => sum + (ward[field] || 0), 0);
  const chartData = {
    available: totals.available || 0,
    occupied: totals.occupied || 0,
    reserved: sumWardField('reserved'),
    maintenance: sumWardField('maintenance'),
    blocked: sumWardField('blocked'),
  };

  if (isError) return <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">Bed statistics could not be loaded.</p>;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Bed Statistics" 
        description="Detailed analytics of hospital bed capacity and usage." 
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Capacity" 
          value={totals.totalBeds || 0} 
          icon={Hotel} 
          color="blue"
        />
        <StatsCard 
          title="Currently Available" 
          value={totals.available || 0} 
          icon={CheckCircle2} 
          color="emerald"
        />
        <StatsCard 
          title="Under Maintenance" 
          value={chartData.maintenance}
          icon={AlertTriangle} 
          color="amber"
        />
        <StatsCard 
          title="Occupancy Rate" 
          value={`${totals.occupancyRate || 0}%`} 
          icon={ShieldAlert} 
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Overall Distribution</h3>
          <OccupancyChart data={chartData} />
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Occupancy by Ward</h3>
          <div className="space-y-6">
            {byWard.length ? (
              byWard.map((ward) => (
                <div key={ward.id} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="font-semibold text-slate-900">{ward.wardName}</span>
                      <span className="text-xs text-slate-500 ml-2">{ward.wardType}</span>
                    </div>
                    <span className="text-sm font-medium text-slate-600">
                      {ward.occupied} / {ward.totalBeds} Beds
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        ward.occupancyRate > 80 ? 'bg-red-500' : 'bg-primary-500'
                      }`}
                      style={{ width: `${ward.occupancyRate}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : <p className="text-sm text-slate-500">No ward data is available.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
};
